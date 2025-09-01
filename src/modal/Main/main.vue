<script setup>
import Icon from "../../components/Icon/icon.vue";
import toggleModal from "~/functions/toggleModal.js";
import {useStore} from "vuex";
import {computed, watch} from "vue";
import {useRoute} from "vue-router";
import MainStyle from "./main.module.css"

/* ContentsHeader */
import FriendsLeaguesRewardsHeader from "../Friends/LeaguesRewards/header.vue"
import ShopBuyDonationHeader from "../Shop/BuyDonation/header.vue"

/* Contents */
import FriendsLeaguesRewardsModal from "../Friends/LeaguesRewards/Main/main.vue"
import ShopBuyDonationModal from "../Shop/BuyDonation/Main/main.vue"

const route = useRoute()
const store = useStore()
const modal = computed(() => store.state.modal)

watch(() => route.path, () => {
  if (modal.value.active) {
    toggleModal()
  }
})
</script>

<template>
  <div
      v-if="modal.active"
      :data-current-modal="modal.selected"
      :class="{ [MainStyle['bottom-modal']]: true }"
  >
    <div
        :class="{
            [MainStyle['bottom-modal-container']]: true,
            [MainStyle['container-visible']]: !modal.closeAnimation && modal.render,
            [MainStyle['container-hidden']]: modal.closeAnimation,
        }"
    >
      <div :class="{ [MainStyle['bottom-modal-header']]: true }">
        <FriendsLeaguesRewardsHeader v-if="modal.selected === 'friends-leagues-rewards'" />
        <ShopBuyDonationHeader v-else-if="modal.selected === 'shop-buy-donation'" />
        <button type="button" :class="{ [MainStyle['bottom-modal-header-exit']]: true }" @click="() => toggleModal()">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="close" />
        </button>
      </div>
      <div :class="{ [MainStyle['bottom-modal-body']]: true }">
        <div :class="{ [MainStyle['bottom-modal-content']]: true }">
          <FriendsLeaguesRewardsModal v-if="modal.selected === 'friends-leagues-rewards'" v-bind="modal.props" />
          <ShopBuyDonationModal v-else-if="modal.selected === 'shop-buy-donation'" v-bind="modal.props" />
        </div>
      </div>
    </div>
    <div
        :class="{
          [MainStyle['bottom-modal-backdrop']]: true,
          [MainStyle['backdrop-visible']]: !modal.closeAnimation && modal.render,
          [MainStyle['backdrop-hidden']]: modal.closeAnimation
        }"
        @click="() => toggleModal()"
    ></div>
  </div>
</template>