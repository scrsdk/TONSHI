<script setup>
import Icon from "~/components/Icon/icon.vue";
import {integerSpaces} from "../../../../functions/numberSpaces.js";
import ItemStyle from "./item.module.css"
import NoImage from "~/assets/images/no-image.png";
import AnimationsItem from "./animations.module.css";
import Animation from "../../../../components/animation.vue";
import {computed} from "vue";
import getLeagueInfo from "../../../../functions/getLeagueInfo.js";
import GenericStyle from "~/assets/css/generic.module.css";

const props = defineProps({
  animationId: Number,
  animationRender: Boolean,
  avatar: String,
  name: String,
  amount: Number,
  league: Object
})

const currentLeague = computed(() => getLeagueInfo(props.league.type));
</script>

<template>
  <Animation
      name="item"
      :animation-style="AnimationsItem"
      :style="{ '--friends-item-animation-ms': 100 + (props.animationId * 100) * 1.5 + 'ms' }"
      :start-animation="!props.animationRender"
  >
    <div :class="{ [ItemStyle['user-item']]: true }">
      <div :class="{ [ItemStyle['left-block']]: true }">
        <div :class="{ [ItemStyle['avatar']]: true }" :style="{ backgroundImage: `url(${props.avatar}), url(${NoImage})` }"></div>
        <div :class="{ [ItemStyle['info']]: true }">
          <div :class="{ [ItemStyle['name']]: true, [GenericStyle['text-overflow-200']]: true }">{{ props.name }}</div>
          <div :class="{ [ItemStyle['league']]: true }">
            <div :class="{ [ItemStyle['league-icon']]: true }">
              <div :class="{ [ItemStyle['league-image']]: true }" :style="{ backgroundImage: `url(${currentLeague.icon})` }"></div>
            </div>
            <span :class="{ [ItemStyle['league-name']]: true }">{{ currentLeague.name }}</span>
          </div>
        </div>
      </div>
      <div :class="{ [ItemStyle['amount-value']]: true }">
        <div :class="{ [ItemStyle['amount']]: true }">
          <span :class="{ [ItemStyle['small-text']]: true }">You got</span>
          <span :class="{ [ItemStyle['value']]: true }">{{ integerSpaces(props.amount) }}</span>
        </div>
        <Icon :class="{ [ItemStyle['styled-icon']]: true }" name="tonomo-coin" />
      </div>
    </div>
  </Animation>
</template>