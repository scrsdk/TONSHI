<script setup>
import MainStyle from "./check-in.module.css"
import Item from "./Item/item.vue";
import {computed, inject, onUnmounted, provide, reactive, ref} from "vue";
import AnimationsCheckIn from "./animations.module.css";
import Animation from "~/components/animation.vue";
import Connect from "~/frames/Tasks/CheckIn/connect.vue";
import {useTonConnectUI} from "ton-ui-vue";
import showPopup from "../../../functions/showPopup.js";
import {useStore} from "vuex";
import {useMutation} from "@vue/apollo-composable";
import {CHECK_TRANSACTION, START_TRANSACTION} from "../../../queries.js";
import {beginCell} from "ton-core";

const store = useStore()

const checkIn = inject('tasks-check-in')
const arrItemChangeClaim = inject('arr-item-change-claim')
const arrItemAddSecondsTimer = inject('arr-item-add-seconds-timer')
// const sortedCheckInItems = computed(() => checkIn.value.sort((a, b) => {
//   const is_timer = {a: a.info?.seconds > 0, b: b.info?.seconds > 0};
//   return a.claim - b.claim || is_timer.b - is_timer.a || a.info?.seconds - b.info?.seconds
// }))
const { tonConnectUI } = useTonConnectUI();

const exchangeConnect = reactive({
  active: false,
  itemId: null
})
const intervalCheckTransaction = ref()

const { mutate: mutateStartTransaction, onError: onErrorStartTransaction } = useMutation(START_TRANSACTION, {}, {fetchPolicy: 'no-cache'})
const { mutate: mutateCheckTransaction, onError: onErrorCheckTransaction } = useMutation(CHECK_TRANSACTION, {}, {fetchPolicy: 'no-cache'})

const makeTransaction = async (item_id, type) => {
  const tasksId = item_id + '-' + type;
  try {
    const req = await mutateStartTransaction({
      type: "tasks-checkin",
      item_id: item_id
    });
    if (!req || !req.data || !req.data.startTransaction) return
    const data = req.data.startTransaction
    const bodyPayload = beginCell()
        .storeUint(0, 32)
        .storeStringTail(data.transaction_unique)
        .endCell();
    const tonTransaction = await tonConnectUI.value.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          amount: String(data.amount),
          address: data.contract_address,
          payload: bodyPayload.toBoc().toString("base64"),
          lock: true
        }
      ]
    }, {
      modals: ['before'],
    });
    if (tonTransaction.boc) {
      await store.dispatch('setGlobalLoading', "Your transaction is being searched..")
      await store.dispatch('setTasksIdPending', tasksId);
      return await completeCheckIn(data.transaction_unique, item_id);
    }
  } catch (err) {
    await store.dispatch('setTasksIdPending', null);
    if (err.message.includes("Shop declined the request")) {
      showPopup('error', 'An error occurred while creating a transaction. Try relinking your wallet.')
    }
  }
}

const getCheckInItemById = (item_id) => {
  const findIndex = checkIn.value.findIndex(item => item.id === item_id)
  if (findIndex === -1) return;
  return checkIn.value[findIndex];
}

const completeCheckIn = async (unique, item_id) => {
  const complete = async (balance) => {
    const item = getCheckInItemById(item_id);
    arrItemChangeClaim(item_id, 'checkin');
    if (item.period === "day") {
      arrItemAddSecondsTimer(item_id, 'checkin', Math.floor(Date.now() / 1000) + 86399);
    }
    await store.dispatch('setGlobalLoading', null)
    await store.dispatch('setTasksIdPending', null);
    await store.dispatch("user/setUserBalance_Tonomo", balance.tonomo);
    await store.dispatch("user/setUserBalance_vTono", balance.vTono);
    return showPopup("success", "You got +" + item.reward + " $Tonomo!")
  }
  const check_interval = async () => {
    const req = await mutateCheckTransaction({
      transaction_unique: unique
    });
    if (!req || !req.data || !req.data.checkTransaction) return
    const data = req.data.checkTransaction;
    if (data.status) {
      clearInterval(intervalCheckTransaction.value);
      intervalCheckTransaction.value = null
      return complete(data.balance);
    }
  }
  intervalCheckTransaction.value = setInterval(() => check_interval(), 3000);
}

provide("tasks-check-in-make-transaction", makeTransaction)
provide("tasks-check-in-exchange-connect-show", (itemId) => {
  exchangeConnect.active = true;
  exchangeConnect.itemId = itemId;
})
provide("tasks-check-in-exchange-connect-close", () => {
  exchangeConnect.active = false;
  exchangeConnect.itemId = null;
})

onErrorStartTransaction((error) => {
  store.dispatch('setTasksIdPending', null);
  return showPopup("error", error.message)
})

onErrorCheckTransaction((error) => {
  store.dispatch('setTasksIdPending', null);
  return showPopup("error", error.message)
})

onUnmounted(() => {
  if (intervalCheckTransaction.value) {
    clearInterval(intervalCheckTransaction.value);
    intervalCheckTransaction.value = null
  }
})
</script>

<template>
  <Animation name="check-in" :animation-style="AnimationsCheckIn" :start-animation="true">
    <div :class="{ [MainStyle['tasks-check-in']]: true }">
      <div :class="{ [MainStyle['tasks-title']]: true }">Web3 Check-in</div>
      <div :class="{ [MainStyle['tasks-description']]: true }">Make 1 transaction on a cryptocurrency exchange via our app and get $Tonomo bonus</div>
      <div :class="{ [MainStyle['list-of-check-in']]: true }">
        <Item
            v-for="(item, key) of checkIn"
            :key="item.id"
            :animation-id="key + 1"
            :item-id="item.id"
            :type="item.type"
            :title="item.title"
            :reward="item.reward"
            :info="item.info"
            :claim="item.claim"
            :period="item.period"
        />
      </div>
    </div>
  </Animation>
  <Connect
      :active="exchangeConnect.active"
      :item-id="exchangeConnect.itemId"
  />
</template>