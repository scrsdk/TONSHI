<script setup>
import Icon from '~/components/Icon/icon.vue'
import { computed, inject, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import getRandomInt from '~/functions/getRandomInt.js'
import CircleLoader from '../../../../components/CircleLoader/circle-loader.vue'
import { useMutation } from '@vue/apollo-composable'
import { CLAIM_TASKS } from '~/queries.js'
import showPopup from '~/functions/showPopup.js'
import { useStore } from 'vuex'
import { useTonConnectModal, useTonAddress } from 'ton-ui-vue'
import { useWebApp, useWebAppNavigation, useWebAppShare } from 'vue-tg'
import shareUrlFriendsInvite from '~/functions/shareUrlFriendsInvite.js'
import ItemStyle from './item.module.css'
import AnimationsItem from '~/frames/Tasks/CheckIn/Item/animations.module.css'
import Animation from '~/components/animation.vue'
import SecondsToHMS from '../../../../functions/secondsToHMS.js'
import { useRouter } from 'vue-router'

const props = defineProps({
	itemId: Number,
	animationId: Number,
	type: String,
	title: String,
	reward: Number,
	info: Object,
	claim: Boolean,
	period: String,
})

const router = useRouter()
const store = useStore()
const user = computed(() => store.state.user)

const claimTimeout = ref(null)
const startTimeout = ref(null)

const tasksId = props.itemId + '-' + props.type

const description = computed(() => {
	const info = props.info
	if (info.type === 'farming') {
		return (
			(user.value.balance.tonomo > info.amount
				? info.amount
				: user.value.balance.tonomo) +
			'/' +
			info.amount +
			' $Tonomo. Get ' +
			props.reward +
			' $Tonomo'
		)
	}
	if (info.type === 'donations' && props.period !== 'day') {
		return (
			(info.sum > info.amount ? info.amount : info.sum) +
			'/' +
			info.amount +
			'$. Get ' +
			props.reward +
			' $Tonomo'
		)
	}
	if (info.type === 'friends') {
		return (
			(info.count > info.amount ? info.amount : info.count) +
			'/' +
			info.amount +
			' friends. Get ' +
			props.reward +
			' $Tonomo'
		)
	}
	return 'Get ' + props.reward + ' $Tonomo'
})

const icon = computed(() => {
	if (
		props.type === 'telegram' ||
		props.type === 'youtube' ||
		props.type === 'instagram' ||
		props.type === 'x'
	) {
		return 'social-' + props.type
	}
	if (props.type === 'farming') {
		return 'tonomo-white-coin'
	}
	if (props.type === 'friends') {
		return 'bottom-menu-friends'
	}
	if (props.type === 'donations') {
		return 'currency-usd'
	}
	return props.type
})

const webAppNavigation = useWebAppNavigation()
const { open: openTonModal } = useTonConnectModal()
const tonAddress = useTonAddress()
const webAppShare = useWebAppShare()
const webApp = useWebApp()

const { mutate: mutateClaimTasks, onError: onErrorClaimTasks } = useMutation(
	CLAIM_TASKS,
	() => {
		return {
			variables: {
				tasks_id: props.itemId,
			},
		}
	},
	{
		fetchPolicy: 'no-cache',
	}
)

const loading = ref(tasksId === store.state.tasks_id_pending)

const permanentStarted = computed(() => {
	const info = props.info
	if (
		(info.type === 'farming' && user.value.balance.tonomo >= info.amount) ||
		(info.type === 'donations' &&
			(props.period === 'day' ? info.sum > 0 : info.sum >= info.amount)) ||
		(info.type === 'friends' && info.count >= info.amount) ||
		(info.type === 'telegram-wallet' && tonAddress.value)
	)
		return true
	return false
})

const started = ref(permanentStarted.value)

const timerTasksInterval = ref()
const timerSeconds = ref(0)

const arrItemAddSecondsTimer = inject('arr-item-add-seconds-timer')
const arrItemChangeClaim = inject('arr-item-change-claim')

const startTasksTimer = () => {
	timerTasksInterval.value = setInterval(() => {
		setCurrentTimer(props.info.end_timer)
		if (timerSeconds.value <= 0) {
			clearInterval(timerTasksInterval.value)
			timerTasksInterval.value = null
			return arrItemChangeClaim(props.itemId, 'tasks', false)
		}
	}, 1000)
}

const setCurrentTimer = end_time => {
	const now = Math.floor(Date.now() / 1000),
		countdown = end_time - now
	timerSeconds.value = countdown < 0 ? 0 : countdown
}

const prepareTimer = () => {
	if (!props.claim || props.period !== 'day' || timerTasksInterval.value) return
	setCurrentTimer(props.info.end_timer)
	return startTasksTimer()
}

const nextTimeTasks = computed(() => {
	return SecondsToHMS(timerSeconds.value)
})

const nextTimeTasksClass = computed(() => {
	const split = SecondsToHMS(timerSeconds.value).split(' ').length
	if (split === 3) return 'hours'
	if (split === 2) return 'minutes'
	return 'seconds'
})

const callback = () => {
	if (loading.value || props.claim) return
	if (!started.value) {
		return start()
	}
	return claim()
}

const open = () => {
	const info = props.info
	switch (info.type) {
		case 'link':
			return webAppNavigation.openLink(info.link)
		case 'telegram-subscribe':
			return webAppNavigation.openTelegramLink(info.link)
		case 'telegram-boost':
			return webAppNavigation.openTelegramLink(info.link)
		case 'telegram-link':
			return webAppNavigation.openTelegramLink(info.link)
		case 'telegram-story':
			const inviteLink =
					import.meta.env.VITE_TELEGRAM_BOT +
					'/' +
					import.meta.env.VITE_TELEGRAM_WEBAPP_URI +
					'?startapp=' +
					user.value.friend_code,
				postText =
					(!user.value.is_premium
						? 'Earn $Tonomo together 👉' + inviteLink + '👈. '
						: '') +
					'Join us in an exciting adventure as we team up with Binance, Bybit, OKX, Bitget and ready for a powerful airdrop!'
			return webAppShare.shareToStory(
				import.meta.env.VITE_CDN_MAIN + '/telegram-story.jpg?v=1',
				{
					text: postText,
					...(user.value.is_premium && {
						widget_link: {
							url:
								import.meta.env.VITE_TELEGRAM_BOT +
								'/' +
								import.meta.env.VITE_TELEGRAM_WEBAPP_URI +
								'?startapp=' +
								user.value.friend_code,
							name: 'Earn $Tonomo',
						},
					}),
				}
			)
		case 'telegram-wallet':
			if (tonAddress.value) return claim()
			return openTonModal()
		case 'friends':
			return webAppNavigation.openTelegramLink(
				shareUrlFriendsInvite(user.value.friend_code)
			)
		case 'donations':
			return router.push('/shop')
		case 'farming':
			return router.push('/')
		default:
			return
	}
}

const start = () => {
	if (props.claim || loading.value || started.value) return
	const info = props.info
	loading.value = true
	open()
	if (info.type === 'link') {
		startTimeout.value = setTimeout(() => {
			started.value = true
			loading.value = false
		}, getRandomInt(3 * 1000, 5 * 1000))
	} else {
		if (info.type === 'friends' && info.count >= info.amount) {
			started.value = true
		} else if (
			info.type !== 'friends' &&
			(info.type !== 'telegram-story' ||
				(info.type === 'telegram-story' &&
					(webApp.platform === 'ios' ||
						webApp.platform === 'android' ||
						webApp.platform === 'android_x')))
		) {
			started.value = true
		}
		loading.value = false
	}
}

const claim = async () => {
	if (store.state.tasks_id_pending)
		return showPopup(
			'error',
			'Wait for the previous task to check before starting a new task.'
		)
	if (props.claim || loading.value || !started.value) return
	loading.value = true
	const make = async () => {
		const info = props.info
		if (info.type === 'telegram-wallet' && !tonAddress.value) {
			loading.value = false
			return showPopup('error', 'Link Wallet to complete this task')
		}
		const req = await mutateClaimTasks()
		if (!req || !req.data || !req.data.claimTasks) return
		const data = req.data.claimTasks
		arrItemChangeClaim(props.itemId)
		if (props.period === 'day') {
			arrItemAddSecondsTimer(
				props.itemId,
				'tasks',
				Math.floor(Date.now() / 1000) + 86399
			)
		}
		loading.value = false
		await store.dispatch('user/setUserBalance_Tonomo', data.tonomo)
		return showPopup('success', 'You got +' + data.amount + ' $Tonomo!')
	}
	claimTimeout.value = setTimeout(
		async () => make(),
		getRandomInt(1 * 1000, 3 * 1000)
	)
}

const animationItemMs = computed(() => {
	const ms = 100 + props.animationId * 140 * 1.2
	return ms >= 604 ? 688 : ms
})

onErrorClaimTasks(error => {
	loading.value = false
	showPopup('error', error.message)
})

watch(
	() => props.claim,
	() => prepareTimer()
)

onBeforeMount(() => prepareTimer())
onUnmounted(() => {
	if (timerTasksInterval.value) {
		clearInterval(timerTasksInterval.value)
		timerTasksInterval.value = null
	}
	if (claimTimeout.value) {
		clearTimeout(claimTimeout.value)
		claimTimeout.value = null
	}
	if (startTimeout.value) {
		clearTimeout(startTimeout.value)
		startTimeout.value = null
	}
})
</script>

<template>
	<Animation
		name="item"
		:animation-style="AnimationsItem"
		:style="{ '--tasks-item-animation-ms': animationItemMs + 'ms' }"
		:start-animation="true"
	>
		<div :class="{ [ItemStyle['item']]: true }">
			<div :class="{ [ItemStyle['left-blocks']]: true }">
				<div :class="{ [ItemStyle['item-icon']]: true }">
					<Icon :class="{ [ItemStyle['styled-icon']]: true }" :name="icon" />
				</div>
				<div :class="{ [ItemStyle['info']]: true }">
					<div :class="{ [ItemStyle['title']]: true }">{{ props.title }}</div>
					<div :class="{ [ItemStyle['description']]: true }">
						{{ description }}
					</div>
				</div>
			</div>
			<div :class="{ [ItemStyle['right-buttons']]: true }">
				<button
					v-if="started && !props.claim && !permanentStarted"
					type="button"
					:class="{
						[ItemStyle['button']]: true,
						[ItemStyle['button-start']]: true,
					}"
					@click="open"
				>
					<span :class="{ [ItemStyle['name']]: true }">Open</span>
				</button>
				<button
					v-if="!props.claim"
					type="button"
					:class="{
						[ItemStyle['button']]: true,
						[ItemStyle['button-start']]: !started,
						[ItemStyle['button-loading']]: loading,
						[ItemStyle['button-active']]: !loading && started,
						[ItemStyle['button-flex-center']]: loading,
					}"
					:disabled="loading"
					@click="callback"
				>
					<CircleLoader
						v-if="loading"
						:width="18"
						:height="18"
						:border-size="3"
						line-color="rgba(255, 255, 255, .75)"
						full-color="rgba(88, 93, 110, .3)"
					/>
					<span :class="{ [ItemStyle['name']]: true }" v-else>{{
						started
							? 'Claim'
							: props.info.type === 'friends'
							? 'Invite'
							: 'Start'
					}}</span>
				</button>
				<button
					v-else
					type="button"
					:class="{
						[ItemStyle['button']]: true,
						[ItemStyle['button-wait']]: props.period === 'day',
						[ItemStyle['button-wait-' + nextTimeTasksClass]]:
							props.period === 'day',
						[ItemStyle['button-success']]: props.period === 'once',
						[ItemStyle['button-flex-center']]: true,
					}"
					:disabled="true"
				>
					<template v-if="props.period === 'day'">
						<span :class="{ [ItemStyle['name']]: true }">{{
							nextTimeTasks
						}}</span>
					</template>
					<template v-else>
						<Icon
							:class="{ [ItemStyle['styled-icon']]: true }"
							name="circle-check"
						/>
					</template>
				</button>
			</div>
		</div>
	</Animation>
</template>
