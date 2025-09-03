<script setup>
import MainStyle from "./Main/main.module.css"
import {computed, inject} from "vue";
import CircleLoader from "~/components/CircleLoader/circle-loader.vue";

const appImages = inject('app-images')

const props = defineProps({
  state: Number
})

const descriptionLoadingText = computed(() => {
  if (props.state === 1) return "Initialize app"
  if (props.state === 2) {
    const appImagesCount = appImages.length,
        loadedAppImagesCount = appImages.filter(image => image.loaded).length;
    return `Загрузка ресурсов CDN (${loadedAppImagesCount}/${appImagesCount}) ${Math.trunc((loadedAppImagesCount / appImagesCount) * 100)}%`
  }
  if (props.state === 3) {
    const appCdnImagesCount = appImages.filter(image => image.cdn).length,
        loadedAppCdnImagesCount = appImages.filter(image => image.cdn && image.loaded).length;
    return `Загрузка ресурсов CDN (${loadedAppCdnImagesCount}/${appCdnImagesCount}) ${Math.trunc((loadedAppCdnImagesCount / appCdnImagesCount) * 100)}%`
  }
  return "Мы запускаем вашу информацию";
})
</script>

<template>
  <div :class="{ [MainStyle['loading-body']]: true }">
    <CircleLoader lineColor="#fff" :width="36" :height="36" :border-size="5" />
    <div :class="{ [$style['loading-text']]: true }">{{ descriptionLoadingText }}</div>
  </div>
</template>

<style module>
.loading-text {
  margin-top: 10px;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
  color: #ffffff90;
}
</style>