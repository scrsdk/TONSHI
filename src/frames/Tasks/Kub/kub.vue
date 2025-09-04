<script setup>
import AnimationsNickname from './animations.module.css' // Предполагаем, что эти анимации общие
import MainStyle from './kub.module.css' // Основные стили, которые мы будем адаптировать
import Animation from '../../../components/animation.vue'
import Icon from '~/components/Icon/icon.vue'
// secondsToHMS и showPopup остаются, если они нужны для других частей, но для кубика не требуется
// import secondsToHMS from '~/functions/secondsToHMS' 
// import showPopup from '~/functions/showPopup' 

import { watch, ref, inject, computed, onBeforeMount, onUnmounted } from 'vue'
import { useWebApp } from 'vue-tg'

// Удаляем injection, так как nickname больше не нужен
// const nickname = inject('tasks-nickname')

// --- Новые переменные для игры "Кубик" ---
const isRolling = ref(false) // Флаг, показывающий, идет ли бросок
const rollResult = ref(null) // Результат броска (1, 2, 3, 4)
const earnedTonomo = ref(0) // Количество заработанных $Tonomo

// --- Проверка наличия $Tonomo в имени Telegram пользователя ---
const webApp = useWebApp()
const isTonomoInUsername = computed(() => {
 const tgUser = webApp.initDataUnsafe.user
 return (
  tgUser.first_name?.includes('$Tonomo') || // Используем ?. для безопасности
  tgUser.last_name?.includes('$Tonomo')
 )
})

// --- Функция для броска кубика ---
const rollDice = () => {
 if (isRolling.value || !isTonomoInUsername.value) return // Нельзя бросить, если уже бросаем или нет $Tonomo в имени

 isRolling.value = true
 earnedTonomo.value = 0 // Сбрасываем заработанное
 rollResult.value = null // Сбрасываем предыдущий результат

 // Симулируем "загрузку" перед показом результата
 setTimeout(() => {
  const randomNumber = Math.random() // Случайное число от 0 до <1

  if (randomNumber < 0.05) { // 5% шанс на 4 (редкость)
   rollResult.value = 4
   earnedTonomo.value = Math.floor(Math.random() * 50) + 50 // От 50 до 99 $Tonomo
  } else if (randomNumber < 0.25) { // 20% шанс на 3
   rollResult.value = 3
   earnedTonomo.value = Math.floor(Math.random() * 20) + 20 // От 20 до 39 $Tonomo
  } else if (randomNumber < 0.65) { // 40% шанс на 2
   rollResult.value = 2
   earnedTonomo.value = Math.floor(Math.random() * 10) + 10 // От 10 до 19 $Tonomo
  } else { // 35% шанс на 1
   rollResult.value = 1
   earnedTonomo.value = Math.floor(Math.random() * 5) + 1 // От 1 до 5 $Tonomo
  }

  isRolling.value = false // Бросок завершен

  // Показываем всплывающее сообщение о заработке
  // Предполагаем, что showPopup доступен, если импортирован
  if (earnedTonomo.value > 0) {
   // showPopup('success', `Вы заработали +${earnedTonomo.value} $Tonomo!`)
   // Если showPopup не импортирован, можно использовать alert или другую логику
   alert(`Вы заработали +${earnedTonomo.value} $Tonomo!`)
  }
 }, 1500) // Задержка в 1.5 секунды для эффекта броска
}

// --- Удаляем старую логику для ежедневного бонуса ---
// loading, endTimer, timer, timerInterval, disabled, submit, startTimer, stringTime, setCurrentTimer, prepareTimer, watch, onErrorClaimNicknameBonus, onBeforeMount, onUnmounted

// --- Можно добавить небольшой таймер, если нужно, чтобы кнопка "Бросить" была недоступна какое-то время после броска,
// но сейчас мы просто блокируем ее через isRolling. Если нужна задержка, можно добавить:
const cooldownTimer = ref(0)
const cooldownInterval = ref(null)

const startCooldown = () => {
 cooldownTimer.value = 5 // Например, 5 секунд перезарядки
 if (cooldownInterval.value) clearInterval(cooldownInterval.value)
 cooldownInterval.value = setInterval(() => {
  cooldownTimer.value--
  if (cooldownTimer.value <= 0) {
   clearInterval(cooldownInterval.value)
   cooldownInterval.value = null
  }
 }, 1000)
}

// Обновляем rollDice для использования cooldown
const rollDiceWithCooldown = () => {
 if (isRolling.value || !isTonomoInUsername.value || cooldownTimer.value > 0) return

 isRolling.value = true
 earnedTonomo.value = 0
 rollResult.value = null

 setTimeout(() => {
  const randomNumber = Math.random()
  if (randomNumber < 0.05) {
   rollResult.value = 4
   earnedTonomo.value = Math.floor(Math.random() * 50) + 50
  } else if (randomNumber < 0.25) {
   rollResult.value = 3
   earnedTonomo.value = Math.floor(Math.random() * 20) + 20
  } else if (randomNumber < 0.65) {
   rollResult.value = 2
   earnedTonomo.value = Math.floor(Math.random() * 10) + 10
  } else {
   rollResult.value = 1
   earnedTonomo.value = Math.floor(Math.random() * 5) + 1
  }

  isRolling.value = false
  if (earnedTonomo.value > 0) {
   alert(`Вы заработали +${earnedTonomo.value} $Tonomo!`)
   startCooldown() // Запускаем перезарядку после успешного броска
  }
 }, 1500)
}

// Используем rollDiceWithCooldown в шаблоне
// const currentRollAction = computed(() => isRolling.value || cooldownTimer.value > 0 ? () => {} : rollDiceWithCooldown) // На всякий случай, если захотите использовать

onUnmounted(() => {
 if (cooldownInterval.value) {
  clearInterval(cooldownInterval.value)
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
      <!-- Раздел для игры "Кубик" -->
   <div v-else> <!-- Отображаем игру, если $Tonomo есть в имени -->
    <div :class="{ [MainStyle['tasks-title']]: true }">
     Игра "Кубик"
    </div>
    <div :class="{ [MainStyle['tasks-description']]: true }">
     Брось кубик и получи шанс выиграть 1-4 $Tonomo!
    </div>

    <!-- Отображение результата кубика -->
    <div v-if="rollResult !== null" :class="{ [MainStyle['dice-result']]: true }">
     <!-- Тут можно добавить красивую анимацию или картинку кубика -->
     <div :class="{ [MainStyle['result-text']]: true }">
      Выпало: {{ rollResult }}
     </div>
     <div :class="{ [MainStyle['earned-text']]: true }" v-if="earnedTonomo > 0">
      Заработано: +{{ earnedTonomo }} $Tonomo!
     </div>
    </div>

    <!-- Кнопка для броска кубика -->
    <Animation
     name="tasks-nickname-button"
     :animation-style="AnimationsNickname"
     :start-animation="true"
    >
     <button
      :class="{ [MainStyle['nickname-button']]: true, [MainStyle['rolling']]: isRolling }"
      :disabled="isRolling"
      @click="rollDice"
     >
      <div :class="{ [MainStyle['name']]: true }">
       <Icon :class="{ [MainStyle['styled-icon']]: true }" name="gift" /> <!-- Можно заменить на иконку кубика -->
       <span :class="{ [MainStyle['text']]: true }">
        {{ isRolling ? 'Ждем..' : (rollResult !== null ? 'Бросить еще?' : 'Бросить кубик') }}
       </span>
      </div>
      <span :class="{ [MainStyle['time']]: true }" v-if="isRolling">
       <span v-for="n in 3" :key="n" :class="MainStyle['dot']">.</span> <!-- Эффект "..." -->
      </span>
     </button>
    </Animation>
   </div>


  </div>
 </Animation>
</template>

