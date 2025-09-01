<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import LandscapeErrorStyle from "~/components/LandscapeError/landscape-error.module.css";

const isPortrait = ref(window.matchMedia("(orientation: portrait)").matches);

const updateOrientation = () => {
  isPortrait.value = window.matchMedia("(orientation: portrait)").matches;
}

defineExpose({
  isPortrait
});

const mediaQuery = window.matchMedia("(orientation: portrait)");

onMounted(() => {
  mediaQuery.addEventListener("change", updateOrientation);
});

onBeforeUnmount(() => {
  mediaQuery.removeEventListener("change", updateOrientation);
});
</script>

<template>
  <div :class="{ [LandscapeErrorStyle['landscape-error']]: true }" v-if="!isPortrait">
    <span :class="{ [LandscapeErrorStyle['text']]: true }">Switch the device to portrait mode</span>
  </div>
</template>