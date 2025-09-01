<script setup>
import AnimationsMain from "~/frames/Tasks/Main/animations.module.css";
import CategoriesStyle from "~/frames/Tasks/Main/categories.module.css";
import Animation from "~/components/animation.vue";
import {computed, inject} from "vue";

const categories = inject('tasks-categories')
const tasks = inject('tasks-list')
const selectedCategory = inject('tasks-selected-category')

const sortedCategories = computed(() => {
  return categories.value.filter(item => (tasks.value.find(task => task.type === item.type)?.list.length > 0));
})

const selectCategory = (category) => {
  if (
      !categories.value.find(item => item.type === category) ||
      selectedCategory.value === category
  ) return;
  selectedCategory.value = category;
}
</script>

<template>
  <Animation name="tasks-categories" :animation-style="AnimationsMain" :start-animation="true">
    <div :class="{ [CategoriesStyle['tasks-categories']]: true }">
      <button
          type="button"
          v-for="(category, key) of sortedCategories"
          :key="key"
          :class="{ [CategoriesStyle['tasks-category']]: true, [CategoriesStyle['active']]: selectedCategory === category.type }"
          @click="selectCategory(category.type)"
      >
        {{ category.name }}
      </button>
    </div>
  </Animation>
</template>