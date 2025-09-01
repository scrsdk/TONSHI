<script setup>
import ErrorStyle from "./error.module.css"
import {useWebApp} from "vue-tg";
import Animation from "~/components/animation.vue";
import AnimationsOverError from "./animations.module.css"

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: "error"
  },
  title: String,
  description: String,
  button: Object
})

const webApp = useWebApp()

const refreshPage = () => window.location.reload();
const closeApp = () => webApp.close()

const tap = () => {
  if (props.button.function === "reloadApp") return refreshPage()
  if (props.button.function === "closeApp") return closeApp()
}
</script>

<template>
  <Animation name="error" :animation-style="AnimationsOverError" :start-animation="true">
    <div :class="{ [ErrorStyle['game-error']]: true }">
      <div :class="{ [ErrorStyle['game-error-content']]: true }">
        <div :class="{ [ErrorStyle['info']]: true }">
          <div :class="{ [ErrorStyle['title']]: true, [ErrorStyle['type-' + props.icon]]: true }">
            <div :class="{ [ErrorStyle['image']]: true }"></div>
            <span :class="{ [ErrorStyle['text']]: true }">{{ props.title }}</span>
          </div>
          <div :class="{ [ErrorStyle['description']]: true }">{{ props.description }}</div>
        </div>
        <button
            type="button"
            :class="{
              [ErrorStyle['error-btn']]: true,
              [ErrorStyle['error-btn-' + props.button.type]]: true,
            }"
            @click="tap"
        >
          {{ props.button.name }}
        </button>
      </div>
    </div>
  </Animation>
</template>