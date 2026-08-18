<template>
  <v-app-bar
    theme="light"
    :height="height"
    :color="bannerColor"
    :class="['px-4', { 'clickable': clickable }]"
    @click="emit('click')"
  >
    <v-icon :color="iconColor" size="small" class="mr-2">
      {{ icon }}
    </v-icon>
    <span class="font-weight-medium">{{ text }}</span>
  </v-app-bar>
</template>
<script setup name="ReminderBanner">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const display = useDisplay();

defineProps({
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: '',
  },
  bannerColor: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  clickable: {
    type: Boolean,
  },
  bannerHoverColor: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['click']);

const height = computed(() => {
  const defaultHeight = 40;
  const smallScreenHeight = 64;
  if (display.smAndDown.value) {
    return smallScreenHeight;
  }
  return defaultHeight;
});
</script>
<style lang="scss" scoped>
.clickable {
  cursor: pointer;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: v-bind(bannerHoverColor);
    opacity: 0;
  }

  &:hover:after {
    opacity: 1;
  }
}
</style>
