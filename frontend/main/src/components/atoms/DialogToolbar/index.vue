<template>
  <v-toolbar
    flat
    :color="color"
    class="d-flex justify-center"
    :height="subtitle ? 78 : 64"
  >
    <v-toolbar-title class="mx-6 d-flex justify-center font-weight-medium">
      <slot name="prepend" />
      <div class="text-center" :class="{ 'text-truncate': !subtitle, 'text-wrap': !!subtitle }">
        <div class="d-flex align-center justify-center">
          <v-icon
            v-if="!!titleIcon"
            class="mr-2"
            size="24"
            :color="iconColor"
          >
            {{ titleIcon }}
          </v-icon>
          <span id="toolbar-title" class="text-truncate">
            {{ title }}
          </span>
          <slot name="append" />
        </div>
        <div v-if="!!subtitle" class="subtitle text-body-medium text-secondary-dark">
          {{ subtitle }}
        </div>
      </div>
    </v-toolbar-title>
  </v-toolbar>
</template>
<script>
export default {
  name: 'DialogToolbar',
  props: {
    title: {
      type: String,
      default: '',
    },
    titleIcon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'white',
    },
    iconColor: {
      type: String,
      default: 'secondary-text',
    },
    subtitle: {
      type: String,
      default: null,
    },
  },
};
</script>
