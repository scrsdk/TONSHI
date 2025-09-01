<script setup>
import { useStore } from 'vuex'
import { computed, onMounted, ref } from 'vue'
import Icon from '~/components/Icon/icon.vue'
import { integerSpaces } from '../../../functions/numberSpaces.js'
import MainStyle from './main.module.css'
import AnimationsHome from './animations.module.css'
import Animation from '~/components/animation.vue'
import NoImage from '~/assets/images/no-image.png'
import { useLazyQuery } from '@vue/apollo-composable'
import {
	GET_CURRENT_FARM,
	GET_HOME_INFO,
	GET_MY_BALANCE,
} from '../../../queries.js'
import showPopup from '../../../functions/showPopup.js'
import getLeagueInfo from '../../../functions/getLeagueInfo.js'
import numberWithSuffix from '../../../functions/numberWithSuffix.js'
import toggleWindow from '../../../functions/toggleWindow.js'
import GenericStyle from '~/assets/css/generic.module.css'
import Farm from '../Farm/farm.vue'

const store = useStore()
const user = computed(() => store.state.user)

const { load: getHomeInfo, onError: onErrorGetHomeInfo } = useLazyQuery(
	GET_HOME_INFO,
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

const { load: getCurrentFarm, onError: onErrorGetCurrentFarm } = useLazyQuery(
	GET_CURRENT_FARM,
	{},
	{
		fetchPolicy: 'no-cache',
	}
)

const farm_loading = ref(false)

const loadBalance = async () => {
	const req = await getMyBalance()
	if (!req || !req.balance) return
	const data = req.balance
	await store.dispatch('user/setUserBalance_Tonomo', data.tonomo)
	await store.dispatch('user/setUserBalance_vTono', data.vTono)
}

const loadHomeInfo = async () => {
	const req = await getHomeInfo()
	if (!req || !req.home) return
	const data = req.home
	await store.dispatch('user/setUserLeague', data.league)
}

const loadCurrentFarm = async () => {
	const req = await getCurrentFarm()
	if (!req) return
	const data = req.currentFarm
	if (data) {
		await store.dispatch('user/setUserCurrentFarm', data)
	} else await store.dispatch('user/clearUserCurrentFarm')
	farm_loading.value = false
}

const currentLeague = computed(() => getLeagueInfo(user.value.league.type))

onErrorGetHomeInfo(() =>
	showPopup('error', 'There was an error loading your league status')
)
onErrorGetMyBalance(() =>
	showPopup('error', 'There was an error loading your current balance')
)
onErrorGetCurrentFarm(() =>
	showPopup('error', 'There was an error loading your current farming state')
)

onMounted(async () => {
	if (store.state.changed_router) {
		await loadHomeInfo()
		await loadBalance()
	}
	// await loadCurrentFarm();
})
</script>

<template>
	<div :class="{ [MainStyle['home']]: true }">
		<div :class="{ [MainStyle['home-user']]: true }">
			<Animation
				name="home-user-avatar"
				:animation-style="AnimationsHome"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['avatar']]: true }">
					<div
						:class="{ [MainStyle['avatar-img']]: true }"
						:style="{ backgroundImage: `url(${user.avatar}), url(${NoImage})` }"
					></div>
				</div>
			</Animation>
			<Animation
				name="home-user-username"
				:animation-style="AnimationsHome"
				:start-animation="true"
			>
				<div
					:class="{
						[MainStyle['username']]: true,
						[GenericStyle['text-overflow-300']]: true,
					}"
				>
					{{ user.name }}
				</div>
			</Animation>
			<Animation
				name="home-user-balance"
				:animation-style="AnimationsHome"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['balance']]: true }">
					<Icon
						:class="{ [MainStyle['styled-icon']]: true }"
						name="tonomo-coin"
					/>
					<span :class="{ [MainStyle['amount']]: true }">{{
						integerSpaces(user.balance.tonomo)
					}}</span>
				</div>
			</Animation>
		</div>
		<div :class="{ [MainStyle['home-farm']]: true }">
			<Animation
				name="home-farm-league"
				:animation-style="AnimationsHome"
				:start-animation="true"
			>
				<div
					:class="{ [MainStyle['home-league']]: true }"
					:data-league="user.league.type"
				>
					<div :class="{ [MainStyle['league-block']]: true }">
						<div :class="{ [MainStyle['league-icon']]: true }">
							<div
								:class="{ [MainStyle['league-image']]: true }"
								:style="{ backgroundImage: `url(${currentLeague.icon})` }"
							></div>
						</div>
						<div :class="{ [MainStyle['league-info']]: true }">
							<div :class="{ [MainStyle['league-name']]: true }">
								{{ currentLeague.name }}
							</div>
							<div :class="{ [MainStyle['league-place']]: true }">
								You are in {{ numberWithSuffix(user.league.place) }} place
							</div>
						</div>
					</div>
					<button
						type="button"
						:class="{ [MainStyle['league-button']]: true }"
						@click="toggleWindow('home-top-players')"
					>
						Top players
					</button>
				</div>
			</Animation>
			<Farm :loading="farm_loading" />
		</div>
	</div>
</template>
