<template>
  <dialog-toolbar :title="$t('Grid View')" />
  <v-card-text
    class="px-3 pb-2 pt-0 dialog-container"
    :class="{
      'dialog-container--fullscreen': showFullscreenDialogs,
    }"
  >
    <div
      class="plus plus--horizontal"
      :class="{'plus--disabled': selectedViews.length >= 3}"
      @click="addRow(0)"
    />
    <div v-for="(row, rowIndex) in selectedViews" :key="`row-${rowIndex}`" class="d-flex my-2">
      <div
        class="plus plus--vertical mr-1"
        :class="{'plus--disabled': row.length >= 4}"
        @click="addSlot(row, 0)"
      />
      <v-row>
        <v-col
          v-for="(col, colIndex) in row"
          :key="`row-${rowIndex}-col-${colIndex}`"
          :cols="12/row.length"
        >
          <v-hover>
            <template #default="{props, isHovering}">
              <v-card
                v-bind="props"
                class="slot-card mx-1 pa-4 d-flex flex-column align-center justify-center"
                :height="cardHeight"
                :elevation="isHovering ? 3 : 2"
              >
                <v-icon v-if="selectedViews.flat().length > 2" class="close-icon" @click="removeSlot(rowIndex, colIndex)">
                  {{ mdiClose }}
                </v-icon>
                <div class="my-1">
                  <selection-input
                    use-chips
                    :model-value="[col.module]"
                    :items="modules"
                    is-single-select
                    required
                    @update:model-value="onSelectModule(rowIndex, colIndex, $event[0])"
                  />
                </div>
                <div class="my-1 max-width-100">
                  <selection-input
                    use-chips
                    :prepend-text="getModulePrepend(col.module) + ':'"
                    :model-value="col.id ? [col.id] : []"
                    :items="getModuleItems(col.module)"
                    :groups="col.module === 'shiftview' ? stationGroups : null"
                    :is-grouped-select="col.module === 'shiftview'"
                    is-single-select
                    required
                    :error="validationResult?.[rowIndex]?.[colIndex] === 'error'"
                    @update:model-value="onSelectModuleItem(rowIndex, colIndex, $event[0])"
                  />
                </div>
              </v-card>
            </template>
          </v-hover>
        </v-col>
      </v-row>
      <div
        class="plus plus--vertical ml-1"
        :class="{'plus--disabled': row.length >= 4}"
        @click="addSlot(row, row.length)"
      />
    </div>
    <div
      class="plus plus--horizontal"
      :class="{'plus--disabled': selectedViews.length >= 3}"
      @click="addRow(selectedViews.length)"
    />
    <content-column
      v-if="shortUrl"
      class="mt-2"
      :content-header="$t('URL')"
      :content-value="shortUrl"
      :prepend-icon="mdiLaptop"
    />
  </v-card-text>
  <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
    <v-spacer />
    <evocon-v-button
      :text="$t('Cancel')"
      type="secondary"
      @click="closeDialog"
    />
    <evocon-v-button
      :text="$t('Open')"
      :icon="mdiOpenInNew"
      color="primary"
      @click="onOpenGridView"
    />
  </v-card-actions>
</template>

<script setup name="GridViewDialog">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { mdiClose, mdiOpenInNew, mdiLaptop } from '@mdi/js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { cloneDeep } from 'lodash';

import dialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import ContentColumn from '@/components/molecules/ContentColumn/index.vue';
import dashboardApi from '@/api/dashboardApi';
import urlShortenerApi from '@/api/urlShortenerApi';
import useBookmarkStore from '@/stores/bookmark';
import useDeviceStore from '@/stores/device';
import useGenericDialogStore from '@/stores/genericDialog';
import useStationStore from '@/stores/station';


const bookmarkStore = useBookmarkStore();
const deviceStore = useDeviceStore();
const genericDialogStore = useGenericDialogStore();
const stationStore = useStationStore();

const showFullscreenDialogs = computed(() => deviceStore.showFullscreenDialogs);
const stations = computed(() => stationStore.stations);
const stationGroups = computed(() => stationStore.stationGroups);
const bookmarks = computed(() => bookmarkStore.bookmarks);
const presets = computed(() => bookmarkStore.bookmarkPresetsMap);
const closeDialog = () => genericDialogStore.closeDialog();

const cardHeight = computed(() => {
  if (selectedViews.value.length === 1) return '350px';
  if (selectedViews.value.length === 2) return '200px';
  return '150px';
});

let dashboard = null;
const shortUrl = ref('');
const validationResult = ref([]);

const modules = [
  { name: t('Shift view'), id: 'shiftview' },
  { name: t('Factory view'), id: 'factory-view' },
  { name: t('Dashboard'), id: 'dashboard' },
  { name: t('Report'), id: 'report' },
];

onBeforeMount(async () => {
  bookmarkStore.fetchBookmarks();
  dashboard = await dashboardApi.loadDashboardState();
});

const selectedViews = ref([[{ module: 'shiftview', id: null }, { module: 'shiftview', id: null }], [{ module: 'shiftview', id: null }, { module: 'shiftview', id: null }]]);

watch(selectedViews, () => {
  shortUrl.value = '';
}, { deep: true });

const addRow = (index) => {
  if (selectedViews.value.length >= 3) return;
  selectedViews.value.splice(index, 0, [{ module: 'shiftview', id: null }]);
};

const addSlot = (row, index) => {
  if (row.length >= 4) return;
  row.splice(index, 0, { module: 'shiftview', id: null });
};

const removeSlot = (rowIndex, colIndex) => {
  const copy = cloneDeep(selectedViews.value);
  copy[rowIndex].splice(colIndex, 1);
  if (copy[rowIndex].length === 0) {
    copy.splice(rowIndex, 1);
  }
  selectedViews.value = copy;
};

const onSelectModule = (rowIndex, colIndex, module) => {
  const copy = cloneDeep(selectedViews.value);
  copy[rowIndex][colIndex] = { module, id: null };
  selectedViews.value = copy;
};

const onSelectModuleItem = (rowIndex, colIndex, id) => {
  const copy = cloneDeep(selectedViews.value);
  copy[rowIndex][colIndex] = { ...copy[rowIndex][colIndex], id };
  selectedViews.value = copy;

  // Clear error state for this slot when user selects an id
  if (id && validationResult.value[rowIndex]?.[colIndex]) {
    validationResult.value[rowIndex][colIndex] = 'valid';
  }
};

const getModuleItems = (module) => {
  if (module === 'shiftview') return stations.value;
  if (module === 'dashboard') return dashboard?.pages || [];
  if (module === 'factory-view') return [{ name: t('Live'), id: 'realtime' }, { name: t('Timeline'), id: 'timeline' }];
  if (module === 'report') return [...bookmarks.value, ...Object.values(presets.value)].map((b) => ({ ...b, id: b.url }));
  return [];
};

const getModulePrepend = (module) => {
  if (module === 'shiftview') return t('Station');
  if (module === 'dashboard' || module === 'factory-view') return t('Tab');
  if (module === 'report') return t('Report');
  return '';
};

const generateShortUrl = async (url) => {
  const res = await urlShortenerApi.saveUrl(url);
  shortUrl.value = `${window.location.origin}/#/?s=${res}`;
};

const validate = () => {
  const result = [];
  selectedViews.value.forEach((row) => {
    const rowResult = [];
    row.forEach((col) => rowResult.push(col.id ? 'valid' : 'error'));
    result.push(rowResult);
  });
  validationResult.value = result;
};

const getSelectedViewsString = async () => {
  const views = [];
  for (const row of selectedViews.value) {
    const rowViews = [];
    for (const col of row) {
      if (col.module === 'report') {
        const shortenedUrl = await urlShortenerApi.saveUrl(`${window.location.origin}/${col.id}`);
        rowViews.push(`?s=${shortenedUrl}`);
      } else {
        rowViews.push(`${col.module}/${col.id}`);
      }
    }
    views.push(rowViews);
  }
  return JSON.stringify(views);
};

const onOpenGridView = async () => {
  validate();
  if (validationResult.value.flat().includes('error')) return;
  const viewsString = await getSelectedViewsString();
  const res = `${window.location.origin}/#/split?titles=true&views=${encodeURIComponent(viewsString)}`;
  await generateShortUrl(res);
  window.open(res, '_blank');
};
</script>

<style scoped lang="scss">
.plus {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background-color: var(--color-12-primary);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;

  &::after {
    content: '+';
  }

  &--horizontal {
    margin: 0px 36px;
    height: 28px;
  }

  &--vertical {
    width: 28px;
    min-width: 28px;
    max-width: 28px;
  }

  &--disabled {
    background-color: rgba(0, 0, 0, 0.12);
    color: var(--secondary-dark);
    pointer-events: none;
    opacity: 0.5;
  }

  &:hover {
    cursor: pointer;
    background-color: var(--color-28-primary);
  }
}

.close-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.dialog-container {
  max-height: calc(90vh - 124px);
  overflow: hidden;
  overflow-y: auto;

  &--fullscreen {
    max-height: calc(100vh - 124px);
  }
}
</style>
