<script setup>
import WalletStyle from "./wallet.module.css"
import Icon from "~/components/Icon/icon.vue";
import AnimationsMain from "./animations.module.css";
import Animation from "~/components/animation.vue";
import {useTonAddress, useTonConnectModal, useTonConnectUI, useTonWallet} from "ton-ui-vue";
import {computed} from "vue";
import getWalletInfo from "~/functions/getWalletInfo.js";

const { open: openTonModal } = useTonConnectModal();
const address = useTonAddress();
const tonUi = useTonConnectUI()
const wallet = useTonWallet();

const walletInfo = computed(() => getWalletInfo(wallet.value.appName))

const connectButton = () => {
  if (address.value) return;
  return openTonModal();
}

const disconnectWallet = () => {
  tonUi.tonConnectUI.value?.disconnect()
}
</script>

<template>
  <Animation name="tasks-wallet" :animation-style="AnimationsMain" :start-animation="true">
    <div :class="{ [WalletStyle['tasks-wallet']]: true}">
      <div :class="{ [WalletStyle['wallet-icon']]: true }" v-if="wallet">
        <img :class="{ [WalletStyle['exchange-icon']]: true }" :src="walletInfo.icon" />
      </div>
      <button type="button" :class="{ [WalletStyle['button-wallet']]: true, [WalletStyle['wallet-connected']]: wallet !== null }" @click="connectButton">
        <Icon :class="{ [WalletStyle['styled-icon']]: true}" name="wallet" />
        <span :class="{ [WalletStyle['name']]: true}">{{ !address ? 'Connect wallet' : (address.substring(0, 18) + '...') }}</span>
      </button>
      <button
          v-if="wallet"
          type="button"
          :class="{ [WalletStyle['button-logout']]: true }"
          @click="disconnectWallet"
      >
        <Icon :class="{ [WalletStyle['styled-icon']]: true }" name="logout" />
      </button>
    </div>
  </Animation>
</template>