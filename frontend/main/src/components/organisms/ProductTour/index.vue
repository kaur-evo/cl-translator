<template>
  <div v-if="showTour && flowStates[moduleName]" class="product-tour-container">
    <v-slide-y-reverse-transition mode="out-in">
      <div v-if="isListOpened">
        <v-slide-x-reverse-transition
          mode="out-in"
          @enter="isCardTransitionFinished = true"
          @leave="isCardTransitionFinished = false"
          @after-leave="isCardTransitionFinished = true"
        >
          <product-tour-flow-card
            v-if="selectedFlowSteps.length > 0"
            :steps="selectedFlowSteps"
            :mark-complete-on-last-step="selectedFlow.markCompleteOnLastStep"
            @mark-flow-as-completed="onFinishFlow"
            @click:tertiary-btn="onCloseFlowCard"
          />
          <v-card
            v-else-if="listItems.length > 1"
            class="pt-2 mb-2"
            theme="light"
            width="350"
          >
            <div class="py-2 px-4 d-flex justify-space-between">
              <div class="flex-column">
                <v-card-title class="pa-0 d-flex align-center">
                  {{ tourTitle }}
                  <v-icon
                    v-if="areAllFlowsCompleted"
                    class="ml-1"
                    color="primary"
                    size="24"
                  >
                    {{ mdiCheckboxMarked }}
                  </v-icon>
                </v-card-title>
                <span>{{ tourDescription }}</span>
              </div>
              <evocon-v-button
                v-if="areAllFlowsCompleted"
                :icon="mdiCloseCircle"
                size="small"
                @click="onCloseProductTour"
              />
              <evocon-v-button
                v-else
                :icon="mdiChevronDown"
                size="small"
                @click="isListOpened = !isListOpened"
              />
            </div>
            <div class="py-2 px-4">
              <v-progress-linear :model-value="progressBarPercentage" height="8" rounded />
            </div>
            <selection-list
              :model-value="[selectedFlowId]"
              :items="listItems"
              :icon="getListItemIcon"
              :icon-color="getListItemIconColor"
              :checkbox="false"
              height="auto"
              item-text="title"
              item-value="id"
              is-single-select
              hide-search
              @update:model-value="(evt) => onFlowSelected(evt[0])"
            />
          </v-card>
        </v-slide-x-reverse-transition>
      </div>
    </v-slide-y-reverse-transition>
    <v-fade-transition mode="out-in">
      <evocon-v-button
        v-if="isProductTourActivatorVisible"
        class="product-tour-activator"
        :icon="mdiCheckCircleOutline"
        :text="tourTitle"
        color="primary"
        @click="onProductTourActivatorClick"
      />
    </v-fade-transition>
  </div>
</template>
<script setup name="ProductTour">
import {
  ref, computed, watch, onMounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  mdiChevronDown, mdiCheckCircleOutline, mdiCheckboxMarkedCircle, mdiCircleOutline, mdiCheckboxMarked, mdiCloseCircle,
} from '@mdi/js';
import { addHours, isAfter } from 'date-fns';

import {
  SHIFT_VIEW, REALTIME, TIMELINE, ALL_FACTORIES, DASHBOARD, REPORTS, SETTINGS,
} from '@/constants/routeNames';
import productTourApi from '@/api/productTourApi';
import { getDashboardProductTourConfig } from '@/constants/productTourConfigs/dashboardProductTourConfig';
import { getFactoryOverviewProductTourConfig } from '@/constants/productTourConfigs/factoryOverviewProductTourConfig';
import { getReportsProductTourConfig } from '@/constants/productTourConfigs/reportsProductTourConfig';
import { getShiftViewProductTourConfig } from '@/constants/productTourConfigs/shiftViewProductTourConfig';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionList from '@/components/molecules/SelectionList/index.vue';
import ProductTourFlowCard from '@/components/organisms/ProductTourFlowCard/index.vue';
import { useFeatureStore, useProfileStore } from '@/stores/index';

const featureStore = useFeatureStore();
const profileStore = useProfileStore();
const route = useRoute();
const router = useRouter();

const flowStates = ref({});
const selectedFlowId = ref('');
const selectedFlowSteps = ref([]);
const isListOpened = ref(false);
const isProductTourVisible = ref(false);
const isCardTransitionFinished = ref(true);

const moduleName = computed(() => {
  const routeName = route?.name || '';
  if ([REALTIME, TIMELINE].includes(routeName)) return ALL_FACTORIES;
  if ([SETTINGS, 'shiftTemplateOverview'].includes(routeName)) return SETTINGS;
  return routeName;
});

const tourTitle = computed(() => {
  switch (moduleName.value) {
    case SHIFT_VIEW:
      return 'Learn Shift View';
    case ALL_FACTORIES:
      return 'Learn Factory Overview';
    case DASHBOARD:
      return 'Learn Dashboard';
    case REPORTS:
      return 'Learn Reports';
    case SETTINGS:
      return selectedFlow.value.title || '';
    default:
      return '';
  }
});

const currentConfig = computed(() => {
  switch (moduleName.value) {
    case SHIFT_VIEW:
      return getShiftViewProductTourConfig(flowStates.value[SHIFT_VIEW]?.flows);
    case ALL_FACTORIES:
      return getFactoryOverviewProductTourConfig(flowStates.value[ALL_FACTORIES]?.flows);
    case DASHBOARD:
      return getDashboardProductTourConfig(flowStates.value[DASHBOARD]?.flows);
    case REPORTS:
      return getReportsProductTourConfig(flowStates.value[REPORTS]?.flows);
    default:
      return {};
  }
});

const showTour = computed(() => {
  if (currentConfig.value.isDemoFlow) return featureStore.productTourEnabled;
  return true;
});

const tourDescription = computed(() => currentConfig.value?.description || '');

const listItems = computed(() => Object.values(currentConfig.value?.flows || []));

const areAllFlowsCompleted = computed(() => listItems.value.every((item) => flowStates.value[moduleName.value]?.flows[item.id]));

const tourHiddenLocalStorage = computed(() => localStorage.getItem(`${moduleName.value}-tourHidingTime`));

const selectedFlow = computed(() => currentConfig.value?.flows[selectedFlowId.value] || {});

const isTourAllowed = computed(() => {
  const role = profileStore.highestUserRole;
  return currentConfig.value?.allowedUserRoles?.includes(role) ?? false;
});

const isTourHiddenByLocalStorage = computed(() => {
  if (tourHiddenLocalStorage.value) {
    const storedDate = new Date(tourHiddenLocalStorage.value);
    const { expiryHours } = selectedFlow.value;
    if (!expiryHours) return true;
    const expiresAt = addHours(storedDate, expiryHours);
    if (isAfter(expiresAt, new Date())) {
      return true;
    }
    localStorage.removeItem(`${moduleName.value}-tourHidingTime`);
  }
  return false;
});

const isProductTourActivatorVisible = computed(() => {
  if (!flowStates.value[moduleName.value]) return false;
  return isProductTourVisible.value && !selectedFlowSteps.value.length && isCardTransitionFinished.value;
});

const progressBarPercentage = computed(() => {
  const completedItems = listItems.value.filter((item) => item.isCompleted);
  return (completedItems.length * 100) / listItems.value.length || 0;
});

const getListItemIcon = (item) => {
  if (item.isCompleted) return mdiCheckboxMarkedCircle;
  return mdiCircleOutline;
};

const getListItemIconColor = (item) => {
  if (item.isCompleted) return 'primary';
  return 'secondary-text';
};

const onFlowSelected = (flow) => {
  const newFlow = currentConfig.value?.flows[flow];
  selectedFlowId.value = flow;
  selectedFlowSteps.value = newFlow.steps || [];
  if (newFlow.urlToNavigate && route.fullPath !== newFlow.urlToNavigate) {
    router.push(newFlow.urlToNavigate);
  }
};

const onCloseFlowCard = () => {
  isCardTransitionFinished.value = false;
  selectedFlowId.value = '';
  selectedFlowSteps.value = [];
};

const onHideProductTour = () => {
  localStorage.setItem(`${moduleName.value}-tourHidingTime`, new Date().toISOString());
  selectedFlowSteps.value = [];
};

const onCloseProductTour = async () => {
  isListOpened.value = false;
  const requestBody = {
    ...flowStates.value,
    [moduleName.value]: {
      ...flowStates.value[moduleName.value],
      closed: true,
    },
  };
  flowStates.value = await productTourApi.updateFlowStates(requestBody);
  isProductTourVisible.value = false;
};

const onFinishFlow = async () => {
  const requestBody = {
    ...flowStates.value,
    [moduleName.value]: {
      ...flowStates.value[moduleName.value],
      flows: {
        ...flowStates.value[moduleName.value]?.flows,
        [selectedFlowId.value]: true,
      },
    },
  };
  flowStates.value = await productTourApi.updateFlowStates(requestBody);
};

const setProductTourVisibility = () => {
  const currentFlowState = flowStates.value[moduleName.value];
  if (!currentFlowState) {
    isListOpened.value = false;
    return;
  }

  isProductTourVisible.value = isTourAllowed.value && !currentFlowState.closed;
  isListOpened.value = isProductTourVisible.value && Object.values(currentFlowState.flows).some((flow) => !flow);
  if (listItems.value.length === 1 && isProductTourVisible.value) {
    selectedFlowId.value = listItems.value[0].id;
    if (!isTourHiddenByLocalStorage.value) onFlowSelected(listItems.value[0].id);
  }
};

const onProductTourActivatorClick = () => {
  if (listItems.value.length === 1) {
    localStorage.removeItem(`${moduleName.value}-tourHidingTime`);
    onFlowSelected(listItems.value[0].id);
    isListOpened.value = true;
  } else {
    isListOpened.value = !isListOpened.value;
  }
};

watch(moduleName, () => {
  selectedFlowId.value = '';
  selectedFlowSteps.value = [];
  setProductTourVisibility();
});

onMounted(async () => {
  if (profileStore.highestRoleAllows('productTour')) {
    flowStates.value = await productTourApi.getFlowStates();
  }
  setProductTourVisibility();
});

</script>
<style lang="scss" scoped>
.product-tour-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 9999;

  .product-tour-activator {
    float: right;
  }
}
</style>
