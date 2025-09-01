<script setup>
import MainStyle from "./main.module.css"
import AnimationsMain from "./animations.module.css"
import GenericStyle from "~/assets/css/generic.module.css"
import GenericAnimations from "~/assets/css/animations.module.css";
import Animation from "../../../components/animation.vue";
import Icon from "../../../components/Icon/icon.vue";
import {useStore} from "vuex";
import {computed, onMounted, onUnmounted, provide, ref} from "vue";
import {integerSpaces} from "../../../functions/numberSpaces.js";
import Donation from "../Donation/donation.vue";
import {useLazyQuery} from "@vue/apollo-composable";
import {GET_DONATIONS, GET_MY_BALANCE} from "../../../queries.js";
import showPopup from "../../../functions/showPopup.js";
import {useRouter} from "vue-router";
import CircleLoader from "../../../components/CircleLoader/circle-loader.vue";
import CartIcon from "~/assets/images/cart-icon.svg";

const store = useStore()
const router = useRouter()
const user = computed(() => store.state.user)

const loading = ref(true)
const items = ref([])

const { load: getDonations, onError: onErrorGetDonations } = useLazyQuery(
    GET_DONATIONS,
    {},
    {
      fetchPolicy: 'no-cache',
    }
)

const { load: getMyBalance, onError: onErrorGetMyBalance } = useLazyQuery(
    GET_MY_BALANCE,
    {},
    {
      fetchPolicy: 'no-cache',
    }
)

provide('arr-item-add-seconds-end-timer', (donation_id, end_timer = 86400) => {
  const findIndex = items.value.findIndex(item => item.id === donation_id);
  if (findIndex === -1) return;
  items.value[findIndex].end_timer = end_timer;
})

const loadBalance = async () => {
  const req = await getMyBalance();
  if (!req || !req.balance) return
  const data = req.balance;
  await store.dispatch('user/setUserBalance_Tonomo', data.tonomo);
  return await store.dispatch('user/setUserBalance_vTono', data.vTono);
}

const loadItems = async () => {
  const req = await getDonations();
  if (!req || !req.donations) return
  const data = req.donations;
  items.value = data;
  loading.value = false;
  return await loadBalance();
}

onErrorGetDonations(() => {
  router.push('/')
  return showPopup('error', "An error occurred while loading donations")
})

onErrorGetMyBalance(() => showPopup('error', "There was an error loading your current balance"))

onMounted(() => loadItems())
onUnmounted(() => store.dispatch('setDonationsIdPending', null))
</script>

<template>
  <div :class="{ [MainStyle['shop']]: true }">
    <div :class="{ [GenericStyle['page-header']]: true }">
      <Animation name="page-header-title" :animation-style="GenericAnimations" :start-animation="true">
        <div :class="{ [GenericStyle['title']]: true }">
          <div
              :class="{ [GenericStyle['icon']]: true }"
              :style="{ backgroundImage: 'url(' + CartIcon + ')' }"
          ></div>
          <span :class="{ [GenericStyle['text']]: true }">Shop</span>
        </div>
      </Animation>
      <Animation name="page-header-description" :animation-style="GenericAnimations" :start-animation="true">
        <div :class="{ [GenericStyle['description']]: true }">Buy $vTono for fast $Tonomo farming</div>
      </Animation>
    </div>
    <div :class="{ [MainStyle['shop-content']]: true }">
      <div :class="{ [MainStyle['donations-loading']]: true }" v-if="loading">
        <CircleLoader :border-size="6" :width="40" :height="40" />
      </div>
      <template v-else>
        <Animation name="shop-balance" :animation-style="AnimationsMain" :start-animation="true">
          <div :class="{ [MainStyle['shop-balance']]: true }">
            <div :class="{ [MainStyle['balance-body']]: true }">
              <span :class="{ [MainStyle['title']]: true }">Balance:</span>
              <div :class="{ [MainStyle['block']]: true }">
                <Icon :class="{ [MainStyle['styled-icon']]: true }" name="tonomo-gray-coin-text-white" />
                <span :class="{ [MainStyle['value']]: true }">{{ integerSpaces(user.balance.vTono) }}</span>
              </div>
            </div>
          </div>
        </Animation>
        <Animation name="donations-list" :animation-style="AnimationsMain" :start-animation="true">
          <div :class="{ [MainStyle['list-of-donations']]: true }">
            <Donation
                v-for="(item, key) of items"
                :is-free="item.type === 2"
                :is-check-in="item.type === 1"
                :item-id="item.id"
                :animation-id="key + 1"
                :image="item.image"
                :amount="item.vTono"
                :limit="item.limit"
                :end-timer="Number(item.end_timer)"
                :price="Number(item.price)"
            />
          </div>
        </Animation>
      </template>
    </div>
  </div>
</template>