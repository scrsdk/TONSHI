<script setup>
import {onMounted, onUnmounted} from "vue";
import {useStore} from "vuex";
import MainStyle from "./main.module.css"
import Item from "../Item/item.vue";

const store = useStore()

onUnmounted(() => store.dispatch('modal/setModalRender', false))
onMounted(() => store.dispatch('modal/setModalRender', true))
</script>

<template>
  <div :class="{ [MainStyle['list-of-items']]: true }">
    <div :class="{ [MainStyle['body']]: true }">
      <Item
          v-for="(league, key) of store.state.friends_leagues_rewards"
          :key="key"
          :animation-id="key + 1"
          :type="league.type"
          :class="{
            [MainStyle['first-item']]: key === 0,
            [MainStyle['last-item']]: key === store.state.friends_leagues_rewards.length - 1
          }"
          :default="league.amount.default"
          :premium="league.amount.premium"
      />
    </div>
  </div>
</template>