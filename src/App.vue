<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
@import '@/styles/main.css';
@import '@/styles/catalogo.css';
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
