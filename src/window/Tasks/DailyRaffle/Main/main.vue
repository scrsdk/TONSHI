<script setup>
import MainStyle from './main.module.css'
import Icon from '../../../../components/Icon/icon.vue'
import { useStore } from 'vuex'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import showPopup from '../../../../functions/showPopup.js'
import toggleWindow from '../../../../functions/toggleWindow.js'
import CircleLoader from '../../../../components/CircleLoader/circle-loader.vue'
import { useMutation } from '@vue/apollo-composable'
import Item from '../Item/item.vue'
import AnimationsMain from './animations.module.css'
import Animation from '../../../../components/animation.vue'
import { GET_DAILY_RAFFLE } from '../../../../queries.js'
import secondsToHMS from '~/functions/secondsToHMS'

const store = useStore()
const user = computed(() => store.state.user)

const loading = ref(true)
const myPlace = ref({
	table: true,
	place: 0,
})
const list = ref([])
const totalUsers = ref(0)
const maxWin = ref(0)
const endTimer = ref(null)
const timer = ref(null)
const timerInterval = ref(null)

const { mutate: mutateGetDailyRaffle, onError: onErrorGetDailyRaffle } =
	useMutation(
		GET_DAILY_RAFFLE,
		{},
		{
			fetchPolicy: 'no-cache',
		}
	)

const load = async () => {
	const req = await mutateGetDailyRaffle()
	if (!req || !req.data || !req.data.loadDailyRaffle) return
	const data = req.data.loadDailyRaffle
	list.value = data.list
	myPlace.value = data.my_place
	totalUsers.value = data.users
	endTimer.value = data.timer
	maxWin.value = data.max_win
	setCurrentTimer(data.timer)
	startTimer()
	loading.value = false
}

const startTimer = () => {
	timerInterval.value = setInterval(() => {
		setCurrentTimer(endTimer.value)
		if (timer.value <= 0) {
			clearInterval(timerInterval.value)
			timerInterval.value = null
			loading.value = true
			setTimeout(() => load(), 500)
		}
	}, 1000)
}

const setCurrentTimer = end_time => {
	const now = Math.floor(Date.now() / 1000),
		countdown = end_time - now
	timer.value = countdown < 0 ? 0 : countdown
}

const stringTimer = computed(() => {
	return secondsToHMS(timer.value)
})

onErrorGetDailyRaffle(async () => {
	await toggleWindow()
	return showPopup('error', 'An error occurred while loading daily raffle')
})

onMounted(() => load())
onUnmounted(() => {
	if (timerInterval.value) {
		clearInterval(timerInterval.value)
		timerInterval.value = null
	}
})
</script>

<template>
	<div :class="{ [MainStyle['daily-raffle']]: true }">
		<div :class="{ [MainStyle['daily-raffle-loading']]: true }" v-if="loading">
			<CircleLoader :width="46" :height="46" :border-size="6" />
		</div>
		<template v-else>
			<div :class="{ [MainStyle['daily-raffle-header']]: true }">
				<Animation
					name="daily-raffle-header-image"
					:animation-style="AnimationsMain"
					:start-animation="true"
				>
					<div
						:class="{ [MainStyle['daily-raffle-header-image']]: true }"
					></div>
				</Animation>
				<div :class="{ [MainStyle['daily-raffle-header-info']]: true }">
					<Animation
						name="daily-raffle-header-title"
						:animation-style="AnimationsMain"
						:start-animation="true"
					>
						<div :class="{ [MainStyle['daily-raffle-header-title']]: true }">
							<div :class="{ [MainStyle['text']]: true }">Daily Raffle</div>
							<div :class="{ [MainStyle['badge']]: true }">
								<Icon
									:class="{ [MainStyle['styled-icon']]: true }"
									name="users"
								/>
								<span :class="{ [MainStyle['badge-text']]: true }">{{
									totalUsers
								}}</span>
							</div>
						</div>
					</Animation>
					<Animation
						name="daily-raffle-header-description"
						:animation-style="AnimationsMain"
						:start-animation="true"
					>
						<div
							:class="{ [MainStyle['daily-raffle-header-description']]: true }"
						>
							Watch ads and take part in the raffle
						</div>
					</Animation>
				</div>
			</div>
			<Animation
				name="daily-raffle-badges"
				:animation-style="AnimationsMain"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['daily-raffle-badges']]: true }">
					<div
						:class="{
							[MainStyle['daily-raffle-badge']]: true,
							[MainStyle['badge-green']]: true,
						}"
					>
						{{ stringTimer }}
					</div>
					<div
						:class="{
							[MainStyle['daily-raffle-badge']]: true,
							[MainStyle['badge-primary']]: true,
						}"
					>
						<div :class="{ [MainStyle['icon-text']]: true }">
							Win up to
							<Icon
								:class="{ [MainStyle['styled-icon']]: true }"
								name="crypto-ton"
							/>
							{{ maxWin }}
						</div>
					</div>
				</div>
			</Animation>
			<Animation
				name="daily-raffle-content"
				:animation-style="AnimationsMain"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['content']]: true }">
					<div :class="{ [MainStyle['content-body']]: true }">
						<div
							:class="{
								[MainStyle['content-items']]: true,
								[MainStyle['content-items-visible']]: !loading,
							}"
						>
							<template v-if="list.length > 0">
								<Item
									v-for="(item, key) of list"
									:class="{ [MainStyle['first-item']]: key === 0 }"
									:key="key"
									:place="key + 1"
									:user-id="item.id"
									:avatar="item.avatar"
									:name="item.name"
								/>
								<Item
									v-if="!myPlace.table && !loading && myPlace.place > 0"
									:key="list.length"
									:place="myPlace.place"
									:user-id="user.id"
									:avatar="user.avatar"
									:name="user.name"
								/>
							</template>
							<template v-else>
								<div :class="{ [MainStyle['list-empty']]: true }">
									<Animation
										name="daily-raffle-empty-list-title"
										:animation-style="AnimationsMain"
										:start-animation="true"
									>
										<Icon
											:class="{ [MainStyle['styled-icon']]: true }"
											name="smile-sad"
										/>
									</Animation>
									<Animation
										name="daily-raffle-empty-list-description"
										:animation-style="AnimationsMain"
										:start-animation="true"
									>
										<span :class="{ [MainStyle['text']]: true }"
											>The list of players in daily raffle is empty</span
										>
									</Animation>
								</div>
							</template>
						</div>
					</div>
				</div>
			</Animation>
		</template>
	</div>
</template>
