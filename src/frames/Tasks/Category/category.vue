<script setup>
import {computed, inject} from "vue";
import MainStyle from "./category.module.css"
import Item from "./Item/item.vue";
import Icon from "~/components/Icon/icon.vue";
import AnimationsCategory from "~/frames/Tasks/Category/animations.module.css";
import Animation from "~/components/animation.vue";

const categories = inject('tasks-categories')
const tasks = inject('tasks-list')
const selectedCategory = inject('tasks-selected-category')

const categoryInfo = computed(() => {
  return categories.value.find(item => item.type === selectedCategory.value);
})

const sortedCategoryItems = computed(() => {
  const items = tasks.value.find(item => item.type === selectedCategory.value)?.list;
  return items?.sort((a, b) => {
    const claimDiff = a.claim - b.claim;
    if (claimDiff !== 0) return claimDiff;
    return a.reward - b.reward;
  });
});
</script>

<template>
  <Animation name="tasks-category" :animation-style="AnimationsCategory" :start-animation="true">
    <div :class="{ [MainStyle['tasks-category']]: true }">
      <div :class="{ [MainStyle['tasks-category-content']]: true }" v-if="sortedCategoryItems.length > 0">
        <Item
            v-for="(item, key) of sortedCategoryItems"
            :key="item.id"
            :animation-id="key + 1"
            :item-id="item.id"
            :type="item.type"
            :title="item.title"
            :reward="item.reward"
            :info="item.info"
            :claim="item.claim"
            :period="item.period"
        />
      </div>
      <div :class="{ [MainStyle['tasks-category-not-found']]: true }" v-else>
        <Animation name="tasks-category-not-found-title" :animation-style="AnimationsCategory" :start-animation="true">
          <Icon :class="{ [MainStyle['styled-icon']]: true }" name="bottom-menu-tasks" />
        </Animation>
        <Animation name="tasks-category-not-found-description" :animation-style="AnimationsCategory" :start-animation="true">
          <span :class="{ [MainStyle['text']]: true }">The list of tasks in the {{ categoryInfo.name }} category is empty.</span>
        </Animation>
      </div>
    </div>
  </Animation>
</template>