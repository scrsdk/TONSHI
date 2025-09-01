<script setup>
import MainStyle from "./global-loading.module.css";
import {useStore} from "vuex";
import {computed} from "vue";
import CircleLoader from "../CircleLoader/circle-loader.vue";

const store = useStore()
const globalLoading = computed(() => store.state.global_loading)
</script>

<template>
  <div :class="{ [MainStyle['global-loading']]: true }">
    <CircleLoader
        :class="{ [MainStyle['some-loader']]: true }"
        :border-size="5"
        :width="40"
        :height="40"
        line-color="#fff"
        full-color="#18181F"
    />
    <div :class="{ [MainStyle['info']]: true }">
      <span :class="{ [MainStyle['message']]: true }">{{ globalLoading.message }}</span>
      <span :class="{ [MainStyle['warning-message']]: true }">Please do not close the application.</span>
    </div>
  </div>
</template>