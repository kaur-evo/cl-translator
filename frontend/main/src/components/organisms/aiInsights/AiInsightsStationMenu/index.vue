<template>
  <v-menu
    :key="menuActivatorKey"
    v-model="menuOpen"
    :target="menuActivator"
    :close-on-content-click="false"
    location="bottom start"
    origin="auto"
  >
    <v-card width="300">
      <v-card-title class="text-body-large font-weight-medium px-4 py-3 d-flex align-center">
        <span class="flex-grow-1 text-truncate">{{ selectedStopReasonName }}</span>
        <evocon-v-button
          :icon="mdiClose"
          size="small"
          class="ml-2"
          :aria-label="$t('Close')"
          @click="onClose"
        />
      </v-card-title>

      <v-divider />

      <div class="px-4 pt-2 pb-1 text-label-small text-medium-emphasis">
        {{ $t('Select station') }}
      </div>

      <div class="px-2 pb-2">
        <p v-if="stations.length === 0" id="no-stations-message" class="text-body-medium text-medium-emphasis px-2">
          {{ $t('No stations with enough notes for analysis.') }}
        </p>

        <selection-list
          v-else
          :model-value="selectedStationIds"
          :items="stations"
          item-text="name"
          item-value="id"
          :item-secondary-text="getStationNoteCountText"
          is-single-select
          hide-search
          height="auto"
          max-height="240px"
          @update:model-value="onStationSelect"
        />
      </div>

      <v-card-actions class="pa-4 pt-2">
        <evocon-v-button
          color="primary"
          :text="$t('Get insights')"
          :disabled="!selectedStationId || analyzing"
          :loading="analyzing"
          class="flex-grow-1"
          @click="onSubmit"
        />
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { mdiClose } from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import { getAiInsightsIconId } from '@/constants/aiInsights';
import useAiInsightsStore from '@/stores/aiInsights';

const aiInsightsStore = useAiInsightsStore();
const { selectedStopReasonId, selectedStationId, analyzing, selectedStopReasonName } = storeToRefs(aiInsightsStore);
const { t } = useI18n();

const emit = defineEmits<{
  submit: [];
}>();

const onClose = () => {
  aiInsightsStore.closeMenu();
};

/** Writable computed so v-menu can close on outside-click (open is driven by openMenu action) */
const menuOpen = computed({
  get: () => aiInsightsStore.menuOpen,
  set: (value: boolean) => {
    if (!value) onClose();
  },
});
/** SelectionList expects an array for v-model, even in single-select mode */
const selectedStationIds = computed(() => (selectedStationId.value ? [selectedStationId.value] : []));

/**
 * Stable ref for the menu target CSS selector (positioning-only, no click handler).
 * Only updates when a new menu opens — never clears on close.
 * closeMenu clears selectedStopReasonId in the same tick as menuOpen,
 * and v-menu needs a valid :target reference to animate its close transition.
 */
const menuActivator = ref<string | undefined>(undefined);

/**
 * Key used on v-menu to force re-mount when the target changes.
 * Toggled on every open to ensure Vuetify resolves against fresh DOM,
 * even when the same stop reason icon is clicked after a table re-render.
 * A programmatic close() would not re-resolve the target anchor, hence the re-mount approach.
 */
const menuActivatorKey = ref(0);

watch(selectedStopReasonId, (stopReasonId) => {
  if (stopReasonId) {
    menuActivator.value = `#${getAiInsightsIconId(stopReasonId)}`;
    menuActivatorKey.value ^= 1;
  }
}, { immediate: true });

/** Stations pre-sorted alphabetically in transformToEligibleStationsMap */
const stations = computed(() => {
  if (!selectedStopReasonId.value) return [];
  return aiInsightsStore.getStationsForStopReason(selectedStopReasonId.value);
});

// ---- Event handlers ----

/** SelectionList emits an array; extract the single selected value */
const onStationSelect = (stationIds: number[]) => {
  const stationId = stationIds[0] ?? null;
  aiInsightsStore.selectStation(stationId);
};

/** Returns the note count as secondary text for each station item */
const getStationNoteCountText = (station: { noteCount: number }) => (
  t('{count} notes', { count: station.noteCount })
);

/**
 * Submit analysis request.
 * Emits a signal to the parent (ReportsMain) which reads dates from the reportsConfig store
 * and dispatches submitAnalysis. The store action reads stationId/stopReasonId from its own state.
 */
const onSubmit = () => {
  if (!selectedStopReasonId.value || !selectedStationId.value || analyzing.value) return;

  emit('submit');
};
</script>
