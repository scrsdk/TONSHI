<script setup>
import { useRoute, useRouter } from 'vue-router'
import Item from './item.vue'
import BottomMenuStyle from "~/components/BottomMenu/bottom-menu.module.css";
import Animation from "~/components/animation.vue";
import AnimationBottomMenu from "./animations.module.css"

const route = useRoute()
const router = useRouter()
</script>

<template>
  <Animation name="bottom-menu" :animation-style="AnimationBottomMenu" :start-animation="true">
    <div :class="{ [BottomMenuStyle['bottom-menu']]: true }">
      <div :class="{ [BottomMenuStyle['menu-items']]: true }">
        <Item
            icon="home"
            title="Home"
            :tap="() => router.push('/')"
            :active="route.path === '/'"
        />
        <Item
            icon="tasks"
            title="Tasks"
            :tap="() => router.push('/tasks')"
            :active="route.path === '/tasks'"
        />
        <Item
            icon="friends"
            title="Friends"
            :tap="() => router.push('/friends')"
            :active="route.path === '/friends'"
        />
        <Item
            icon="shop"
            title="Shop"
            :tap="() => router.push('/shop')"
            :active="route.path === '/shop'"
        />
      </div>
    </div>
  </Animation>
</template>