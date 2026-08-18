<template>
  <v-card class="mt-4 d-flex" min-height="62">
    <v-card-text class="d-flex align-center py-2 px-4">
      <v-icon
        id="generic-message-icon"
        :color="iconColor"
        class="mr-4"
      >
        {{ icon }}
      </v-icon>
      <div>
        <div
          v-if="message"
          id="generic-message"
          class="text-body-large font-weight-medium"
        >
          {{ message }}
        </div>
        <div
          v-if="description"
          id="generic-message-description"
          class="text-body-medium"
        >
          {{ description }}
        </div>
      </div>
      <slot name="action-button" />
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiCheckCircle } from '@mdi/js';

const vectorIcons = { mdiCheckCircle };
export default {
  name: 'GenericMessageCard',
  props: {
    icon: {
      type: String,
      default: mdiCheckCircle,
    },
    iconColor: {
      type: String,
      default: 'primary',
    },
    message: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      ...vectorIcons,
    };
  },
};
</script>
