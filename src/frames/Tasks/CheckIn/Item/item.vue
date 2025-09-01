<script setup>
import ItemStyle from "./item.module.css"
import {useTonConnectModal, useTonConnectUI, useTonWallet} from "ton-ui-vue";
import AnimationsItem from "./animations.module.css"
import Animation from "~/components/animation.vue";
import getWalletInfo from "~/functions/getWalletInfo.js";
import {computed, inject, onBeforeMount, onUnmounted, ref, watch} from "vue";
import CircleLoader from "~/components/CircleLoader/circle-loader.vue";
import {useStore} from "vuex";
import showPopup from "../../../../functions/showPopup.js";
import SecondsToHMS from "../../../../functions/secondsToHMS.js";
import Icon from "../../../../components/Icon/icon.vue";
import HalloweenScaryIcon from "~/assets/images/halloween/scary.png";

const store = useStore()

const props = defineProps({
  itemId: Number,
  animationId: Number,
  type: String,
  title: String,
  reward: Number,
  info: Object,
  claim: Boolean,
  period: String
})

const tasksId = props.itemId + '-' + props.type;

const walletInfo = computed(() => getWalletInfo(props.info.app_name))

const { tonConnectUI } = useTonConnectUI();
const { open: openConnectModal } = useTonConnectModal();
const wallet = useTonWallet();

const showConnectionWindow = inject('tasks-check-in-exchange-connect-show');
const makeTransaction = inject('tasks-check-in-make-transaction');
const arrItemChangeClaim = inject('arr-item-change-claim')
const isNewConnection = ref(false);

const timerCheckInInterval = ref();
const timerSeconds = ref(0)

watch(() => ({ wallet: wallet.value, isNewConnection: isNewConnection.value }), async (newValues) => {
  if (newValues.wallet && newValues.isNewConnection) {
    isNewConnection.value = false;
    return await makeTransaction(props.itemId, props.type);
  }
});

const startCheckInTimer = () => {
  timerCheckInInterval.value = setInterval(() => {
    setCurrentTimer(props.info.end_timer);
    if (timerSeconds.value <= 0) {
      clearInterval(timerCheckInInterval.value);
      timerCheckInInterval.value = null;
      return arrItemChangeClaim(props.itemId, 'checkin', false);
    }
  }, 1000);
}

const setCurrentTimer = (end_time) => {
  const now = Math.floor(Date.now() / 1000),
      countdown = end_time - now;
  timerSeconds.value = countdown < 0 ? 0 : countdown;
}

const prepareTimer = () => {
  if (
      !props.claim ||
      props.period !== "day" ||
      timerCheckInInterval.value
  ) return;
  setCurrentTimer(props.info.end_timer);
  return startCheckInTimer()
}

const nextTimeCheckIn = computed(() => {
  return SecondsToHMS(timerSeconds.value);
})

const checkIn = async () => {
  if (store.state.tasks_id_pending) return showPopup('error', 'Wait for the previous task to check before starting a new task.');
  if (wallet.value) {
    if (props.info.app_name === "any") {
      return await makeTransaction(props.itemId, props.type);
    } else if (wallet.value.appName !== props.info.app_name) {
      await tonConnectUI.value?.disconnect()
      return showConnectionWindow(props.itemId);
    } else return await makeTransaction(props.itemId, props.type);
  }
  isNewConnection.value = true;
  if (props.info.app_name !== "any") {
    return await tonConnectUI.value?.openSingleWalletModal(props.info.app_name)
  } else return openConnectModal();
}

const animationItemMs = computed(() => {
  const ms = 100 + (props.animationId * 140) * 1.2;
  return ms >= 604 ? 688 : ms;
})

tonConnectUI.value.onSingleWalletModalStateChange((state) => {
  if (state.status === 'closed') {
    isNewConnection.value = false;
  }
});

watch(() => props.claim, () => prepareTimer());

onBeforeMount(() => prepareTimer())
onUnmounted(() => {
  if (timerCheckInInterval.value) {
    clearInterval(timerCheckInInterval.value);
    timerCheckInInterval.value = null;
  }
})
</script>

<template>
  <Animation
      name="item"
      :animation-style="AnimationsItem"
      :style="{ '--tasks-item-animation-ms': animationItemMs + 'ms' }"
      :start-animation="true"
  >
    <div :class="{ [ItemStyle['item']]: true, [ItemStyle['halloween']]: props.info.holiday === 'halloween', [ItemStyle['any-wallet']]: props.info.app_name === 'any' }">
      <div :class="{ [ItemStyle['left-blocks']]: true }">
        <div :class="{ [ItemStyle['exchange-icon']]: true }">
          <Icon v-if="props.info.app_name === 'any' && !props.info.holiday" :class="{ [ItemStyle['styled-icon']]: true }" name="wallet" />
          <img v-else-if="!props.info.holiday" :class="{ [ItemStyle['image']]: true }" :src="walletInfo.icon" />
          <img v-else-if="props.info.holiday === 'halloween'" :class="{ [ItemStyle['image']]: true }" :src="HalloweenScaryIcon" />
        </div>
        <div :class="{ [ItemStyle['info']]: true }">
          <span :class="{ [ItemStyle['title']]: true }">{{ props.title }}</span>
          <span :class="{ [ItemStyle['description']]: true }">Get {{ props.reward }} $Tonomo</span>
        </div>
      </div>
      <button
          type="button"
          :class="{
            [ItemStyle['button']]: true,
            [ItemStyle['button-success']]: props.period === 'once' && props.claim,
            [ItemStyle['button-flex-center']]: tasksId === store.state.tasks_id_pending || props.claim,
            [ItemStyle['button-loading']]: tasksId === store.state.tasks_id_pending
          }"
          :disabled="tasksId === store.state.tasks_id_pending || props.claim"
          @click="checkIn"
      >
         <template v-if="props.period === 'day'">
           <CircleLoader v-if="tasksId === store.state.tasks_id_pending" :width="18" :height="18" :border-size="3" line-color="rgba(255, 255, 255, .75)" full-color="rgba(88, 93, 110, .3)" />
           <span :class="{ [ItemStyle['name']]: true }" v-else>{{ !props.claim ? "Claim" : nextTimeCheckIn }}</span>
         </template>
        <template v-else>
          <CircleLoader v-if="tasksId === store.state.tasks_id_pending" :width="18" :height="18" :border-size="3" line-color="rgba(255, 255, 255, .75)" full-color="rgba(88, 93, 110, .3)" />
          <span v-else-if="!props.claim" :class="{ [ItemStyle['name']]: true }">Check in</span>
          <Icon :class="{ [ItemStyle['styled-icon']]: true }" name="circle-check" v-else />
        </template>
      </button>
    </div>
  </Animation>
</template>