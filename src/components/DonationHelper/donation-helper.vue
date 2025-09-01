<script setup>
import MainStyle from "./donation-helper.module.css"
import Icon from "../Icon/icon.vue";
import {integerSpaces} from "../../functions/numberSpaces.js";
import {useStore} from "vuex";
import {computed, ref, watch} from "vue";
import AnimationsMain from "./animations.module.css";
import Animation from "../animation.vue";
import toggleDonationHelper from "../../functions/toggleDonationHelper.js";
import {useRouter} from "vue-router";
import {beginCell} from "ton-core";
import showPopup from "../../functions/showPopup.js";
import {useLazyQuery, useMutation} from "@vue/apollo-composable";
import {
  CHECK_TRANSACTION,
  CLAIM_DAILY_REWARDS,
  CLAIM_FARMING, GET_MY_BALANCE,
  START_FARMING,
  START_TRANSACTION
} from "../../queries.js";
import {useTonConnectModal, useTonConnectUI, useTonWallet} from "ton-ui-vue";
import CircleLoader from "../CircleLoader/circle-loader.vue";

const store = useStore()
const router = useRouter()
const donation_helper = computed(() => store.state.donation_helper)
const preloader = computed(() => store.state.preloader)
const user = computed(() => store.state.user)

const { tonConnectUI } = useTonConnectUI();
const { open: openTonModal } = useTonConnectModal();
const wallet = useTonWallet();

const intervalCheckTransaction = ref()
const isNewConnection = ref(false)
const disabledButtons = ref(false)
const loadingCheckIn = ref(false)

const { mutate: mutateStartTransaction, onError: onErrorStartTransaction } = useMutation(
    START_TRANSACTION,
    () => {
      return {}
    },
    {
      fetchPolicy: 'no-cache',
    }
)
const { mutate: mutateCheckTransaction, onError: onErrorCheckTransaction } = useMutation(
    CHECK_TRANSACTION,
    {},
    {
      fetchPolicy: 'no-cache'
    }
)

/* Callback requests */
const { mutate: mutateStartFarming, onError: onErrorStartFarming } = useMutation(START_FARMING, {}, {fetchPolicy: 'no-cache'})
const { mutate: mutateClaimFarming, onError: onErrorClaimFarming } = useMutation(CLAIM_FARMING, {}, {fetchPolicy: 'no-cache'})
const { mutate: mutateClaimDailyRewards, onError: onErrorClaimDailyRewards } = useMutation(CLAIM_DAILY_REWARDS, {}, {fetchPolicy: 'no-cache'})

const makeCheckIn = async () => {
  try {
    const req = await mutateStartTransaction({
      type: "boost-checkin"
    });
    if (!req || !req.data || !req.data.startTransaction) return
    const data = req.data.startTransaction
    const bodyPayload = beginCell()
        .storeUint(0, 32)
        .storeStringTail(data.transaction_unique)
        .endCell();
    const tonTransaction = await tonConnectUI.value.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          amount: String(data.amount),
          address: data.contract_address,
          payload: bodyPayload.toBoc().toString("base64"),
          lock: true
        }
      ]
    }, {
      modals: ['before'],
    });
    if (tonTransaction.boc) {
      disabledButtons.value = true;
      loadingCheckIn.value = true;
      return await completeCheckIn(data.transaction_unique);
    }
  } catch (err) {
    loadingCheckIn.value = false;
    if (err.message.includes("Shop declined the request")) {
      showPopup('error', 'An error occurred while creating a transaction. Try relinking your wallet.')
    }
  }
}

const completeCheckIn = async (unique) => {
  const check_interval = async () => {
    const req = await mutateCheckTransaction({
      transaction_unique: unique
    });
    if (!req || !req.data || !req.data.checkTransaction) return
    const data = req.data.checkTransaction;
    if (data.status) {
      clearInterval(intervalCheckTransaction.value);
      intervalCheckTransaction.value = null
      return callback({
        ton_transaction_unique_boost: unique
      });
    }
  }
  intervalCheckTransaction.value = setInterval(() => check_interval(), 3000);
}

const startFarming = async (body) => {
  const req = await mutateStartFarming(body);
  if (!req || !req.data || !req.data.startFarming) return;
  const data = req.data.startFarming;
  await store.dispatch('user/setUserBalance_Tonomo', data.current_balance.tonomo);
  await store.dispatch('user/setUserBalance_vTono', data.current_balance.vTono);
  await store.dispatch('user/setUserCurrentFarm', {
    unique: data.unique,
    wait_time: data.wait_time,
    earn_per_second: data.earn_per_second,
    end_timer: data.end_timer
  });
  return toggleDonationHelper();
}

const claimFarming = async (body) => {
  const req = await mutateClaimFarming(body);
  if (!req || !req.data || !req.data.claimFarming) return;
  const data = req.data.claimFarming;
  await store.dispatch("user/setUserBalance_Tonomo", data.current_balance.tonomo)
  await store.dispatch("user/setUserBalance_vTono", data.current_balance.vTono)
  await store.dispatch('user/setUserLeague', data.league);
  await store.dispatch('user/clearUserCurrentFarm');
  await toggleDonationHelper();
  return showPopup("success", "You got +" + data.total_amount + " $Tonomo!");
}

const claimDailyBonus =  async (body) => {
  const req = await mutateClaimDailyRewards(body);
  if (!req || !req.data | !req.data.claimDailyRewards) return
  const data = req.data.claimDailyRewards;
  await store.dispatch("user/setUserBalance_Tonomo", data.current_balance.tonomo)
  await store.dispatch("user/setUserBalance_vTono", data.current_balance.vTono)
  await toggleDonationHelper();
  await store.dispatch('preloader/setPreloader', false)
  return await store.dispatch('user/setUserAvailableDailyRewards', {status: false, amount: 0})
}

const callback = async (body = {}) => {
  switch (donation_helper.value.callback.name) {
    case "start-farming":
      return await startFarming(body);
    case "claim-farming":
      return await claimFarming(body);
    case "claim-daily-bonus":
      return await claimDailyBonus(body);
  }
}

watch(() => ({ wallet: wallet.value, isNewConnection: isNewConnection.value }), async (newValues) => {
  if (newValues.wallet && newValues.isNewConnection) {
    isNewConnection.value = false;
    return await makeCheckIn();
  }
});

const submit = (type) => {
  if (
      disabledButtons.value ||
      (type === 'donate' && user.value.balance.vTono < 50)
  ) return;
  switch (type) {
    case "free":
      disabledButtons.value = true;
      return callback();
    case "checkin":
      if (!wallet.value) {
        isNewConnection.value = true;
        return openTonModal();
      }
      return makeCheckIn();
    case "donate":
      disabledButtons.value = true;
      return callback({is_vtono_boost: true});
  }
}

const goToShop = async () => {
  if (disabledButtons.value) return;
  await router.push("/shop")
  return toggleDonationHelper();
}

const closeWindow = () => {
  if (disabledButtons.value) return;
  return toggleDonationHelper();
}

onErrorStartTransaction((error) => {
  disabledButtons.value = false;
  loadingCheckIn.value = false;
  return showPopup("error", error.message)
})

onErrorCheckTransaction((error) => {
  disabledButtons.value = false;
  loadingCheckIn.value = false;
  return showPopup("error", error.message)
})

onErrorStartFarming((error) => {
  toggleDonationHelper();
  return showPopup("error", error.message)
})

onErrorClaimFarming((error) => {
  toggleDonationHelper();
  return showPopup("error", error.message)
})

onErrorClaimDailyRewards((error) => {
  toggleDonationHelper();
  return showPopup("error", error.message)
})
</script>

<template>
  <div :class="{ [MainStyle['donation-helper']]: true }">
    <Animation name="donation-helper-content" :animation-style="AnimationsMain" :start-animation="true">
      <div
          v-if="!donation_helper.closeAnimation"
          :class="{ [MainStyle['donation-content']]: true }"
      >
        <button type="button" :class="{ [MainStyle['close-content']]: true }" :disabled="disabledButtons" @click="closeWindow">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="close" />
        </button>
        <div :class="{ [MainStyle['donation-body']]: true }">
          <div :class="{ [MainStyle['vtono-balance']]: true }">
            <div :class="{ [MainStyle['balance-body']]: true }">
              <span :class="{ [MainStyle['title']]: true }">Balance:</span>
              <div :class="{ [MainStyle['block']]: true }">
                <Icon :class="{ [MainStyle['styled-icon']]: true }" name="tonomo-gray-coin-text-white" />
                <span :class="{ [MainStyle['value']]: true }">{{ integerSpaces(user.balance.vTono) }}</span>
              </div>
              <button type="button" :class="{ [MainStyle['button-add']]: true }" v-if="!preloader.status" :disabled="disabledButtons" @click="goToShop">
                <Icon :class="{ [MainStyle['styled-icon']]: true }" name="plus" />
              </button>
            </div>
          </div>
          <div :class="{ [MainStyle['content']]: true }">
            <div :class="{ [MainStyle['image']]: true }"></div>
            <span :class="{ [MainStyle['name']]: true }">{{ donation_helper.title }}</span>
          </div>
          <div :class="{ [MainStyle['row-buttons']]: true }">
            <div
                :class="{ [MainStyle['button-group']]: true }"
                v-for="(button, key) of donation_helper.buttons"
                :key="key"
            >
              <button
                  type="button"
                  :class="{
                    [MainStyle['button']]: true,
                    [MainStyle['button-disabled']]: disabledButtons || (button.type === 'donate' && user.balance.vTono < 50),
                    [MainStyle[button.type === 'donate' ? 'button-green' : (button.type === 'checkin' ? 'button-primary' : 'button-default')]]: true
                  }"
                  @click="() => submit(button.type)"
              >
                <CircleLoader :border-size="3" :width="19" :height="19" v-if="button.type === 'checkin' && loadingCheckIn" />
                <template v-else>
                  {{ button.text }}
                </template>
              </button>
              <div :class="{ [MainStyle['info']]: true }">
                <span :class="{ [MainStyle['name']]: true }" v-if="button.type === 'free'">Free</span>
                <template v-else-if="button.type === 'checkin'">
                  <Icon :class="{ [MainStyle['styled-icon']]: true }" name="crypto-ton" />
                  <span :class="{ [MainStyle['name']]: true }">Claim</span>
                </template>
                <template v-else-if="button.type === 'donate'">
                  <Icon :class="{ [MainStyle['styled-icon']]: true }" name="tonomo-gray-coin-text-white" />
                  <span :class="{ [MainStyle['name']]: true }">50</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Animation>
    <Animation name="donation-helper-backdrop" :animation-style="AnimationsMain" :start-animation="true">
      <div
          v-if="!donation_helper.closeAnimation"
          :class="{ [MainStyle['donation-backdrop']]: true }"
          @click="closeWindow"
      ></div>
    </Animation>
  </div>
</template>