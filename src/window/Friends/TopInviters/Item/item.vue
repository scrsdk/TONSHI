<script setup>
import Icon from "~/components/Icon/icon.vue";
import {integerSpaces} from "../../../../functions/numberSpaces.js";
import ItemStyle from "./item.module.css"
import NoImage from "~/assets/images/no-image.png";
import {useStore} from "vuex";
import {computed} from "vue";
import GenericStyle from "~/assets/css/generic.module.css";

const props = defineProps({
  place: Number,
  userId: Number,
  avatar: String,
  name: String,
  friends: Number,
  earned: Number
})

const store = useStore()
const user = computed(() => store.state.user)
</script>

<template>
  <div :class="{ [ItemStyle['item']]: true, [ItemStyle['my-item']]: user.id === props.userId }">
    <div :class="{ [ItemStyle['left-block']]: true }">
      <div :class="{ [ItemStyle['place']]: true }" :data-place="props.place">
        <Icon v-if="props.place <= 3" :class="{ [ItemStyle['place-medal']]: true }" :name="'medal-' + (props.place === 1 ? 'gold' : (props.place === 2 ? 'silver' : 'bronze'))" />
        <span v-else :class="{ [ItemStyle['num']]: true }">{{ place }}</span>
      </div>
      <div :class="{ [ItemStyle['avatar']]: true }" :style="{ backgroundImage: `url(${props.avatar}), url(${NoImage})` }"></div>
      <div :class="{ [ItemStyle['info']]: true }">
        <div :class="{ [ItemStyle['name']]: true, [GenericStyle['text-overflow-80']]: true }">{{ props.name }}</div>
        <div :class="{ [ItemStyle['friends-text']]: true }">
          <span :class="{ [ItemStyle['count']]: true }">{{ integerSpaces(props.friends) }}</span> friends
        </div>
      </div>
    </div>
    <div :class="{ [ItemStyle['amount-value']]: true }">
      <div :class="{ [ItemStyle['amount']]: true }">
        <span :class="{ [ItemStyle['value']]: true }">{{ integerSpaces(props.earned) }}</span>
      </div>
      <Icon :class="{ [ItemStyle['styled-icon']]: true }" name="tonomo-coin" />
    </div>
  </div>
</template>