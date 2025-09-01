<script setup>
import {useWebAppNavigation, useWebAppShare} from "vue-tg";
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import shareUrlInviteFriends from "~/functions/shareUrlFriendsInvite.js";
import showPopup from "~/functions/showPopup.js";
import Table from "~/frames/Friends/Table/table.vue";
import MainStyle from "./main.module.css"
import AnimationsMain from "./animations.module.css"
import Animation from "~/components/animation.vue";
import GenericStyle from "~/assets/css/generic.module.css"
import GenericAnimations from "~/assets/css/animations.module.css";
import Icon from "../../../components/Icon/icon.vue";
import toggleModal from "../../../functions/toggleModal.js";
import {useMutation} from "@vue/apollo-composable";
import {GET_FRIENDS} from "../../../queries.js";
import {useRouter} from "vue-router";
import BagMoneyIcon from "~/assets/images/bag-money-icon.svg";
import WalletIcon from "~/assets/images/wallet-icon.svg";
import MessagingIcon from "~/assets/images/messaging-icon.svg";
import FriendsIcon from "~/assets/images/friends-icon.svg";

const router = useRouter()

const store = useStore()
const user = computed(() => store.state.user)
const loading = ref(true)

const { mutate: mutateLoadFriends, onError: onErrorLoadFriends } = useMutation(
    GET_FRIENDS,
    () => {
      return {}
    },
    {
      fetchPolicy: 'no-cache',
    }
)

const load = async () => {
  if (store.state.friends_leagues_rewards.length > 0) return;
  const req = await mutateLoadFriends();
  if (!req || !req.data || !req.data.loadFriends) return
  const data = req.data.loadFriends;
  await store.dispatch('setFriendsLeaguesRewards', data.leagues);
  loading.value = false;
}

const webAppNavigation = useWebAppNavigation()
const webAppShare = useWebAppShare()

const inviteFriends = () => webAppNavigation.openTelegramLink(shareUrlInviteFriends(user.value.friend_code));
const copyUrl = () => {
  showPopup("info", "Invite link copied to clipboard");
  return navigator.clipboard.writeText(shareUrlInviteFriends(user.value.friend_code, false));
}

const telegramStory = () => {
  const inviteLink = import.meta.env.VITE_TELEGRAM_BOT + "/" + import.meta.env.VITE_TELEGRAM_WEBAPP_URI + "?startapp=" + user.value.friend_code,
      postText = (!user.value.is_premium ? "Earn $Tonomo together 👉" + inviteLink + "👈. " : "") + "Join us in an exciting adventure as we team up with Binance, Bybit, OKX, Bitget and ready for a powerful airdrop!"
  return webAppShare.shareToStory(
      import.meta.env.VITE_CDN_MAIN + "/telegram-story.jpg?v=1",
      {
        text: postText,
        ...(user.value.is_premium && {widget_link: {
          url: import.meta.env.VITE_TELEGRAM_BOT + "/" + import.meta.env.VITE_TELEGRAM_WEBAPP_URI + "?startapp=" + user.value.friend_code,
          name: "Earn $Tonomo"
        }})
      }
  );
}

onErrorLoadFriends(() => {
  router.push('/')
  return showPopup('error', "An error occurred while loading friends")
})

onMounted(() => load())
</script>

<template>
  <div :class="{ [MainStyle['friends']]: true }">
    <div :class="{ [GenericStyle['page-header']]: true }">
      <Animation name="page-header-title" :animation-style="GenericAnimations" :start-animation="true">
        <div :class="{ [GenericStyle['title']]: true }">
          <div
              :class="{ [GenericStyle['icon']]: true }"
              :style="{ backgroundImage: 'url(' + FriendsIcon + ')' }"
          />
          <span :class="{ [GenericStyle['text']]: true }">Friends</span>
        </div>
      </Animation>
      <Animation name="page-header-description" :animation-style="GenericAnimations" :start-animation="true">
        <div :class="{ [GenericStyle['description']]: true }">Invite friends, earn bonuses</div>
      </Animation>
    </div>
    <Animation name="friends-banner" :animation-style="AnimationsMain" :start-animation="true">
      <div :class="{ [MainStyle['banner']]: true }">
        <div :class="{ [MainStyle['title']]: true }">Invite friends and earn $Tonomo</div>
        <div :class="{ [MainStyle['description']]: true }">Get 3 $Tonomo for register a friend without premium or 15 $Tonomo if has premium.</div>
      </div>
    </Animation>
    <div :class="{ [MainStyle['features']]: true }">
      <Animation name="friends-features-1" :animation-style="AnimationsMain" :start-animation="true">
        <div :class="{ [MainStyle['item']]: true }">
          <div
              :class="{ [MainStyle['image']]: true }"
              :style="{ backgroundImage: 'url(' + MessagingIcon + ')' }"
          ></div>
          <div :class="{ [MainStyle['info']]: true }">
            <div :class="{ [MainStyle['name']]: true }">Share your invite link</div>
            <div :class="{ [MainStyle['description']]: true }">Invite friends and receive bonuses to $Tonomo</div>
          </div>
        </div>
      </Animation>
      <Animation name="friends-features-2" :animation-style="AnimationsMain" :start-animation="true">
        <div :class="{ [MainStyle['item']]: true }">
          <div
              :class="{ [MainStyle['image']]: true }"
              :style="{ backgroundImage: 'url(' + WalletIcon + ')' }"
          ></div>
          <div :class="{ [MainStyle['info']]: true }">
            <div :class="{ [MainStyle['name']]: true }">Airdrop bonus</div>
            <div :class="{ [MainStyle['description']]: true }">Get 5% with airdrop of your friends who receive it</div>
          </div>
        </div>
      </Animation>
      <Animation name="friends-features-3" :animation-style="AnimationsMain" :start-animation="true">
        <div :class="{ [MainStyle['item']]: true, [MainStyle['more']]: true }">
          <div :class="{ [MainStyle['left-block']]: true }">
            <div
                :class="{ [MainStyle['image']]: true }"
                :style="{ backgroundImage: 'url(' + BagMoneyIcon + ')' }"
            ></div>
            <div :class="{ [MainStyle['info']]: true }">
              <div :class="{ [MainStyle['name']]: true }">Friends upgrade league</div>
              <div :class="{ [MainStyle['description']]: true }">Get bonus for upgrading friends league</div>
            </div>
          </div>
          <button
              type="button"
              :class="{ [MainStyle['button']]: true }"
              @click="toggleModal('friends-leagues-rewards')"
          >
            More
          </button>
        </div>
      </Animation>
    </div>
    <Animation name="friends-invite" :animation-style="AnimationsMain" :start-animation="true">
      <div :class="{ [MainStyle['invite']]: true }">
        <div :class="{ [MainStyle['top-buttons']]: true }">
          <button type="button" :class="{ [MainStyle['button']]: true, [MainStyle['invite-share']]: true }" @click="inviteFriends">
            <Icon :class="{ [MainStyle['styled-icon']]: true }" name="friends-share-user" />
            <span :class="{ [MainStyle['name']]: true }">Invite friends</span>
          </button>
          <button type="button" :class="{ [MainStyle['button']]: true, [MainStyle['invite-copy']]: true }" @click="copyUrl">
            <Icon :class="{ [MainStyle['styled-icon']]: true }" name="copy" />
          </button>
        </div>
        <button type="button" :class="{ [MainStyle['button']]: true, [MainStyle['invite-story']]: true }" @click="telegramStory">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="share-cube" />
          <span :class="{ [MainStyle['name']]: true }">Post to Telegram story</span>
        </button>
      </div>
    </Animation>
    <Table />
  </div>
</template>