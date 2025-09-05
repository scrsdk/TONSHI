<script setup>
import AnimationsAds from './animations.module.css'
import MainStyle from './ads.module.css'
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
import secondsToHMS from '~/functions/secondsToHMS'
import showPopup from '~/functions/showPopup'
import { watch, ref, inject, computed, onBeforeMount, onUnmounted } from 'vue'
import { GET_TASKS } from '../../../queries'
import { useMutation } from '@vue/apollo-composable'

// Предполагается, что у вас есть способ получить user_id
// Например, если он хранится в store или доступен как глобальная переменная
const userId = inject('userId'); // Или как-то иначе получаете user_id

// Инициализация Adsgram. Замените 'YOUR_ADSGRAM_BLOCK_ID' на ваш реальный Block ID
const AdController = window.Adsgram.init({
  blockId: String(import.meta.env.VITE_ADSGRAM_BLOCK_ID), // Предполагается, что Block ID хранится в переменной окружения
})

const ads = inject('tasks-ads') // Предполагаем, что inject('tasks-ads') возвращает реактивный объект

const loading = ref(false)
const endTimer = ref(ads.value.seconds) // Предполагается, что ads.value.seconds содержит время окончания таймера
const timer = ref(0)
const timerInterval = ref(null)
// disabled теперь должен быть вычисляемым на основе данных с сервера
const disabled = ref(ads.value.watched >= ads.value.limit)

const updateAdsData = async () => {
  try {
    const response = await axios.post('/api/ads/watch-ad', { user_id: userId });
    // Обновляем реактивные данные из ответа сервера
    ads.value.watched = response.data.watched;
    ads.value.reward = response.data.reward;
    endTimer.value = response.data.seconds;
    disabled.value = ads.value.watched >= response.data.limit;

    // Пересчитываем таймер, если нужно
    if (disabled.value) {
      setCurrentTimer(endTimer.value);
      if (!timerInterval.value) { // Запускаем таймер только если он еще не запущен
        startTimer();
      }
    } else {
      // Если просмотры разрешены, убедимся, что таймер не активен
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
      }
      timer.value = 0; // Сбрасываем отображение таймера
    }

    // Сообщение об успешном получении награды
    showPopup('success', 'You got +' + response.data.ad_reward + ' $Tonomo!');

    // Проверка на достижение ежедневного розыгрыша
    if (response.data.watched === response.data.need_for_daily_raffle) {
      showPopup(
        'success',
        'You have successfully registered in the daily raffle'
      );
    }
  } catch (error) {
    console.error('Error updating ad data:', error);
    // Отображаем ошибку, если лимит достигнут или другая проблема
    if (error.response && error.response.data && error.response.data.message) {
      showPopup('error', error.response.data.message);
    } else {
      showPopup('error', 'Oops! Something went wrong. Please try again later.');
    }
    // Если сервер вернул ошибку лимита, убедимся, что disabled установлен
    if (error.response && error.response.status === 400) {
        disabled.value = true;
        // Может быть, нужно получить время до следующего дня, чтобы запустить таймер
        // Зависит от того, что сервер возвращает в случае ошибки лимита
        // Например, если сервер возвращает `seconds` в случае ошибки:
        // if (error.response.data.seconds) {
        //   endTimer.value = error.response.data.seconds;
        //   setCurrentTimer(endTimer.value);
        //   startTimer();
        // }
    }
  }
};

const watchAds = async () => { // Добавляем async
  if (loading.value || disabled.value) return

  loading.value = true;
  try {
    await AdController.show(); // Показываем рекламу
    // Если реклама успешно показана, вызываем функцию обновления данных на сервере
    await updateAdsData();
  } catch (error) {
    console.error('Ad display error:', error);
    showPopup(
      'error',
      'Oops! There are currently no ads available. Please try again later.'
    );
  } finally {
    loading.value = false; // Сбрасываем loading в любом случае
  }
};

const startTimer = () => {
  if (timerInterval.value) return; // Не запускать, если уже запущен

  timerInterval.value = setInterval(() => {
    setCurrentTimer(endTimer.value);
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
      disabled.value = false;
      // Сброс данных с сервера при окончании таймера
      // Важно: Убедитесь, что сервер возвращает актуальные данные при сбросе
      // Возможно, нужно будет вызвать getAdsData() или похожую функцию
      // Для простоты, предположим, что сервер обновит данные при следующем запросе
      // Или же, нужно добавить отдельный эндпоинт для сброса счетчика, который будет вызываться здесь
      // Пока что, просто сбрасываем локально и даем понять, что таймер кончился
      // timer.value = 0; // Уже делается в setCurrentTimer
      // ads.value.watched = 0; // Это должно быть сделано сервером при сбросе
      // ads.value.reward = 0; // Это должно быть сделано сервером при сбросе
      // По хорошему, здесь нужно обновить ads.value с сервера, чтобы получить актуальные значения после сброса
      // Пример: fetchAdsData(); // Ваша функция для получения начальных данных
    }
  }, 1000);
};

const stringTime = computed(() => {
  return secondsToHMS(timer.value);
});

const setCurrentTimer = end_time => {
  const now = Math.floor(Date.now() / 1000);
  const countdown = end_time - now;
  timer.value = countdown < 0 ? 0 : countdown;
};

const prepareTimer = () => {
  // Проверяем, что endTimer установлен и disabled активен
  if (timerInterval.value || !endTimer.value || !disabled.value) return;
  setCurrentTimer(endTimer.value);
  startTimer();
};

watch(endTimer, newValue => {
  // Передаем newValue, чтобы prepareTimer мог его использовать, если нужно
  // Или prepareTimer может сам читать endTimer.value
  if (disabled.value) { // Запускаем таймер только если он актуален
      prepareTimer();
  }
});

// Функция для загрузки начальных данных (нужна для сброса таймера)
const fetchAdsData = async () => {
    try {
        // Здесь должен быть вызов эндпоинта, который возвращает начальные данные
        // Например, как ваш getUserAds.js, но через HTTP запрос
        const response = await axios.get('/api/ads/get-initial-data'); // Пример URL
        const data = response.data;
        ads.value.watched = data.watched;
        ads.value.reward = data.reward;
        endTimer.value = data.seconds;
        disabled.value = ads.value.watched >= data.limit;
        // Убедимся, что таймер готовится, если disabled установлен
        if (disabled.value) {
            prepareTimer();
        } else {
            // Если не disabled, то таймер не нужен
            timer.value = 0;
            if (timerInterval.value) {
                clearInterval(timerInterval.value);
                timerInterval.value = null;
            }
        }
    } catch (error) {
        console.error('Error fetching initial ads data:', error);
        // Обработка ошибки, возможно, показать сообщение пользователю
    }
};


onBeforeMount(() => {
    // Предполагается, что ads.value уже содержит начальные данные от сервера
    // Но если они могут быть неполными или устаревшими, лучше вызвать fetchAdsData()
    prepareTimer(); // Готовим таймер на основе текущих данных ads.value
});

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
				Реклама
			</div>
			<div :class="{ [MainStyle['tasks-description']]: true }">
				Смотрите ежедневную рекламу и получайте +{{ ads.ad_reward }} $Tonomo!
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
					<span :class="{ [MainStyle['badge']]: true }">Ads</span>
					<div :class="{ [MainStyle['name']]: true }">
						<Icon :class="{ [MainStyle['styled-icon']]: true }" name="ad" />
						<span :class="{ [MainStyle['text']]: true }">Посмотреть</span>
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
