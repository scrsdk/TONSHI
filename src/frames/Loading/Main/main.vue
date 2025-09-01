<script setup>
import { useMutation } from '@vue/apollo-composable'
import { INIT_GAME } from '~/queries.js'
import { useWebApp } from 'vue-tg'
import { inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import Loading from '~/frames/Loading/loading.vue'
import Daily from '~/frames/Loading/Daily/daily.vue'
import getQueryParams from '~/functions/getQueryParams.js'
import MainStyle from './main.module.css'

const webApp = useWebApp()
const queryParams = getQueryParams()

const friendCode = queryParams.friendCode ? queryParams.friendCode : null

const { mutate: mutateInitGame, onError: onErrorInitGame } = useMutation(
	INIT_GAME,
	() => {
		return {
			variables: {
				initData: webApp.initData,
				friendCode: friendCode,
			},
		}
	},
	{
		fetchPolicy: 'no-cache',
	}
)

const store = useStore()

const currentState = ref('loading')
const currentLoadingState = ref(1)
const loadingAppInterval = ref()

const appImages = inject('app-images')

const initGame = async () => {
	await loadAppImages(2)
	const req = await mutateInitGame()
	if (!req || !req.data || !req.data.initGame) return
	const data = req.data.initGame
	await store.dispatch('setListOfLeagues', data.leagues)
	for (const cdn_image_key in data.cdn_images) {
		const cdn_image = data.cdn_images[cdn_image_key]
		appImages.push({
			tag: 'donations-image-' + cdn_image_key,
			component: cdn_image,
			loaded: false,
			cdn: true,
		})
	}
	await loadAppImages(3)
	loadingAppInterval.value = setInterval(async () => {
		if (appImages.length === appImages.filter(image => image.loaded).length) {
			currentLoadingState.value = 4
			clearInterval(loadingAppInterval.value)
			await store.dispatch('user/setUser', data.user)
			if (data.user.available_daily_rewards.status) {
				currentState.value = 'daily'
				return
			}
			return store.dispatch('preloader/setPreloader', false)
		}
	}, 20)
}

const loadAppImages = async state => {
	currentLoadingState.value = state
	for (const arrKey in appImages) {
		const arrImage = appImages[arrKey]
		if (arrImage.loaded) continue
		const image = new Image()
		image.src = arrImage.component
		image.onload = () => {
			appImages[arrKey].loaded = true
		}
		image.onerror = () => {
			clearInterval(loadingAppInterval.value)
			return requestFailed()
		}
	}
}

const requestFailed = () => {
	return store.dispatch('error/setError', {
		status: true,
		title: 'Error',
		description: 'There was an error on our server side',
		button: { type: 'success', name: 'Refresh app', function: 'reloadApp' },
	})
}

onErrorInitGame(() => requestFailed())

onMounted(() => initGame())
</script>

<template>
	<div :class="{ [MainStyle['loading-container']]: true }">
		<div :class="{ [MainStyle['loading-content']]: true }">
			<Loading v-if="currentState === 'loading'" :state="currentLoadingState" />
			<Daily v-else-if="currentState === 'daily'" />
		</div>
	</div>
</template>
