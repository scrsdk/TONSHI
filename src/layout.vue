<script setup>
import BottomMenu from './components/BottomMenu/bottom-menu.vue'
import {computed, ref, watch, provide} from "vue";
import {useRoute} from "vue-router";
import {useStore} from "vuex";
import DonationHelper from "./components/DonationHelper/donation-helper.vue";

const gameContainer = ref()
provide('layout-scroll', {
  top: () => {
    gameContainer.value.scrollTop = 0;
  },
  bottom: () => {
    gameContainer.value.scrollTop = 9999;
  }
})

const store = useStore()

const route = useRoute()
const disabledScroll = computed(() => {
  if (
      route.path === "/" ||
      route.path === "/shop"
  ) return true
  return false
})

watch(() => route.path, () => {
  gameContainer.value.scrollTop = 0;
  if (!store.state.changed_router) {
    store.dispatch('setChangedRouter', true);
  }
})
</script>

<template>
  <div
      :class="{
        [$style['game-container']]: true,
        [$style['game-disabled-scroll']]: disabledScroll
      }"
      ref="gameContainer"
  >
    <div :class="{ [$style['game-content']]: true }">
      <router-view></router-view>
    </div>
    <BottomMenu />
  </div>
</template>

<style module>
.game-container {
  background-color: #0B0B0E;
  height: 100%;
  width: 100%;
  max-height: calc(100% - calc(55.5px + var(--main-offset-bottom)));
}
.game-content {
  height: 100%;
  margin: 0 15px;
  width: calc(100% - 28px);
}
.game-container:not(.game-disabled-scroll) {
  overflow-y: auto;
  overflow-x: hidden;
}
.game-container::-webkit-scrollbar {
  display: none;
}
</style>