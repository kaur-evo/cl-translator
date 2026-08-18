<template>
  <div
    class="pa-2 d-flex justify-space-between align-center rounded content-column"
    :class="hasError ? 'error bg-error-tint' : 'bg-quaternary-dark'"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="prependIcon"
        :color="hasError ? 'error' : 'icon-default'"
        size="16"
        class="mr-2"
      >
        {{ prependIcon }}
      </v-icon>
      <div>
        <div class="text-body-small " :class="hasError ? 'text-error' : 'text-secondary-text'">
          {{ contentHeader }}
        </div>
        <slot v-if="slots.content" name="content" />
        <div v-else-if="contentValue" class="text-body-medium line-break-anywhere">
          {{ contentValue }}
        </div>
      </div>
    </div>
    <v-tooltip
      location="top"
      :text="$t('Click to copy')"
    >
      <template #activator="{ props }">
        <evocon-v-button
          :icon="mdiContentCopy"
          v-bind="props"
          @click="onCopyItem"
        />
      </template>
    </v-tooltip>
  </div>
</template>
<script setup name="ContentColumn">
import { useSlots } from 'vue';
import { mdiContentCopy } from '@mdi/js';

import { useGenericNotificationStore } from '@/stores/index';
import copyToClipboard from '@/helpers/copyToClipboard';
import i18n from '@/services/i18n';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const genericNotificationStore = useGenericNotificationStore();
const slots = useSlots();

const definedProps = defineProps({
  contentHeader: {
    type: String,
    default: '',
  },
  contentValue: {
    type: String,
    default: '',
  },
  prependIcon: {
    type: String,
    default: '',
  },
  hasError: {
    type: Boolean,
  },
});

function onCopyItem() {
  copyToClipboard(definedProps.contentValue);
  genericNotificationStore.openNotification({
    text: i18n.global.t('Value copied'),
    type: 'success',
  });
}
</script>
