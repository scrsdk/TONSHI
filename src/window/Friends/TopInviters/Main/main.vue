<script setup>
import MainStyle from "./main.module.css"
import Icon from "../../../../components/Icon/icon.vue";
import {useWebAppNavigation} from "vue-tg";
import shareUrlInviteFriends from "../../../../functions/shareUrlFriendsInvite.js"
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import showPopup from "../../../../functions/showPopup.js";
import {GET_TOP_INVITERS} from "../../../../queries.js";
import toggleWindow from "../../../../functions/toggleWindow.js";
import CircleLoader from "../../../../components/CircleLoader/circle-loader.vue";
import {useLazyQuery} from "@vue/apollo-composable";
import Item from "../Item/item.vue";
import AnimationsMain from "./animations.module.css";
import Animation from "../../../../components/animation.vue";

const store = useStore()
const user = computed(() => store.state.user)

const loading = ref(true)
const list = ref([])

const webAppNavigation = useWebAppNavigation()

const inviteFriends = () => webAppNavigation.openTelegramLink(shareUrlInviteFriends(user.value.friend_code));
const copyUrl = () => {
  showPopup("info", "Invite link copied to clipboard");
  return navigator.clipboard.writeText(shareUrlInviteFriends(user.value.friend_code, false));
}

const { load: getTopInviters, onError: onErrorGetTopInviters } = useLazyQuery(
    GET_TOP_INVITERS,
    {},
    {
      fetchPolicy: 'no-cache',
    }
)

const load = async () => {
  const req = await getTopInviters();
  if (!req || !req.topInviters) return
  const data = req.topInviters;
  list.value = data;
  loading.value = false;
}

onErrorGetTopInviters(async () => {
  await toggleWindow();
  return showPopup('error', "An error occurred while loading top 300 inviters")
})

onMounted(() => load())
</script>

<template>
  <div :class="{ [MainStyle['top-inviters']]: true }">
    <div :class="{ [MainStyle['header']]: true }">
      <Animation name="top-inviters-header-image" :animation-style="AnimationsMain" :start-animation="true">
        <div :class="{ [MainStyle['image-icon']]: true }"></div>
      </Animation>
      <div :class="{ [MainStyle['info']]: true }">
        <Animation name="top-inviters-header-title" :animation-style="AnimationsMain" :start-animation="true">
          <span :class="{ [MainStyle['title']]: true }">Top 300 inviters</span>
        </Animation>
        <Animation name="top-inviters-header-description" :animation-style="AnimationsMain" :start-animation="true">
          <span :class="{ [MainStyle['description']]: true }">Invite more friends to get here</span>
        </Animation>
      </div>
    </div>
    <Animation name="top-inviters-invite" :animation-style="AnimationsMain" :start-animation="true">
      <div :class="{ [MainStyle['invite']]: true }">
        <button type="button" :class="{ [MainStyle['button']]: true, [MainStyle['invite-share']]: true }" @click="inviteFriends">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="friends-share-user" />
          <span :class="{ [MainStyle['name']]: true }">Invite friends</span>
        </button>
        <button type="button" :class="{ [MainStyle['button']]: true, [MainStyle['invite-copy']]: true }" @click="copyUrl">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="copy" />
        </button>
      </div>
    </Animation>
    <Animation name="top-inviters-content" :animation-style="AnimationsMain" :start-animation="true">
      <div :class="{ [MainStyle['content']]: true }">
        <div :class="{ [MainStyle['content-body']]: true }">
          <Animation name="top-inviters-show-content" v-if="loading" :animation-style="AnimationsMain" :start-animation="true">
            <div :class="{ [MainStyle['content-loading']]: true }">
              <CircleLoader :width="46" :height="46" :border-size="6" />
            </div>
          </Animation>
          <div :class="{ [MainStyle['content-items']]: true, [MainStyle['content-items-visible']]: !loading }">
            <Item
                v-for="(item, key) of list"
                :class="{ [MainStyle['first-item']]: key === 0 }"
                :key="key"
                :place="key + 1"
                :user-id="item.user.id"
                :avatar="item.user.avatar"
                :name="item.user.name"
                :friends="item.friends"
                :earned="item.earned"
            />
          </div>
        </div>
      </div>
    </Animation>
  </div>
</template>