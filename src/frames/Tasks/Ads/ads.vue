<script setup>
import AnimationsAds from './animations.module.css';
import MainStyle from './ads.module.css';
import Animation from '../../../components/animation.vue';
import Icon from '~/components/Icon/icon.vue';
import secondsToHMS from '~/functions/secondsToHMS';
import showPopup from '~/functions/showPopup';
import { watch, ref, inject, computed, onMounted, onUnmounted } from 'vue';

// Импортируем GraphQL хуки и мутации
import { useMutation, useQuery } from '@vue/apollo-composable';
import { WATCH_AD } from '~/queries.js';
import { GET_TASKS } from '~/queries.js'; // Импортируем GET_TASKS
import { useStore } from 'vuex'; // Для доступа к токену и telegram_id

const ads = inject('tasks-ads'); // Это реактивный объект

// Инициализация Adsgram
const AdController = window.Adsgram.init({
  blockId: String(import.meta.env.VITE_ADSGRAM_BLOCK_ID),
});

const loading = ref(false); // Для индикатора загрузки при просмотре рекламы
const endTimer = ref(ads.value?.seconds); // Используем optional chaining
const timer = ref(0);
const timerInterval = ref(null);
const disabled = ref(ads.value?.watched >= ads.value?.limit);
const store = useStore();

// Настройка мутации WATCH_AD
const { mutate: mutateWatchAd, onError: onErrorWatchAd } = useMutation(WATCH_AD, () => ({
  fetchPolicy: 'no-cache',
  context: {
    headers: {
      token: store.state.user.auth_token, // Получаем токен из Vuex
    },
  },
}));

// Обработчик ошибок для мутации
onErrorWatchAd((error) => {
  console.error('GraphQL Error watching ad:', error);
  showPopup('error', 'An error occurred while processing the ad.');
  loading.value = false;
});

// Переписываем loadTasks
const { refetch: refetchTasks, result: tasksResult } = useQuery(GET_TASKS, {}, {fetchPolicy: 'no-cache',});

// Получаем данные ads из tasksResult.value.loadTasks.ads
watch(() => tasksResult.value?.loadTasks?.ads, (newAdsData) => {
    if (newAdsData) {
        // Обновляем свойства ads.value из данных, полученных с сервера (начальные)
        if (ads.value) {
          ads.value.watched = newAdsData.watched;
          ads.value.limit = newAdsData.limit;
          ads.value.need_for_daily_raffle = newAdsData.need_for_daily_raffle;
          ads.value.ad_reward = newAdsData.ad_reward;
          endTimer.value = newAdsData.seconds; // Устанавливаем endTimer
        }

    }
}, { deep: true });

const watchAds = async () => {
  if (loading.value || disabled.value) return;
  loading.value = true;

  try {
    await AdController.show();

    const response = await mutateWatchAd({
      // Если нужны аргументы для watchAd, передавайте их здесь.
      // userId: String(store.state.user.telegram_id),
      // friendCode: store.state.user.friend_code,
    });

    if (response && response.data && response.data.watchAd.success) {
      loading.value = false;
      const updatedAdsData = response.data.watchAd.ads;

      if (ads.value) {
        ads.value.watched = updatedAdsData.watched;
        ads.value.limit = updatedAdsData.limit;
        ads.value.need_for_daily_raffle = updatedAdsData.need_for_daily_raffle;
        ads.value.ad_reward = updatedAdsData.ad_reward;
        endTimer.value = updatedAdsData.seconds;
      }

      showPopup('success', 'You got +' + updatedAdsData.ad_reward + ' $Tonomo!');

      if (ads.value.watched === ads.value.need_for_daily_raffle) {
        showPopup('success', 'You have successfully registered in the daily raffle');
      }

      if (ads.value.watched >= ads.value.limit) {
        disabled.value = true;
        setCurrentTimer(endTimer.value);
        startTimer();
      } else {
        // Если лимит не достигнут, убеждаемся, что кнопка активна
        if (timerInterval.value === null) {
          disabled.value = false;
        }
      }
    } else {
      loading.value = false;
      showPopup('error', response.data.watchAd.message || 'Failed to process ad watch.');
    }
  } catch (error) {
    loading.value = false;
    console.error('Error during ad watch process:', error);
    const errorMessage = error.graphQLErrors
      ? error.graphQLErrors[0]?.message || 'An error occurred.'
      : 'Network error or Adsgram failed.';
    return showPopup('error', errorMessage);
  }
};

// Таймер
const startTimer = () => {
  if (timerInterval.value) return;
  timerInterval.value = setInterval(() => {
    setCurrentTimer(endTimer.value);
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
      disabled.value = false;
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
  if (timerInterval.value) return;
  if (disabled.value && endTimer.value) {
    setCurrentTimer(endTimer.value);
    if (timer.value > 0) {
      startTimer();
    } else {
      disabled.value = false;
      if (ads.value) ads.value.watched = 0;
    }
  } else {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    timer.value = 0;
  }
}

watch(endTimer, () => {
  prepareTimer();
});

onMounted(() => {
    // Вызываем refetchTasks для загрузки начальных данных из GET_TASKS
    refetchTasks()
      .then(() => {
        // Тут можно что-то сделать после загрузки данных
      })
      .catch(error => {
        console.error('Error loading tasks:', error);
        // Обработка ошибок при загрузке начальных данных
      });

  // Проверяем, должен ли таймер быть активен при старте
  if (ads.value?.watched >= ads.value?.limit) {
    disabled.value = true;
  } else {
    disabled.value = false;
  }
  prepareTimer();
});

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
});

</script>

<template>
  <!-- Ваш шаблон здесь -->
  <div :class="MainStyle.container">
    <div :class="MainStyle.adsWrapper">
      <button
        :class="[MainStyle.adsButton, loading ? MainStyle.loading : '', disabled ? MainStyle.disabled : '']"
        @click="watchAds"
        :disabled="loading || disabled"
      >
        <Animation v-if="loading" :animation="AnimationsAds.rotate" />
        <Icon v-else :icon="TasksIcon" />
        <span v-if="!loading">
          {{ disabled ? `Wait ${stringTime}` : 'Watch Ad' }}
        </span>
      </button>
       <div v-if="ads?.limit" :class="MainStyle.adsInfo">
            Watched: {{ ads.value?.watched }} / {{ ads.value?.limit }}
          </div>
    </div>
  </div>
</template>

<style module="MainStyle">
/* Ваши стили */
.container {
  margin: 20px;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  color: white;
}

.adsWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.adsButton {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.3s ease;
}

.adsButton:hover:not(:disabled) {
  background-color: #0056b3;
}

.adsButton.disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.adsButton.loading {
  background-color: #6c757d;
  cursor: wait;
}

.adsInfo {
  font-size: 14px;
  color: #adb5bd;
}
</style>


<template>
  <Animation
    name="tasks-ads"
    :animation-style="AnimationsAds"
    :start-animation="true"
  >
    <div :class="MainStyle['tasks-ads']">
      <div :class="MainStyle['tasks-title']">
        Реклама
      </div>
      <div :class="MainStyle['tasks-description']">
        Смотрите ежедневную рекламу и получайте +{{ ads.ad_reward }} $Tonomo!
      </div>

      <Animation
        name="tasks-ads-button"
        :animation-style="AnimationsAds"
        :start-animation="true"
      >
        <button
          :class="[MainStyle['ads-button'], loading ? MainStyle['loading'] : '', disabled ? MainStyle['disabled'] : '']"
          @click="watchAds"
          :disabled="loading || disabled"
        >
          <span :class="MainStyle['badge']">Ads</span>
          <div :class="MainStyle['name']">
            <Icon :class="MainStyle['styled-icon']" name="ad" />
            <span :class="MainStyle['text']">Посмотреть</span>
          </div>
          <span v-if="!disabled" :class="MainStyle['count']">
            {{ ads.watched }} / {{ ads.limit }}
          </span>
          <span v-else :class="MainStyle['count']">
            {{ stringTime }}
          </span>
        </button>
      </Animation>
    </div>
  </Animation>
</template>


