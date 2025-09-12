<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App.vue 现在只负责路由容器
</script>

<style>
/* 全局样式保持在这里 */
html,
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  height: 100vh;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden; /* 隐藏body滚动条 */
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

#app {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden; /* 隐藏app容器滚动条 */
}
</style>
