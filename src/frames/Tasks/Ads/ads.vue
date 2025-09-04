import AnimationsAds from './animations.module.css'
import MainStyle from './ads.module.css'
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
import secondsToHMS from '~/functions/secondsToHMS'
import showPopup from '~/functions/showPopup'
import { watch, ref, inject, computed, onBeforeMount, onUnmounted } from 'vue'

const ads = inject('tasks-ads')

// Инициализация Adsgram. Замените 'YOUR_ADSGRAM_BLOCK_ID' на ваш реальный Block ID
const AdController = window.Adsgram.init({
  blockId: String(import.meta.env.VITE_ADSGRAM_BLOCK_ID), // Предполагается, что Block ID хранится в переменной окружения
})

const loading = ref(false)
const endTimer = ref(ads.value.seconds) // Предполагается, что ads.value.seconds содержит время окончания таймера
const timer = ref(0)
const timerInterval = ref(null)
const disabled = ref(ads.value.watched >= ads.value.limit) // Проверяем, не превышен ли лимит просмотров

const watchAds = () => {
  if (loading.value || disabled.value) return

  loading.value = true
  AdController.show() // Показываем рекламу
    .then(() => {
      loading.value = false
      ads.value.watched++ // Увеличиваем счетчик просмотренных объявлений
      showPopup('success', 'You got +' + ads.value.ad_reward + ' $Tonomo!') // Сообщение об успешном получении награды

      // Проверка на достижение ежедневного розыгрыша
      if (ads.value.watched === ads.value.need_for_daily_raffle) {
        showPopup(
          'success',
          'You have successfully registered in the daily raffle'
        )
      }

      // Проверка на достижение лимита просмотров
      if (ads.value.watched >= ads.value.limit) {
        disabled.value = true
        setCurrentTimer(endTimer.value)
        return startTimer()
      }
    })
    .catch(result => {
      loading.value = false
      console.error(result)
      return showPopup(
        'error',
        'Oops! There are currently no ads available. Please try again later.'
      )
    })
}

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    setCurrentTimer(endTimer.value)
    if (timer.value <= 0) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
      disabled.value = false
      ads.value.watched = 0 // Сбрасываем счетчик просмотров после окончания таймера
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

watch(endTimer, newValue => {
  prepareTimer(newValue)
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
		name="tasks-ads"
		:animation-style="AnimationsAds"
		:start-animation="true"
	>
		<div :class="{ [MainStyle['tasks-ads']]: true }">
			<div :class="{ [MainStyle['tasks-title']]: true }">
				Advertising Awards
			</div>
			<div :class="{ [MainStyle['tasks-description']]: true }">
				Watch daily ads inside our app and get +{{ ads.ad_reward }} $Tonomo for
				every ad you watch.
			</div>

			<Animation
				name="tasks-ads-button"
				:animation-style="AnimationsAds"
				:start-animation="true"
			>
				<button
					:class="{ [MainStyle['ads-button']]: true }"
					:disabled="disabled"
					@click="watchAds"
				>
					<span :class="{ [MainStyle['badge']]: true }">New</span>
					<div :class="{ [MainStyle['name']]: true }">
						<Icon :class="{ [MainStyle['styled-icon']]: true }" name="ad" />
						<span :class="{ [MainStyle['text']]: true }">Watch Ads</span>
					</div>
					<span v-if="!disabled" :class="{ [MainStyle['count']]: true }"
						>{{ ads.watched }}/{{ ads.limit }}</span
					>
					<span v-else :class="{ [MainStyle['count']]: true }">{{
						stringTime
					}}</span>
				</button>
			</Animation>
		</div>
	</Animation>
</template>
