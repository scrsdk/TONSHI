<script setup>
import AnimationsDailyRaffle from './animations.module.css'
import MainStyle from './daily-raffle.module.css'
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
import { inject, computed, onUnmounted, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { integerSpaces } from '~/functions/numberSpaces'
import secondsToHMS from '../../../functions/secondsToHMS'

const store = useStore()
const last_winner = computed(() => store.state.daily_raffle.last_winner)
const dailyRaffle = inject('tasks-daily-raffle')

const endTimer = ref(dailyRaffle.value.timer)
const timer = ref(null)
const timerInterval = ref(null)

const load = () => {
	setCurrentTimer()
	return startTimer()
}

const startTimer = () => {
	timerInterval.value = setInterval(() => {
		setCurrentTimer()
		if (timer.value <= 0) {
			clearInterval(timerInterval.value)
			timerInterval.value = null
			endTimer.value += 86400 - 1
			return load()
		}
	}, 1000)
}

const setCurrentTimer = () => {
	const now = Math.floor(Date.now() / 1000),
		countdown = endTimer.value - now
	timer.value = countdown < 0 ? 0 : countdown
}

const stringTimer = computed(() => {
	return secondsToHMS(timer.value)
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
	<Animation
		name="daily-raffle"
		:animation-style="AnimationsDailyRaffle"
		:start-animation="true"
	>
		<div :class="{ [MainStyle['daily-raffle']]: true }">
			<div :class="{ [MainStyle['daily-raffle-title']]: true }">
				<div :class="{ [MainStyle['daily-raffle-title-text']]: true }">
					Daily raffle
				</div>
			</div>
			<div :class="{ [MainStyle['daily-raffle-description']]: true }">
				Participate in the daily raffle and you have a chance to win up to
				<b>{{ dailyRaffle.max_win }} TON</b>.
			</div>
			<Animation
				name="daily-raffle-mini-badges"
				:animation-style="AnimationsDailyRaffle"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['daily-raffle-mini-badges']]: true }">
					<div
						:class="{
							[MainStyle['daily-raffle-mini-badge']]: true,
							[MainStyle['daily-raffle-mini-badge-users']]: true,
						}"
					>
						<Icon :class="{ [MainStyle['styled-icon']]: true }" name="users" />
						<span :class="{ [MainStyle['badge-text']]: true }">{{
							integerSpaces(dailyRaffle.total_users)
						}}</span>
					</div>
					<div
						:class="{
							[MainStyle['daily-raffle-mini-badge']]: true,
							[MainStyle[
								dailyRaffle.is_participating
									? 'daily-raffle-mini-badge-green'
									: 'daily-raffle-mini-badge-red'
							]]: true,
						}"
					>
						{{
							dailyRaffle.is_participating
								? 'You are participating'
								: 'You are not participating'
						}}
					</div>
				</div>
			</Animation>
			<Animation
				name="daily-raffle-badge-info"
				:animation-style="AnimationsDailyRaffle"
				:start-animation="true"
			>
				<div
					:class="{
						[MainStyle['daily-raffle-badge']]: true,
						[MainStyle['daily-raffle-badge-info']]: true,
					}"
				>
					Participation will be automatic if you view
					{{ dailyRaffle.need_for_daily_raffle }} ads.
				</div>
			</Animation>
			<Animation
				name="daily-raffle-badge-danger"
				:animation-style="AnimationsDailyRaffle"
				:start-animation="true"
			>
				<div
					:class="{
						[MainStyle['daily-raffle-badge']]: true,
						[MainStyle['daily-raffle-badge-danger']]: true,
					}"
				>
					Don't forget to link your wallet to claim your winnings.
				</div>
			</Animation>
			<Animation
				name="daily-raffle-block"
				:animation-style="AnimationsDailyRaffle"
				:start-animation="true"
			>
				<div :class="{ [MainStyle['daily-raffle-block']]: true }">
					<div :class="{ [MainStyle['daily-raffle-last-winner']]: true }">
						<div :class="{ [MainStyle['daily-raffle-info-title']]: true }">
							Last
						</div>
						<div :class="{ [MainStyle['daily-raffle-info-avatar']]: true }">
							<img :src="last_winner.avatar" alt="Avatar" />
						</div>
						<div :class="{ [MainStyle['daily-raffle-info-data']]: true }">
							<div :class="{ [MainStyle['daily-raffle-info-name']]: true }">
								{{ last_winner.name }}
							</div>
							<div :class="{ [MainStyle['daily-raffle-info-amount']]: true }">
								<Icon
									:class="{ [MainStyle['styled-icon']]: true }"
									name="crypto-ton"
								/>
								<span :class="{ [MainStyle['amount']]: true }">{{
									last_winner.amount
								}}</span>
							</div>
						</div>
					</div>
					<div :class="{ [MainStyle['daily-raffle-timer']]: true }">
						{{ stringTimer }}
					</div>
				</div>
			</Animation>
		</div>
	</Animation>
</template>
