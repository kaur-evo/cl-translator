<template>
  <div class="dev-chat-page d-flex align-center justify-center fill-height">
    <mr-evocon-chat
      chat-endpoint="/chat"
      feedback-endpoint="/feedback"
      mock-backend
      @close="onClose"
    />
  </div>
</template>

<script setup name="DevChatPage">
import MrEvoconChat from '@/components/organisms/MrEvoconChat/index.vue';

function onClose() {
  window.history.back();
}
</script>

<style lang="scss" scoped>
.dev-chat-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-input-background));
  padding: 24px 16px;
}
</style>
