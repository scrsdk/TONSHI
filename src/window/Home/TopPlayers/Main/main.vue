<script setup>
import MainStyle from "./main.module.css"
import Icon from "../../../../components/Icon/icon.vue";
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import showPopup from "../../../../functions/showPopup.js";
import toggleWindow from "../../../../functions/toggleWindow.js";
import CircleLoader from "../../../../components/CircleLoader/circle-loader.vue";
import {useMutation} from "@vue/apollo-composable";
import Item from "../Item/item.vue";
import AnimationsMain from "./animations.module.css";
import Animation from "../../../../components/animation.vue";
import getLeagueInfo from "../../../../functions/getLeagueInfo.js";
import {GET_TOP_PLAYERS} from "../../../../queries.js";

const store = useStore()
const leagues = computed(() => store.state.leagues)
const user = computed(() => store.state.user)

const loading = ref(true)
const firstRequest = ref(true)
const myCurrentLeague = ref(user.value.league.type)
const myPlace = ref({
  table: true,
  place: 0
})
const currentLeague = ref(user.value.league.type)
const list = ref([])
const content = ref(null)

const { mutate: mutateGetTopPlayers, onError: onErrorGetTopPlayers } = useMutation(
    GET_TOP_PLAYERS,
    () => {
      return {
        variables: {
          league: currentLeague.value,
          startup: firstRequest.value
        },
      }
    },
    {
      fetchPolicy: 'no-cache',
    }
)

const load = async () => {
  const req = await mutateGetTopPlayers();
  if (!req || !req.data || !req.data.loadTopPlayers) return
  const data = req.data.loadTopPlayers;
  await store.dispatch('user/setUserBalance_Tonomo', data.balance.tonomo);
  await store.dispatch('user/setUserBalance_vTono', data.balance.vTono);
  content.value.scrollTop = 0;
  await store.dispatch('user/setUserLeague', data.my_league);
  list.value = data.list;
  myCurrentLeague.value = data.my_league.type;
  if (firstRequest.value) {
    currentLeague.value = data.my_league.type;
    firstRequest.value = false;
  }
  myPlace.value = data.my_place;
  loading.value = false;
}

const leagueNumber = (name) => {
  switch (name) {
    case "bronze":
      return 1;
    case "silver":
      return 2;
    case "copper":
      return 3;
    case "platinum":
      return 4;
    case "gold":
      return 5;
    case "master":
      return 6;
    default:
      return 1;
  }
}

const swipeLeagueName = (type) => {
  switch (currentLeague.value) {
    case "bronze":
      return type === "next" ? "silver" : null;
    case "silver":
      return type === "next" ? "copper" : "bronze";
    case "copper":
      return type === "next" ? "platinum" : "silver";
    case "platinum":
      return type === "next" ? "gold" : "copper";
    case "gold":
      return type === "next" ? "master" : "platinum";
    case "master":
      return type === "next" ? null : "gold";
    default:
      return "silver";
  }
}

const leagueProgress = computed(() => store.state.leagues.find(league => league.type === currentLeague.value))
const leagueInfo = computed(() => getLeagueInfo(currentLeague.value))

const stringLeagueProgress = computed(() => {
  if (myCurrentLeague.value === currentLeague.value) return user.value.balance.tonomo + (currentLeague.value !== "master" ? "/" + (Number(leagueProgress.value.progress.to) + 1) : "") + " $Tonomo";
  if (currentLeague.value === "master") return "from " + leagueProgress.value.progress.from + " $Tonomo"
  return "from " + leagueProgress.value.progress.from + " $Tonomo to " + (Number(leagueProgress.value.progress.to) + 1) + " $Tonomo"
})

const leagueLinePercent = computed(() => {
  const myNumLeague = leagueNumber(myCurrentLeague.value),
      windowNumLeague = leagueNumber(currentLeague.value);
  if (myCurrentLeague.value === currentLeague.value) {
    if (currentLeague.value !== "master") {
      return Math.floor((user.value.balance.tonomo / (Number(leagueProgress.value.progress.to) + 1)) * 100);
    } else return 100;
  }
  if (myNumLeague > windowNumLeague) return 100;
  return 0;
})

const goNextLeague = async () => {
  if (loading.value || currentLeague.value === 'master') return;
  const nextLeague = swipeLeagueName('next');
  currentLeague.value = !nextLeague ? leagues.value[0].type : nextLeague;
  loading.value = true;
  return await load();
}

const goPrevLeague = async () => {
  if (loading.value || currentLeague.value === 'bronze') return;
  const prevLeague = swipeLeagueName('prev');
  currentLeague.value = !prevLeague ? leagues.value[leagues.value.length - 1].type : prevLeague;
  loading.value = true;
  return await load();
}

onErrorGetTopPlayers(async () => {
  await toggleWindow();
  return showPopup('error', "An error occurred while loading top players")
})

onMounted(() => load())
</script>

<template>
  <div :class="{ [MainStyle['top-players']]: true }">
    <div :class="{ [MainStyle['header']]: true }">
      <Animation name="top-players-header-image" :animation-style="AnimationsMain" :start-animation="true">
        <div :class="{ [MainStyle['league']]: true }" :data-current-league="currentLeague">
          <div :class="{ [MainStyle['arrow']]: true, [MainStyle['arrow-left']]: true, [MainStyle['arrow-disabled']]: currentLeague === 'bronze' }" @click="goPrevLeague">
            <Icon :class="{ [MainStyle['styled-icon']]: true }" name="top-arrow-left" />
          </div>
          <div :class="{ [MainStyle['image-icon']]: true }" :style="{ backgroundImage: `url(${leagueInfo.icon})` }"></div>
          <div :class="{ [MainStyle['arrow']]: true, [MainStyle['arrow-right']]: true, [MainStyle['arrow-disabled']]: currentLeague === 'master' }" @click="goNextLeague">
            <Icon :class="{ [MainStyle['styled-icon']]: true }" name="top-arrow-right" />
          </div>
        </div>
      </Animation>
      <div :class="{ [MainStyle['info']]: true }">
        <Animation name="top-players-header-title" :animation-style="AnimationsMain" :start-animation="true">
          <span :class="{ [MainStyle['title']]: true }">{{ leagueInfo.name }}</span>
        </Animation>
        <Animation name="top-players-header-description" :animation-style="AnimationsMain" :start-animation="true">
          <div :class="{ [MainStyle['progress']]: true }">
            <span :class="{ [MainStyle['name']]: true }">{{ stringLeagueProgress }}</span>
            <div :class="{ [MainStyle['line']]: true, [MainStyle['line-success']]: leagueLinePercent === 100, [MainStyle['line-opacity']]: leagueLinePercent === 0 && myCurrentLeague !== currentLeague }">
              <div :class="{ [MainStyle['line-width']]: true }" :style="{ width: leagueLinePercent + '%' }"></div>
            </div>
          </div>
        </Animation>
      </div>
    </div>
    <Animation name="top-players-content" :animation-style="AnimationsMain" :start-animation="true">
      <div :class="{ [MainStyle['content']]: true }" ref="content">
        <div :class="{ [MainStyle['content-body']]: true }">
          <Animation name="top-players-show-content" v-if="loading" :animation-style="AnimationsMain" :start-animation="true">
            <div :class="{ [MainStyle['content-loading']]: true }">
              <CircleLoader :width="46" :height="46" :border-size="6" />
            </div>
          </Animation>
          <div :class="{ [MainStyle['content-items']]: true, [MainStyle['content-items-visible']]: !loading }">
            <template v-if="list.length > 0">
              <Item
                  v-for="(item, key) of list"
                  :class="{ [MainStyle['first-item']]: key === 0 }"
                  :key="key"
                  :place="key + 1"
                  :user-id="item.user.id"
                  :avatar="item.user.avatar"
                  :name="item.user.name"
                  :balance="item.balance"
              />
              <Item
                  v-if="!myPlace.table && myCurrentLeague === currentLeague && !loading"
                  :key="list.length"
                  :place="myPlace.place"
                  :user-id="user.id"
                  :avatar="user.avatar"
                  :name="user.name"
                  :balance="user.balance.tonomo"
              />
            </template>
            <template v-else>
              <div :class="{ [MainStyle['list-empty']]: true }">
                <Animation name="top-players-empty-list-title" :animation-style="AnimationsMain" :start-animation="true">
                  <Icon :class="{ [MainStyle['styled-icon']]: true }" name="smile-sad" />
                </Animation>
                <Animation name="top-players-empty-list-description" :animation-style="AnimationsMain" :start-animation="true">
                  <span :class="{ [MainStyle['text']]: true }">The list of players in {{ leagueInfo.name }} is empty</span>
                </Animation>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Animation>
  </div>
</template>