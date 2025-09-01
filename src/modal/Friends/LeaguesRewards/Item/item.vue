<script setup>
import ItemStyle from "./item.module.css";
import Icon from "../../../../components/Icon/icon.vue";
import {computed} from "vue";
import {integerSpaces} from "../../../../functions/numberSpaces.js";
import AnimationsItem from "./animations.module.css";
import Animation from "../../../../components/animation.vue";
import getLeagueInfo from "../../../../functions/getLeagueInfo.js";

const props = defineProps({
  animationId: Number,
  type: String,
  default: Number,
  premium: Number
})

const leagueInfo = computed(() => getLeagueInfo(props.type))
</script>

<template>
  <Animation
      name="item"
      :animation-style="AnimationsItem"
      :style="{ '--modal-friends-leagues-rewards-item-animation-ms': 100 + (props.animationId * 100) * 1.2 + 'ms' }"
      :start-animation="true"
  >
    <div :class="{ [ItemStyle['item']]: true }" :data-league="leagueInfo.name.split(' ')[0].toLowerCase()">
      <div :class="{ [ItemStyle['info']]: true }">
        <div :class="{ [ItemStyle['league-icon']]: true }" :style="{ backgroundImage: `url(${leagueInfo.icon})` }" />
        <span :class="{ [ItemStyle['name']]: true }">{{ leagueInfo.name.split(' ')[0] }}</span>
      </div>
      <div :class="{ [ItemStyle['rewards']]: true }">
        <div :class="{ [ItemStyle['reward']]: true }">
          <div :class="{ [ItemStyle['amount']]: true }">
            <span :class="{ [ItemStyle['small-text']]: true }">Without Premium got</span>
            <span :class="{ [ItemStyle['value']]: true }">{{ integerSpaces(props.default) }}</span>
          </div>
          <Icon :class="{ [ItemStyle['styled-icon']]: true }" name="tonomo-coin" />
        </div>
        <div :class="{ [ItemStyle['reward']]: true }">
          <div :class="{ [ItemStyle['amount']]: true }">
            <span :class="{ [ItemStyle['small-text']]: true }">With Premium got</span>
            <span :class="{ [ItemStyle['value']]: true }">{{ integerSpaces(props.premium) }}</span>
          </div>
          <Icon :class="{ [ItemStyle['styled-icon']]: true }" name="tonomo-coin" />
        </div>
      </div>
    </div>
  </Animation>
</template>