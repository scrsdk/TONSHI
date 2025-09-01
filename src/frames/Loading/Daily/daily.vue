<script setup>
import Icon from "~/components/Icon/icon.vue";
import {useStore} from "vuex";
import {computed} from "vue";
import MainStyle from "../Main/main.module.css"
import DailyStyle from "./daily.module.css"
import AnimationsDaily from "./animations.module.css"
import Animation from "~/components/animation.vue";
import toggleDonationHelper from "../../../functions/toggleDonationHelper.js";

const store = useStore()
const dailyRewards = computed(() => store.state.user.available_daily_rewards)

const claim = async () => await toggleDonationHelper(
    "Would you like to receive up to x2 from the bonus?",
    {name: "claim-daily-bonus"},
    [
      {type: 'free', text: 'x1'},
      {type: 'checkin', text: 'x1.2'},
      {type: 'donate', text: 'x2'},
    ]
);
</script>

<template>
  <div :class="{ [MainStyle['loading-body']]: true }">
    <div :class="{ [DailyStyle['loading-body-after']]: true }"></div>
    <div :class="{ [DailyStyle['loading-daily-content']]: true }">
      <div :class="{ [DailyStyle['loading-daily-header']]: true }">
        <Animation name="loading-daily-icon" :animation-style="AnimationsDaily" :start-animation="true">
          <div :class="{ [DailyStyle['loading-daily-icon']]: true }"></div>
        </Animation>
        <Animation name="loading-daily-title" :animation-style="AnimationsDaily" :start-animation="true">
          <div :class="{ [DailyStyle['loading-daily-title']]: true }">Your daily rewards</div>
        </Animation>
      </div>
      <div :class="{ [DailyStyle['loading-daily-rewards']]: true }">
        <div :class="{ [DailyStyle['loading-daily-rewards-list']]: true }">
          <Animation name="loading-daily-amount" :animation-style="AnimationsDaily" :start-animation="true">
            <div :class="{ [DailyStyle['loading-daily-amount']]: true }">
              <Icon :class="{ [DailyStyle['styled-icon']]: true }" name="tonomo-coin" />
              <div :class="{ [DailyStyle['amount']]: true }">{{ dailyRewards.amount.tonomo }}</div>
              <div :class="{ [DailyStyle['name']]: true }">$Tonomo</div>
            </div>
          </Animation>
          <Animation name="loading-daily-amount" :animation-style="AnimationsDaily" :start-animation="true">
            <div :class="{ [DailyStyle['loading-daily-amount']]: true }">
              <Icon :class="{ [DailyStyle['styled-icon']]: true }" name="tonomo-gray-coin-text-white" />
              <div :class="{ [DailyStyle['amount']]: true }">{{ dailyRewards.amount.vTono }}</div>
              <div :class="{ [DailyStyle['name']]: true }">$vTono</div>
            </div>
          </Animation>
        </div>
        <Animation name="loading-daily-text" :animation-style="AnimationsDaily" :start-animation="true">
          <div :class="{ [DailyStyle['loading-daily-text']]: true }">
            <span>Come back tomorrow to get x2 $Tonomo</span>
            <span>Tip: Skipping a day resets your progress.</span>
          </div>
        </Animation>
      </div>
    </div>
    <Animation name="loading-bottom" :animation-style="AnimationsDaily" :start-animation="true">
      <div :class="{ [DailyStyle['loading-bottom']]: true }">
        <button type="button" :class="{ [DailyStyle['loading-button']]: true }" @click="claim">Continue</button>
      </div>
    </Animation>
  </div>
</template>