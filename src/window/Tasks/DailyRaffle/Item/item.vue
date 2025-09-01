<script setup>
import ItemStyle from './item.module.css'
import NoImage from '~/assets/images/no-image.png'
import { useStore } from 'vuex'
import { computed } from 'vue'
import GenericStyle from '~/assets/css/generic.module.css'

const props = defineProps({
	place: Number,
	userId: Number,
	avatar: String,
	name: String,
})

const store = useStore()
const user = computed(() => store.state.user)
</script>

<template>
	<div
		:class="{
			[ItemStyle['item']]: true,
			[ItemStyle['my-item']]: user.id === props.userId,
		}"
	>
		<div :class="{ [ItemStyle['left-block']]: true }">
			<div :class="{ [ItemStyle['place']]: true }" :data-place="props.place">
				<span :class="{ [ItemStyle['num']]: true }">{{ place }}</span>
			</div>
			<div
				:class="{ [ItemStyle['avatar']]: true }"
				:style="{ backgroundImage: `url(${props.avatar}), url(${NoImage})` }"
			></div>
			<div :class="{ [ItemStyle['info']]: true }">
				<div
					:class="{
						[ItemStyle['name']]: true,
						[GenericStyle['text-overflow-140']]: true,
					}"
				>
					{{ props.name }}
				</div>
			</div>
		</div>
		<div
			v-if="props.userId === user.id"
			:class="{ [ItemStyle['you-text']]: true }"
		>
			You
		</div>
	</div>
</template>
