<script setup>
import AnimationsNickname from './animations.module.css'
import MainStyle from './nickname.module.css'
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
import secondsToHMS from '~/functions/secondsToHMS'
import { watch, ref, inject, computed, onBeforeMount, onUnmounted } from 'vue'
import { useWebApp } from 'vue-tg'
import { CLAIM_NICKNAME_BONUS } from '../../../queries'
import { useMutation } from '@vue/apollo-composable'
import showPopup from '~/functions/showPopup'

const webApp = useWebApp()

const nickname = inject('tasks-nickname')

const loading = ref(false)
const endTimer = ref(nickname.value.seconds)
const timer = ref(0)
const timerInterval = ref(null)
const disabled = ref(nickname.value.claimed)

const { mutate: mutateClaimNicknameBonus, onError: onErrorClaimNicknameBonus } =
	useMutation(
		CLAIM_NICKNAME_BONUS,
		() => {
			return {
				variables: {
					initData: webApp.initData,
				},
			}
		},
		{
			fetchPolicy: 'no-cache',
		}
	)

const submit = async () => {
	if (loading.value || disabled.value || !isTonomoInNickname.value) return
	loading.value = true
	const req = await mutateClaimNicknameBonus()
	if (!req || !req.data || !req.data.claimNicknameBonus) return
	const data = req.data.claimNicknameBonus
	endTimer.value = data.seconds - 1
	disabled.value = true
	loading.value = false
	return showPopup('success', 'You got +' + nickname.value.reward + ' $Tonomo!')
}

const startTimer = () => {
	timerInterval.value = setInterval(() => {
		setCurrentTimer(endTimer.value)
		if (timer.value <= 0) {
			clearInterval(timerInterval.value)
			timerInterval.value = null
			disabled.value = false
		}
	}, 1000)
}

const stringTime = computed(() => {
	return secondsToHMS(timer.value)
})

const setCurrentTimer = end_time => {
	const now = Math.floor(Date.now() / 1000),
		countdown = end_time - now
	timer.value = countdown < 0 ? 0 : countdown
}

const prepareTimer = () => {
	if (timerInterval.value || !endTimer.value || !disabled.value) return
	setCurrentTimer(endTimer.value)
	return startTimer()
}

const isTonomoInNickname = computed(() => {
	const tgUser = webApp.initDataUnsafe.user
	return (
		tgUser.first_name.includes('$Tonomo') ||
		tgUser.last_name.includes('$Tonomo')
	)
})

watch(endTimer, newValue => {
	prepareTimer(newValue)
})

onErrorClaimNicknameBonus(error => {
	loading.value = false
	showPopup('error', error.message)
})

onBeforeMount(() => prepareTimer())
onUnmounted(() => {
	if (timerInterval.value) {
		clearInterval(timerInterval.value)
		timerInterval.value = null
	}
})
</script>

<template>
	<Animation
		name="tasks-nickname"
		:animation-style="AnimationsNickname"
		:start-animation="true"
	>
		<div :class="{ [MainStyle['tasks-nickname']]: true }">
			<div :class="{ [MainStyle['tasks-title']]: true }">
				Add $Tonomo to your nickname
			</div>
			<div :class="{ [MainStyle['tasks-description']]: true }">
				Get +{{ nickname.reward }} $Tonomo every day by adding
				<span :class="{ [MainStyle['tasks-description-badge']]: true }">
					$Tonomo
				</span>
				to your nickname!
			</div>

			<div
				:class="{ [MainStyle['tasks-nickname-error-badge']]: true }"
				v-if="!isTonomoInNickname"
			>
				<span :class="{ [MainStyle['text']]: true }">
					You don't add <b>$Tonomo</b> to your nickname yet
				</span>
			</div>

			<Animation
				name="tasks-nickname-button"
				:animation-style="AnimationsNickname"
				:start-animation="true"
			>
				<button
					:class="{ [MainStyle['nickname-button']]: true }"
					:disabled="disabled || !isTonomoInNickname"
					@click="submit"
				>
					<div :class="{ [MainStyle['name']]: true }">
						<Icon :class="{ [MainStyle['styled-icon']]: true }" name="gift" />
						<span :class="{ [MainStyle['text']]: true }">Get reward</span>
					</div>
					<span :class="{ [MainStyle['time']]: true }" v-if="disabled">
						{{ stringTime }}
					</span>
				</button>
			</Animation>
		</div>
	</Animation>
</template>
