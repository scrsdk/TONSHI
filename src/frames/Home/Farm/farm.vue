<script setup>
import AnimationsHome from "./animations.module.css";
import FarmStyle from "./farm.module.css";
import secondsToHMS from "../../../functions/secondsToHMS.js";
import {useStore} from "vuex";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import toggleDonationHelper from "../../../functions/toggleDonationHelper.js";
import Animation from "../../../components/animation.vue";
import Icon from "../../../components/Icon/icon.vue";
import CountUp from "vue-countup-v3";
import { Odometer } from "odometer_countup";

const props = defineProps({
  loading: Boolean
})

const store = useStore()
const user = computed(() => store.state.user)

const intervalTimerFarming = ref()
const timerSeconds = ref(0)

const currentFarmingProgress = computed(() => {
  if (!user.value.current_farm.unique) return 0;
  const timer = user.value.current_farm.wait_time - timerSeconds.value;
  return (timer / user.value.current_farm.wait_time) * 100;
})

const currentFarmingEarned = computed(() => {
  if (!user.value.current_farm.unique) return 0;
  const timer = user.value.current_farm.wait_time - timerSeconds.value;
  return parseFloat(Number(user.value.current_farm.earn_per_second) * timer).toFixed(2);
})

const currentStatusFarming = computed(() => timerSeconds.value > 0)

const toggleFarm = async () => {
  if (props.loading) return;
  if (
      !currentStatusFarming.value &&
      user.value.current_farm.unique !== null
  ) return toggleDonationHelper(
      "Would you like to increase your farming to x2?",
      {name: "claim-farming"},
      [
        {type: 'free', text: 'x1'},
        {type: 'checkin', text: 'x1.2'},
        {type: 'donate', text: 'x2'},
      ]
  );
  return toggleDonationHelper(
      "Would you like to reduce your farming to 12h?",
      {name: "start-farming"},
      [
        {type: 'free', text: '24h'},
        {type: 'checkin', text: '19h 12m'},
        {type: 'donate', text: '12h'},
      ]
  );
}

const startTimer = () => {
  const interval = () => {
    setCurrentTimer(user.value.current_farm.end_timer);
    if (timerSeconds.value <= 0) {
      clearInterval(intervalTimerFarming.value);
      intervalTimerFarming.value = null;
    }
  }
  interval();
  if (intervalTimerFarming.value) {
    clearInterval(intervalTimerFarming.value);
    intervalTimerFarming.value = null;
  }
  intervalTimerFarming.value = setInterval(interval,1000);
}

const setCurrentTimer = (end_time) => {
  const now = Math.floor(Date.now() / 1000),
      countdown = end_time - now;
  timerSeconds.value = countdown < 0 ? 0 : countdown;
}

const prepareTimer = (end_time) => {
  setCurrentTimer(end_time);
  return startTimer()
}

watch(() => user.value.current_farm.end_timer, (newValue) => prepareTimer(newValue))

onMounted(() => {
  prepareTimer(user.value.current_farm.end_timer);
})
onUnmounted(() => {
  if (intervalTimerFarming.value) {
    clearInterval(intervalTimerFarming.value);
    intervalTimerFarming.value = null;
  }
})
</script>

<template>
  <Animation name="home-farm-button" :animation-style="AnimationsHome" :start-animation="true">
    <button
        type="button"
        :class="{
          [FarmStyle['league-farm-button']]: true,
          [FarmStyle['button-success-farm']]: !props.loading && !currentStatusFarming && user.current_farm.unique !== null,
          [FarmStyle['button-name-flex']]: !props.loading && ((!currentStatusFarming || currentStatusFarming) && user.current_farm.unique !== null)
        }"
        :disabled="props.loading || (currentStatusFarming && user.current_farm.unique !== null)"
        @click="toggleFarm"
    >
      <template v-if="!props.loading">
        <div :class="{ [FarmStyle['league-farm-progress']]: true }" v-if="user.current_farm.unique !== null" :style="{ width: `${currentFarmingProgress}%` }"></div>
        <div :class="{ [FarmStyle['name']]: true }" v-if="!user.current_farm.unique">Start farming</div>
        <div :class="{ [FarmStyle['name']]: true }" v-else>
          {{ currentStatusFarming ? 'Farming' : 'Take income' }}
          <Icon :name="currentStatusFarming ? 'tonomo-gray-coin-text-dark' : 'tonomo-white-coin'" :class="{ [FarmStyle['styled-icon']]: true }" />
          <count-up
              :class="{ [FarmStyle['amount']]: true }"
              :end-val="currentFarmingEarned"
              :start-val="(!currentStatusFarming || currentFarmingEarned < user.current_farm.earn_per_second) ? currentFarmingEarned : currentFarmingEarned - user.current_farm.earn_per_second"
              :decimalPlaces="2"
              :options="{ plugin: new Odometer({ duration: 0.4, lastDigitDelay: 0 }) }"
          />
        </div>
        <div :class="{ [FarmStyle['time']]: true }" v-if="currentStatusFarming && user.current_farm.unique !== null">{{ secondsToHMS(timerSeconds) }}</div>
      </template>
      <div :class="{ [FarmStyle['name']]: true }" v-else>Loading...</div>
    </button>
  </Animation>
</template>