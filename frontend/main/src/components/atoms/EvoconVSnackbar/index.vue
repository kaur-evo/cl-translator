<template>
  <v-snackbar
    v-bind="attrs"
    :location="props.location ?? 'top right'"
    :timeout="props.timeout"
    :content-class="`pa-0 rounded ${backgroundColorClass}`"
    class="pt-0"
    offset="50px"
    :max-width="isMobileView ? '340px' : '500px'"
    theme="light"
  >
    <div class="fill-height px-4 py-3 d-flex flex-row flex-nowrap align-center">
      <v-icon
        v-if="icon"
        :color="iconColor"
        class="mr-2"
      >
        {{ icon }}
      </v-icon>
      <span>
        <div v-if="props.label" class="text-body-large font-weight-medium">
          {{ props.label }}
        </div>
        <span
          v-if="props.description"
          :class="'text-body-medium'"
        >
          {{ props.description }}
        </span>
      </span>
    </div>
    <template #actions>
      <slot name="actions" />
      <evocon-v-button
        class="ml-3"
        color="secondary-dark"
        :icon="mdiCloseCircle"
        @click="emit('close')"
      />
    </template>
  </v-snackbar>
</template>
<script setup name="EvoconVSnackbar">
import { useAttrs, computed } from 'vue';
import {
  mdiCheckCircle, mdiAlert, mdiAlertCircle, mdiCloseCircle,
} from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import useDeviceStore from '@/stores/device';

const attrs = useAttrs();
const deviceStore = useDeviceStore();

const emit = defineEmits(['close']);

const props = defineProps({
  location: { type: String, default: 'top right' },
  timeout: { type: Number, default: 5000 },
  type: { type: String, default: '' },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
});

const isMobileView = computed(() => deviceStore.isMobileView);

const backgroundColorClass = computed(() => {
  if (props.type === 'warning') return 'bg-snackbar-yellow';
  if (props.type === 'error') return 'bg-snackbar-red';
  return 'bg-white';
});

const iconColor = computed(() => {
  if (props.type === 'success') return 'primary';
  if (props.type === 'warning') return 'lw-commented-yellow';
  if (props.type === 'error') return 'error';
  return 'icon-default';
});

const icon = computed(() => {
  if (props.icon) return props.icon;
  if (props.type === 'success') return mdiCheckCircle;
  if (props.type === 'warning') return mdiAlert;
  if (props.type === 'error') return mdiAlertCircle;
  return '';
});

</script>
