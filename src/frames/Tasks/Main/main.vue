<script setup>
import { useRouter } from 'vue-router'
import { onMounted, provide, ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { GET_TASKS } from '~/queries.js'
import showPopup from '~/functions/showPopup.js'
import CircleLoader from '../../../components/CircleLoader/circle-loader.vue'
import MainStyle from './main.module.css'
import GenericStyle from '~/assets/css/generic.module.css'
import GenericAnimations from '~/assets/css/animations.module.css'
import Category from '~/frames/Tasks/Category/category.vue'
import CheckIn from '~/frames/Tasks/CheckIn/check-in.vue'
import Categories from '~/frames/Tasks/Main/categories.vue'
import Wallet from '~/frames/Tasks/Main/wallet.vue'
import Animation from '../../../components/animation.vue'
import TasksIcon from '~/assets/images/tasks-icon.svg'
import Ads from '../Ads/ads.vue'
import { useStore } from 'vuex'
import DailyRaffle from '../DailyRaffle/daily-raffle.vue'
import Nickname from '../Nickname/nickname.vue'

const store = useStore()
const router = useRouter()

const loading = ref(true)
const tasks = ref([])
const categories = ref([])
const checkIn = ref([])
const ads = ref([])
const dailyRaffle = ref([])
const nickname = ref([])
const selectedCategory = ref('telegram')

provide('tasks-categories', categories)
provide('tasks-list', tasks)
provide('tasks-check-in', checkIn)
provide('tasks-ads', ads)
provide('tasks-selected-category', selectedCategory)
provide('tasks-daily-raffle', dailyRaffle)
provide('tasks-nickname', nickname)
const { mutate: mutateLoadTasks, onError: onErrorLoadTasks } = useMutation(
	GET_TASKS,
	() => {
		return {}
	},
	{
		fetchPolicy: 'no-cache',
	}
)

const load = async () => {
	const req = await mutateLoadTasks()
	if (!req || !req.data || !req.data.loadTasks) return
	const data = req.data.loadTasks
	categories.value = data.categories
	tasks.value = data.tasks
	checkIn.value = data.checkin
	ads.value = data.ads
	dailyRaffle.value = data.daily_raffle
	nickname.value = data.nickname
	await store.dispatch(
		'setDailyRaffleLastWinner',
		data.daily_raffle.last_winner
	)
	loading.value = false
}

provide('arr-item-change-claim', (tasks_id, type = 'tasks', status = true) => {
	switch (type) {
		case 'tasks':
			let is_change = false
			for (const tasksKey in tasks.value) {
				if (is_change) {
					break
				}
				const category = tasks.value[tasksKey]
				for (const itemKey in category?.list) {
					const item = category.list[itemKey]
					if (item && item.id === tasks_id) {
						tasks.value[tasksKey].list[itemKey].claim = status
						is_change = true
						break
					}
				}
			}
			break
		case 'checkin':
			const findIndex = checkIn.value.findIndex(item => item.id === tasks_id)
			if (findIndex === -1) return
			checkIn.value[findIndex].claim = status
			break
	}
})

provide(
	'arr-item-add-seconds-timer',
	(tasks_id, type = 'tasks', seconds = 86400) => {
		switch (type) {
			case 'tasks':
				let is_change = false
				for (const tasksKey in tasks.value) {
					if (is_change) {
						break
					}
					const category = tasks.value[tasksKey]
					for (const itemKey in category?.list) {
						const item = category.list[itemKey]
						if (item && item.id === tasks_id) {
							tasks.value[tasksKey].list[itemKey].info.end_timer = seconds
							is_change = true
							break
						}
					}
				}
				break
			case 'checkin':
				const findIndex = checkIn.value.findIndex(item => item.id === tasks_id)
				if (findIndex === -1) return
				checkIn.value[findIndex].info.end_timer = seconds
				break
		}
	}
)

onErrorLoadTasks(() => {
	router.push('/')
	return showPopup('error', 'An error occurred while loading tasks')
})

onMounted(() => load())
</script>

<template>
	<div :class="{ [MainStyle['tasks']]: true }">
		<div :class="{ [GenericStyle['page-header']]: true }">
			<Animation
				name="page-header-title"
				:animation-style="GenericAnimations"
				:start-animation="true"
			>
				<div :class="{ [GenericStyle['title']]: true }">
					<div
						:class="{ [GenericStyle['icon']]: true }"
						:style="{ backgroundImage: 'url(' + TasksIcon + ')' }"
					></div>
					<span :class="{ [GenericStyle['text']]: true }">Tasks</span>
				</div>
			</Animation>
			<Animation
				name="page-header-description"
				:animation-style="GenericAnimations"
				:start-animation="true"
			>
				<div :class="{ [GenericStyle['description']]: true }">
					Tasks for which you can get $Tonomo
				</div>
			</Animation>
		</div>
		<div
			:class="{
				[MainStyle['tasks-content']]: true,
				[MainStyle['now-loading']]: loading,
			}"
		>
			<CircleLoader :border-size="6" :width="40" :height="40" v-if="loading" />
			<template v-else>
				<Wallet />
				<Ads />
				<DailyRaffle />
				<CheckIn />
				<Nickname />
				<Categories />
				<Category />
			</template>
		</div>
	</div>
</template>
