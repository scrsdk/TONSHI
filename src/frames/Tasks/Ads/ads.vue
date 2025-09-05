<script setup>
import AnimationsAds from './animations.module.css'
import MainStyle from './ads.module.css'
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
import secondsToHMS from '~/functions/secondsToHMS'
import showPopup from '~/functions/showPopup'
import { watch, ref, inject, computed, onBeforeMount, onUnmounted } from 'vue'

// Импортируем мутацию и хук
import { useMutation } from '@vue/apollo-composable';
import { WATCH_AD } from '~/queries.js'; // Убедитесь, что путь правильный
import { useStore } from 'vuex'; // Для доступа к токену и telegram_id

const ads = inject('tasks-ads'); // Это реактивный объект

// Инициализация Adsgram
const AdController = window.Adsgram.init({
  blockId: String(import.meta.env.VITE_ADSGRAM_BLOCK_ID),
});

const loading = ref(false);
const endTimer = ref(ads.value?.seconds); // Используем optional chaining на случай, если ads.value отсутствует
const timer = ref(0);
const timerInterval = ref(null);
const disabled = ref(ads.value?.watched >= ads.value?.limit);

const store = useStore(); // Получаем доступ к store

// Настройка мутации WATCH_AD
const { mutate: mutateWatchAd, onError: onErrorWatchAd } = useMutation(WATCH_AD, () => ({
  fetchPolicy: 'no-cache',
  // Убедитесь, что токен и другие необходимые заголовки передаются,
  // если ваш GraphQL сервер требует их для этой мутации.
  context: {
    headers: {
      token: store.state.user.auth_token, // Получаем токен из Vuex store
      // Если userId и friendCode передаются как аргументы мутации,
      // а не через контекст, то их нужно передавать в вызове mutateWatchAd
    }
  }
}));

// Обработчик ошибок для мутации (опционально, но рекомендуется)
onErrorWatchAd((error) => {
  console.error('GraphQL Error watching ad:', error);
  showPopup('error', 'An error occurred while processing the ad.');
  loading.value = false; // Останавливаем индикатор загрузки
});

const watchAds = async () => {
  if (loading.value || disabled.value) return;

  loading.value = true; // Начинаем загрузку

  try {
    // 1. Показываем рекламу через Adsgram SDK
    await AdController.show();
    // Если AdController.show() выполнился успешно, то идем дальше

    // 2. Отправляем мутацию на сервер после успешного показа рекламы
    const response = await mutateWatchAd({
      // Передаем userId и friendCode, если они нужны для мутации watchAd на сервере
      // userId: String(store.state.user.telegram_id), // Пример
      // friendCode: store.state.user.friend_code // Пример
      // Если userId и friendCode не нужны для вашей мутации, удалите эти аргументы
    });

    // Проверяем, что мутация вернула данные и они успешны
    if (response && response.data && response.data.watchAd.success) {
      loading.value = false; // Загрузка завершена

      const updatedAdsData = response.data.watchAd.ads; // Получаем обновленные данные рекламы

      // 3. Обновляем реактивное состояние 'ads' и related refs
      // ВАЖНО: 'ads' был инжектирован. Если это реактивный объект (ref, reactive),
      //        то обновление его свойств отразится там, где он используется.
      if (ads.value) { // Убедимся, что ads.value существует
        ads.value.watched = updatedAdsData.watched;
        ads.value.limit = updatedAdsData.limit;
        ads.value.need_for_daily_raffle = updatedAdsData.need_for_daily_raffle;
        ads.value.ad_reward = updatedAdsData.ad_reward; // Обновляем награду
        // ads.value.seconds = updatedAdsData.seconds; // Не обновляем seconds напрямую здесь, а используем в endTimer.value

        // Обновляем endTimer для таймера
        endTimer.value = updatedAdsData.seconds;
      }

      // Показываем сообщение об успехе
      showPopup('success', 'You got +' + updatedAdsData.ad_reward + ' $Tonomo!');

      // Проверка на достижение ежедневного розыгрыша
      if (ads.value.watched === ads.value.need_for_daily_raffle) {
        showPopup('success', 'You have successfully registered in the daily raffle');
      }

      // Проверка на достижение лимита просмотров
      if (ads.value.watched >= ads.value.limit) {
        disabled.value = true;
        setCurrentTimer(endTimer.value); // Устанавливаем таймер на основе новых seconds
        startTimer(); // Запускаем таймер
      } else {
        // Если лимит не достигнут, и пользователь просто посмотрел рекламу,
        // убедимся, что кнопка не остается disabled, если она не должна
        // (это на случай, если endTimer пришел невалидный или disabled был true по другой причине)
        if (timerInterval.value === null) { // Если таймер не активен
             disabled.value = false;
        }
      }

    } else {
      // Если мутация вернула success: false
      loading.value = false;
      showPopup('error', response.data.watchAd.message || 'Failed to process ad watch.');
    }
  } catch (error) {
    // Обработка сетевых ошибок или ошибок Adsgram SDK
    loading.value = false;
    console.error('Error during ad watch process:', error);
    // Пытаемся получить сообщение об ошибке из GraphQL, если оно есть
    const errorMessage = error.graphQLErrors
      ? error.graphQLErrors[0]?.message || 'An error occurred.'
      : 'Network error or Adsgram SDK failed.';
    return showPopup('error', errorMessage);
  }
};

// --- Функции таймера (остаются как были) ---

const startTimer = () => {
  // Если таймер уже запущен, не запускаем новый
  if (timerInterval.value) return;

  timerInterval.value = setInterval(() => {
    setCurrentTimer(endTimer.value);
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
      disabled.value = false;
      // Сбрасываем счетчик просмотров ПОСЛЕ того, как таймер отработал
      // и лимит для нового дня стал доступен.
      // Обновляем ads.value.watched, если сервер будет возвращать 0 при сбросе.
      // Или просто сбрасываем локально, если это поведение ожидается.
      if (ads.value) {
         ads.value.watched = 0;
      }
    }
  }, 1000);
}

const stringTime = computed(() => {
  return secondsToHMS(timer.value);
});

const setCurrentTimer = (end_time) => {
  const now = Math.floor(Date.now() / 1000);
  const countdown = end_time - now;
  timer.value = countdown < 0 ? 0 : countdown;
}

const prepareTimer = () => {
  // Этот метод вызывается при монтировании или изменении endTimer
  // Он должен убедиться, что таймер настроен и запущен, если disabled=true
  if (timerInterval.value) { // Если таймер уже запущен, не трогаем
      return;
  }
  if (disabled.value && endTimer.value) {
      setCurrentTimer(endTimer.value);
      // Запускаем таймер, только если время еще есть
      if (timer.value > 0) {
          startTimer();
      } else {
          // Если время уже вышло (endTimer.value < now), то сбрасываем disable
          disabled.value = false;
          if (ads.value) ads.value.watched = 0; // Сброс счетчика, если время истекло
      }
  } else {
      // Если disabled=false, убедимся, что таймер не запущен
      if (timerInterval.value) {
          clearInterval(timerInterval.value);
          timerInterval.value = null;
      }
      timer.value = 0; // Сброс таймера
  }
}

// Использование watch и onMounted/onBeforeMount
// Отслеживаем изменения в endTimer, чтобы переподготовить таймер
watch(endTimer, () => {
  prepareTimer();
});

// Инициализация таймера при монтировании компонента
onBeforeMount(() => {
  // Проверяем, должен ли таймер быть активен при старте
  if (ads.value?.watched >= ads.value?.limit) {
      disabled.value = true;
  } else {
      disabled.value = false;
  }
  prepareTimer();
});


// Очистка таймера при размонтировании
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
});

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
