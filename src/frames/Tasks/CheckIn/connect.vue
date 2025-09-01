<script setup>
import ConnectStyle from "./connect.module.css"
import AnimationsCheckIn from "~/frames/Tasks/CheckIn/animations.module.css";
import Animation from "~/components/animation.vue";
import {computed, inject, ref, watch} from "vue";
import getWalletInfo from "~/functions/getWalletInfo.js";
import Icon from "~/components/Icon/icon.vue";
import {useTonConnectUI, useTonWallet} from "ton-ui-vue";

const props = defineProps({
  active: Boolean,
  itemId: Number
})

const { tonConnectUI } = useTonConnectUI();
const wallet = useTonWallet();

const checkIn = inject('tasks-check-in')
const makeTransaction = inject('tasks-check-in-make-transaction')
const closeConnectionWindow = inject('tasks-check-in-exchange-connect-close');
const isNewConnection = ref(false)

const checkInInfo = computed(() => {
  const findIndex = checkIn.value.findIndex(item => item.id === props.itemId)
  if (findIndex === -1) return;
  return checkIn.value[findIndex];
});

const walletInfo = computed(() => getWalletInfo(checkInInfo.value.info.app_name))

watch(() => ({ wallet: wallet.value, isNewConnection: isNewConnection.value }), async (newValues) => {
  if (newValues.wallet && newValues.isNewConnection) {
    closeConnection();
    return await makeTransaction(props.itemId, checkInInfo.value.type);
  }
});

const walletConnect = async () => {
  if (wallet.value) {
    await tonConnectUI.value?.disconnect()
  }
  isNewConnection.value = true;
  return await tonConnectUI.value?.openSingleWalletModal(checkInInfo.value.info.app_name)
}

tonConnectUI.value.onSingleWalletModalStateChange((state) => {
  if (state.status === 'closed') {
    isNewConnection.value = false;
  }
});

const closeConnection = () => {
  isNewConnection.value = false;
  return closeConnectionWindow();
}
</script>

<template>
  <Animation name="connect-wallet" :animation-style="AnimationsCheckIn" :start-animation="true">
    <div :class="{ [ConnectStyle['connect-wallet']]: true }" v-if="props.active">
      <div :class="{ [ConnectStyle['connect-foreground']]: true }" @click="closeConnection"></div>
      <Animation name="connect-wallet-block" :animation-style="AnimationsCheckIn" :start-animation="true">
        <div :class="{ [ConnectStyle['content-block']]: true }">
          <button type="button" :class="{ [ConnectStyle['close-content']]: true }" @click="closeConnection">
            <Icon :class="{ [ConnectStyle['styled-icon']]: true }" name="close" />
          </button>
          <div :class="{ [ConnectStyle['title']]: true }">
            <img :class="{ [ConnectStyle['image']]: true }" :src="walletInfo.icon" />
            <span :class="{ [ConnectStyle['text']]: true }">{{ walletInfo.name }}</span>
          </div>
          <div :class="{ [ConnectStyle['description']]: true }">Please use the {{ walletInfo.name }} wallet to complete this task.</div>
          <button type="button" :class="{ [ConnectStyle['button-connect']]: true }" @click="walletConnect">Connect {{ walletInfo.name }} wallet</button>
        </div>
      </Animation>
    </div>
  </Animation>
</template>