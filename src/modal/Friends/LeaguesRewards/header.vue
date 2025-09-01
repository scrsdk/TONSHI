<script setup>
import HeaderStyle from "./header.module.css";
</script>

<template>
  <div :class="{ [HeaderStyle['bottom-modal-header-custom']]: true }">
    <div :class="{ [HeaderStyle['image']]: true }"></div>
    <span :class="{ [HeaderStyle['title']]: true }">Bonus for upgrading league your friend</span>
  </div>
</template>