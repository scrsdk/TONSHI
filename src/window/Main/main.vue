<script setup>
import { useStore } from 'vuex'
import { computed, watch } from 'vue'
import toggleWindow from '../../functions/toggleWindow.js'
import { useRoute } from 'vue-router'
import Icon from '../../components/Icon/icon.vue'
import AnimationsMain from './animations.module.css'
import MainStyle from './main.module.css'
import Animation from '../../components/animation.vue'

/* Contents */
import TopInvitersWindow from '../Friends/TopInviters/Main/main.vue'
import TopPlayersWindow from '../Home/TopPlayers/Main/main.vue'

const route = useRoute()
const store = useStore()
const windowContent = computed(() => store.state.window)

watch(
	() => route.path,
	() => {
		if (windowContent.value.active) {
			toggleWindow()
		}
	}
)
</script>

<template>
	<Animation
		name="window-container"
		:animation-style="AnimationsMain"
		:start-animation="true"
	>
		<div
			:data-current-window="windowContent.selected"
			:class="{ [MainStyle['window-container']]: true }"
			v-if="windowContent.active"
		>
			<div :class="{ [MainStyle['window-header']]: true }">
				<button
					type="button"
					:class="{ [MainStyle['window-close-button']]: true }"
					@click="() => toggleWindow()"
				>
					<Icon
						:class="{ [MainStyle['styled-icon']]: true }"
						name="pagination-left"
					/>
					<span :class="{ [MainStyle['name']]: true }">Back</span>
				</button>
			</div>
			<div :class="{ [MainStyle['window-body']]: true }">
				<TopInvitersWindow
					v-if="windowContent.selected === 'friends-top-inviters'"
					v-bind="windowContent.props"
				/>
				<TopPlayersWindow
					v-if="windowContent.selected === 'home-top-players'"
					v-bind="windowContent.props"
				/>
			</div>
		</div>
	</Animation>
</template>
