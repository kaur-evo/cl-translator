<template>
  <settings-entities-overview
    :entity-name="entityName"
    :filter-configuration="filterConfiguration"
    :items="activityLogsList"
    :table-headers="tableHeaders"
    :loading="loading"
    row-click-mode="contentExpand"
    :navigate-to-edit-route="false"
    use-backend-filtering
    @link-click="$emit('link-click', $event)"
  >
    <template #inner-header>
      <div v-if="isMobileView" class="pa-2">
        <span class="text-headline-small">
          {{ innerHeader }}
        </span>
        <icon-with-tooltip
          :icon="mdiInformationOutline"
          :tooltip-text="$t('Learn more')"
          additional-classes="ml-1 mt-n1"
          :icon-clicked-fn="onOpenHelp"
        />
      </div>
    </template>
    <template #header>
      <v-menu v-model="menuOpen">
        <!-- eslint-disable-next-line vue/no-template-shadow -->
        <template #activator="{ props }">
          <div class="d-flex align-center text-truncate">
            <span class="text-headline-large">{{ overviewHeader }}</span>
            <evocon-v-button
              v-bind="props"
              :icon="mdiMenuDown"
              class="ml-2 mt-1"
            />
          </div>
        </template>
        <v-list theme="light" min-width="300">
          <v-list-item
            v-for="item in headerDropdownItems"
            :key="item.id"
            :href="item.url"
            :class="{ 'bg-primary-tint': item.id === headerSelectionKey }"
            @click="onListItemClick(item.id)"
          >
            <list-item-contents
              :input-value="item.id === headerSelectionKey"
              :primary-text="item.name"
              is-single-select
              checkbox
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template #header-append>
      <icon-with-tooltip
        :icon="mdiInformationOutline"
        :tooltip-text="$t('Learn more')"
        additional-classes="ml-2 mt-1"
        :icon-clicked-fn="onOpenHelp"
      />
    </template>
    <template #table-footer>
      <div v-if="!loading" class="d-flex justify-end">
        <evocon-v-data-footer
          v-model:options="tableOptions"
          :items="activityLogsList"
          :items-per-page-list="itemsPerPageOptions"
          has-unknown-total-items
          show-rows-per-page
        />
      </div>
    </template>
  </settings-entities-overview>
</template>
<script setup name="SettingsActivityLogsTemplate">
import {
  ref, computed, watch, nextTick,
} from 'vue';
import axios from 'axios';
import { mdiMenuDown, mdiInformationOutline } from '@mdi/js';

import i18n from '@/services/i18n';
import logApi from '@/api/logApi';
import activityLogsApi from '@/api/activityLogsApi';
import { entities } from '@/constants/activityLogsConstants';
import { tablePageOptions } from '@/constants/tableOptions';
import { getRequestParams } from '@/helpers/activityLogs/activityLogsHelpers';
import getObjectDiffKeys from '@/helpers/object/getObjectDiffKeys';
import formatActivityLogsEntries from '@/helpers/activityLogs/formatActivityLogsEntries';
import { useDeviceStore, useFilterbarStore, useGenericNotificationStore } from '@/stores/index';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import EvoconVDataFooter from '@/components/atoms/EvoconVDataFooter/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import getSVLogsEntityConfig from '@/components/pages/settings/SettingsActivityLogsSVOverview/svLogsEntitiesConfig';
import getSettingsEntityConfig from '@/components/pages/settings/SettingsActivityLogsSettingsOverview/settingsLogsEntitiesConfig';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';

const deviceStore = useDeviceStore();
const filterbarStore = useFilterbarStore();
const genericNotificationStore = useGenericNotificationStore();

const props = defineProps({
  entityName: { type: String, default: '' },
  headerSelectionKey: { type: String, default: '' },
  overviewHeader: { type: String, default: '' },
  filterConfiguration: { type: Object, default: () => new Map() },
  tableHeaders: { type: Array, default: () => [] },
  innerHeader: { type: String, default: '' },
  helpUrl: { type: String, default: '' },
});

const emit = defineEmits(['link-click', 'modify-entity-param']);

const loading = ref(false);
const currentRequest = ref(null);
const cancelTokenSource = ref(null);
const menuOpen = ref(false);
const activityLogsList = ref([]);
const tableOptions = ref({ itemsPerPage: 25, page: 1 });
const itemsPerPageOptions = ref(tablePageOptions);

const headerDropdownItems = computed(() => [
  { id: 'shiftview', name: i18n.global.t('Shift View logs'), url: '/#/settings/activitylogs/shiftview' },
  { id: 'settings', name: i18n.global.t('Settings logs'), url: '/#/settings/activitylogs/settings' },
]);

const requestFilterState = computed(() => filterbarStore.requestFilterState);
const isMobileView = computed(() => deviceStore.isMobileView);
const selectedEntity = computed(() => requestFilterState.value.entity?.[0]);

const requestEntities = computed(() => {
  if (props.entityName === 'svActivityLogs' && requestFilterState.value.events) {
    return { [entities.STATION]: requestFilterState.value[entities.STATION], ...Object.fromEntries(requestFilterState.value.events.map((event) => [event, []])) };
  }
  if (props.entityName === 'svActivityLogs') {
    return { [entities.STATION]: requestFilterState.value[entities.STATION] };
  }
  return { [selectedEntity.value]: requestFilterState.value[selectedEntity.value] ?? [] };
});

const onOpenHelp = () => {
  window.open(props.helpUrl, '_blank');
};

const onListItemClick = (id) => {
  logApi.logEvent([{
    type: 'activity log header selection',
    message: `Selected from header dropdown: ${id}`,
  }]);
};

const processActivityLogs = (activityLogs) => activityLogs.map((activityLog) => {
  let entitiesMap;
  if (props.entityName === 'svActivityLogs') {
    entitiesMap = getSVLogsEntityConfig({ eventType: activityLog.event, zoneId: activityLog.station.zoneId });
  } else {
    entitiesMap = getSettingsEntityConfig({ entityType: activityLog.entity.entityType });
  }
  const { oldValues, newValues } = formatActivityLogsEntries(entitiesMap, activityLog.oldValues, activityLog.newValues);
  return {
    ...activityLog,
    newValues,
    oldValues,
  };
});

const fetchActivityLogs = async () => {
  if (cancelTokenSource.value) cancelTokenSource.value.cancel();
  if (currentRequest.value) {
    try {
      await currentRequest.value;
    } catch {
      // Ignore errors from the previous request
    }
  }
  currentRequest.value = (async () => {
    try {
      const { CancelToken } = axios;
      cancelTokenSource.value = CancelToken.source();
      const requestParams = await getRequestParams(requestEntities.value, tableOptions.value);
      if (!requestParams.filter.entities || !requestParams.filter.startDate || !requestParams.filter.endDate) return;
      loading.value = true;
      let activityLogs;
      if (props.entityName === 'svActivityLogs') {
        activityLogs = await activityLogsApi.getSVActivityLogs(requestParams, { cancelToken: cancelTokenSource.value.token });
      } else {
        activityLogs = await activityLogsApi.getSettingsActivityLogs(requestParams, { cancelToken: cancelTokenSource.value.token });
      }
      activityLogsList.value = processActivityLogs(activityLogs);
    } catch (error) {
      if (!axios.isCancel(error)) genericNotificationStore.notifyError(i18n.global.t('We are sorry! There is a problem with your request'));
    } finally {
      loading.value = false;
    }
  })();

  await currentRequest.value;
};

const onRequestFilterStateChange = async (newVal, prevVal) => {
  await nextTick(); // wait that dateRange gets current value
  const changedQueryParams = getObjectDiffKeys(newVal, prevVal);
  if (changedQueryParams.length > 0) {
    if (props.entityName === 'settingsActivityLogs' && changedQueryParams.includes('entity')) {
      const prevEntity = prevVal.entity?.[0];
      const newEntity = newVal.entity?.[0];
      emit('modify-entity-param', prevEntity, newEntity);
    }
    tableOptions.value.page = 1;
    fetchActivityLogs();
  }
};

watch(tableOptions, () => {
  fetchActivityLogs();
});

watch(() => requestFilterState.value, async (newVal, prevVal) => {
  await onRequestFilterStateChange(newVal, prevVal);
});
</script>
