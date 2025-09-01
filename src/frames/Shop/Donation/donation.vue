<script setup>
import DonationStyle from "./donation.module.css"
import AnimationsStyle from "./animations.module.css"
import Icon from "../../../components/Icon/icon.vue";
import {computed, onUnmounted, ref, watch, inject, onBeforeMount} from "vue";
import Animation from "../../../components/animation.vue";
import {useStore} from "vuex";
import {useMutation} from "@vue/apollo-composable";
import {CHECK_TRANSACTION, CLAIM_FREE_DONATION, START_TRANSACTION} from "../../../queries.js";
import showPopup from "../../../functions/showPopup.js";
import {beginCell} from "ton-core";
import {useTonConnectModal, useTonConnectUI, useTonWallet} from "ton-ui-vue";
import CircleLoader from "../../../components/CircleLoader/circle-loader.vue";
import SecondsToHMS from "../../../functions/secondsToHMS.js";
import toggleModal from "../../../functions/toggleModal.js";

const props = defineProps({
  animationId: Number,
  isCheckIn: Boolean,
  isFree: Boolean,
  itemId: Number,
  image: String,
  amount: Number,
  endTimer: Number,
  limit: String,
  price: Number
});

const store = useStore()
const modal = computed(() => store.state.modal)

const { tonConnectUI } = useTonConnectUI();
const { open: openTonModal } = useTonConnectModal();
const wallet = useTonWallet();

const arrItemAddSecondsEndTimer = inject("arr-item-add-seconds-end-timer")

const intervalCheckTransaction = ref()
const timerLimitDayInterval = ref();
const loading = ref(false)
const seconds = ref(0)
const isNewConnection = ref(false)

const { mutate: mutateStartTransaction, onError: onErrorStartTransaction } = useMutation(
    START_TRANSACTION,
    () => {
      return {}
    },
    {
      fetchPolicy: 'no-cache',
    }
)
const { mutate: mutateCheckTransaction, onError: onErrorCheckTransaction } = useMutation(CHECK_TRANSACTION, {}, {fetchPolicy: 'no-cache'})
const { mutate: mutateClaimFreeDonation, onError: onErrorClaimFreeDonation } = useMutation(CLAIM_FREE_DONATION, {}, {fetchPolicy: 'no-cache'})

const animationItemMs = computed(() => {
  const ms = 100 + (props.animationId * 140) * 1.1;
  return ms >= 604 ? 688 : ms;
});

const makeCheckIn = async () => {
  try {
    const req = await mutateStartTransaction({
      type: props.isCheckIn ? "donations-checkin" : "donations-default",
      item_id: props.itemId
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
      await store.dispatch('setGlobalLoading', "Your transaction is being searched..")
      await setLoading();
      return await completeCheckIn(data.transaction_unique);
    }
  } catch (err) {
    await setLoading(false);
    if (err.message.includes("Shop declined the request")) {
      showPopup('error', 'An error occurred while creating a transaction. Try relinking your wallet.')
    }
  }
}

const completeCheckIn = async (unique) => {
  const complete = async (balance) => {
    if (props.limit === "day") {
      arrItemAddSecondsEndTimer(props.itemId, Math.floor(Date.now() / 1000) + 86399);
    }
    await setLoading(false);
    await store.dispatch("user/setUserBalance_Tonomo", balance.tonomo);
    await store.dispatch("user/setUserBalance_vTono", balance.vTono);
    return showPopup("success", "You got +" + props.amount + " $vTono!")
  }
  const check_interval = async () => {
    const req = await mutateCheckTransaction({
      transaction_unique: unique
    });
    if (!req || !req.data || !req.data.checkTransaction) return
    const data = req.data.checkTransaction;
    if (data.status) {
      clearInterval(intervalCheckTransaction.value);
      intervalCheckTransaction.value = null
      await store.dispatch('setGlobalLoading', null)
      return complete(data.balance);
    }
  }
  intervalCheckTransaction.value = setInterval(() => check_interval(), 3000);
}

const setLoading = async (status = true) => {
  await store.dispatch('setDonationsIdPending', !status ? null : props.itemId);
  loading.value = status;
}

const makeFree = async () => {
  await setLoading();
  const req = await mutateClaimFreeDonation({
    donation_id: props.itemId
  });
  if (!req || !req.data || !req.data.claimFreeDonation) return
  const data = req.data.claimFreeDonation;
  if (props.limit === "day") {
    arrItemAddSecondsEndTimer(props.itemId, Math.floor(Date.now() / 1000) + 86399);
  }
  await store.dispatch("user/setUserBalance_Tonomo", data.balance.tonomo);
  await store.dispatch("user/setUserBalance_vTono", data.balance.vTono);
  await setLoading(false);
  return showPopup("success", "You got +" + props.amount + " $vTono!");
}

const makeStars = () => {
  if (modal.value.active) return;
  return toggleModal("shop-buy-donation", {
    donation_id: props.itemId,
  });
}

watch(() => ({ wallet: wallet.value, isNewConnection: isNewConnection.value }), async (newValues) => {
  if (newValues.wallet && newValues.isNewConnection) {
    isNewConnection.value = false;
    return await makeCheckIn();
  }
});

const submit = async () => {
  if (
      store.state.donations_id_pending === props.itemId ||
      loading.value ||
      seconds.value > 0
  ) return;
  if (store.state.donations_id_pending) return showPopup('error', 'Wait for the previous donation to check before starting a new donation.');
  if (props.isCheckIn) {
    if (!wallet.value) {
      isNewConnection.value = true;
      return openTonModal();
    }
    return await makeCheckIn();
  }
  if (props.isFree) {
    return await makeFree();
  }
  return await makeStars();
}

const startLimitDayTimer = () => {
  timerLimitDayInterval.value = setInterval(() => {
    setCurrentTimer(props.endTimer);
    if (seconds.value <= 0) {
      clearInterval(timerLimitDayInterval.value);
      timerLimitDayInterval.value = null;
    }
  }, 1000);
}

const setCurrentTimer = (end_time) => {
  const now = Math.floor(Date.now() / 1000),
      countdown = end_time - now;
  seconds.value = countdown < 0 ? 0 : countdown;
}

const prepareTimer = () => {
  if (
      props.limit !== "day" ||
      timerLimitDayInterval.value
  ) return;
  setCurrentTimer(props.endTimer);
  return startLimitDayTimer()
}

const nextTimeLimitDay = computed(() => {
  return SecondsToHMS(seconds.value);
})

watch(() => props.endTimer, (newValue) => {
  prepareTimer(newValue)
});

onErrorStartTransaction(async (error) => {
  await setLoading(false);
  return showPopup("error", error.message)
})

onErrorCheckTransaction(async (error) => {
  await setLoading(false);
  return showPopup("error", error.message)
})

onErrorClaimFreeDonation(async (error) => {
  await setLoading(false);
  return showPopup("error", error.message)
})

onBeforeMount(() => prepareTimer())
onUnmounted(async () => {
  if (intervalCheckTransaction.value) {
    clearInterval(intervalCheckTransaction.value);
    intervalCheckTransaction.value = null
  }
  if (!props.isCheckIn) {
    await setLoading(false);
  }
});
</script>

<template>
  <Animation
      name="item"
      :animation-style="AnimationsStyle"
      :style="{ '--donations-item-animation-ms': animationItemMs + 'ms' }"
      :start-animation="true"
  >
    <div
        :class="{
          [DonationStyle['item']]: true,
          [DonationStyle['check-in']]: props.isCheckIn,
          [DonationStyle['free']]: props.isFree,
        }"
        @click="submit"
    >
      <div :class="{ [DonationStyle['loading-content']]: true }" v-if="store.state.donations_id_pending === props.itemId || loading">
        <CircleLoader :border-size="5" :width="36" :height="36" />
      </div>
      <div :class="{ [DonationStyle['timer-content']]: true }" v-if="seconds > 0">
        <span :class="{ [DonationStyle['name']]: true }">Next:</span>
        <span :class="{ [DonationStyle['time']]: true }">{{ nextTimeLimitDay }}</span>
      </div>
      <div :class="{ [DonationStyle['body']]: true }">
        <div :class="{ [DonationStyle['image-content']]: true }">
          <div :class="{ [DonationStyle['image']]: true }" :style="{ backgroundImage: 'url(' + props.image + ')' }"></div>
        </div>
        <div :class="{ [DonationStyle['info']]: true }">
          <div :class="{ [DonationStyle['name']]: true }"><span :class="{ [DonationStyle['value']]: true }">{{ props.amount }}</span> $vTono</div>
          <div :class="{ [DonationStyle['price']]: true }">
            <span v-if="!props.isCheckIn">{{ props.price === 0 ? 'Free' : '$ ' + props.price }}</span>
            <div v-else-if="props.isCheckIn" :class="{ [DonationStyle['check-in']]: true }">
              <Icon :class="{ [DonationStyle['styled-icon']]: true }" name="crypto-ton" />
              <span>Claim</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Animation>
</template>