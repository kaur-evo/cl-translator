<template>
  <dialog-toolbar
    :color="toolbarColor"
    :title="toolbarTitle"
    :title-icon="toolbarIcon"
    icon-color="white"
  />
  <empty-view
    v-if="originalReasonsCount === 0"
    :header="emptyViewHeader"
    :description="emptyViewDescription"
    :primary-btn="settingsAllowed ? $t('Go to settings') : ''"
    :img-url="emptyViewImg"
    :small="isMobileView"
    class="dialog-content"
    :class="{ 'px-2 pt-0 pb-2 ': isMobileView }"
    @button-clicked="goToSettings"
  />
  <v-progress-linear
    v-else-if="loading"
    indeterminate
    color="primary"
  />
  <v-card-text
    v-else
    class="pb-0 dialog-content"
  >
    <top-reasons-selection
      v-if="showTopReasons"
      ref="topreasons"
      :loading="topReasonsLoading"
      :top-reasons="topReasons"
      :visible-reasons="selectableTopReasons"
      :selected-reason="props.selectedReason.id"
      @reason-selected="selectReason"
    />
    <shiftview-search
      v-if="!isMobileView"
      :items="searchItems"
      :item-subtitle-function="getSubtitle"
      class="mt-3"
      @item-selected="selectFromSearch"
    />
    <v-form ref="form" v-model="valid">
      <div v-if="isMobileView" class="d-flex" :class="showLocationBeforeGroup || showLocationBeforeReason ? 'flex-column-reverse' : 'flex-column'">
        <selection-input
          :model-value="[props.selectedReason.id]"
          :hint="$t('Reason')"
          :items="filteredReasons"
          :groups="groups"
          :placeholder="$t('Reason')"
          :disabled="!isReasonSelectEnabled"
          is-single-select
          is-grouped-select
          required
          dense
          menu-input-class="my-2"
          @update:model-value="selectReason($event[0])"
        >
          <template #item-append="{ item }">
            <slot name="item-append" :item="item" />
          </template>
        </selection-input>
        <selection-input
          :model-value="[props.positionId]"
          :hint="$t('Machine location')"
          :items="filteredPositions"
          :disabled="!isPositionSelectEnabled"
          :error="isRequiredPositionMissing"
          :placeholder="$t('Machine location')"
          is-single-select
          dense
          menu-input-class="mb-2"
          @update:model-value="selectPosition($event[0])"
        />
      </div>
      <v-row
        v-else
        class="my-4 mx-n1 d-flex"
      >
        <v-col
          v-if="groupsVisible"
          :cols="12 / numberOfSelectors"
          class="pl-1 pr-2"
          :class="`order-${showLocationBeforeGroup || showLocationBeforeReason ? 1 : 0}`"
        >
          <shiftview-select
            v-model="groupId"
            :items="filteredGroups"
            :subtitle="$t('Groups')"
            :item-append-icon="mdiChevronRight"
            :height="selectHeight"
            mandatory
            :disabled="!isGroupSelectEnabled"
            @update:model-value="selectGroup"
          />
        </v-col>
        <v-col
          :cols="12 / numberOfSelectors"
          class="px-2"
          :class="`order-${showLocationBeforeGroup || showLocationBeforeReason ? 2 : 1}`"
        >
          <shiftview-select
            :model-value="props.selectedReason.id"
            :items="filteredReasons"
            :title="groupId && groupsMap[groupId] ? groupsMap[groupId].name : ''"
            :subtitle="$t('Reasons')"
            :height="selectHeight"
            :disabled="!isReasonSelectEnabled"
            @update:model-value="selectReason"
          >
            <template #append="{ item }">
              <slot name="item-append" :item="item" />
            </template>
          </shiftview-select>
        </v-col>
        <v-col
          v-if="props.positions.length"
          :cols="12 / numberOfSelectors"
          class="pl-2 pr-1"
          :class="`order-${positionSelectOrder}`"
        >
          <shiftview-select
            :model-value="props.positionId"
            :items="filteredPositions"
            :disabled="!isPositionSelectEnabled"
            :subtitle="$t('Machine locations')"
            :show-error="isRequiredPositionMissing"
            :height="selectHeight"
            :mandatory="showLocationBeforeGroup"
            @update:model-value="selectPosition"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <evocon-v-combobox
            :model-value="props.notes"
            :hint="extraNoteRequired ? $t('Extra note') : (`${$t('Extra note')} (${$t('Optional').toLowerCase()})`)"
            :rules="[extraNoteRule]"
            max-length="500"
            :position-top="true"
            :items="getItemsFromLocalStorageArray(noteStorageKey, notes || '')"
            :density="isMobileView ? 'compact' : 'default'"
            @update:model-value="emit('update:notes', $event?.trim() || '')"
          />
        </v-col>
      </v-row>
    </v-form>
  </v-card-text>
  <v-card-actions>
    <delete-button v-if="props.isEdit" @click="onDelete" />
    <v-spacer />
    <evocon-v-button
      :text="$t('Cancel')"
      type="secondary"
      @click="close"
    />
    <evocon-v-button
      color="primary"
      :loading="saveLoading"
      :disabled="saveDisabled"
      :text="$t('Save')"
      @click="onSave"
    />
  </v-card-actions>
</template>

<script setup name="CommentDialog">
import { storeToRefs } from 'pinia';
import {
  computed, ref, watch, useTemplateRef, onMounted, onUnmounted,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { mdiChevronRight } from '@mdi/js';

import {
  useDeviceStore,
  useProfileStore,
  useConfigurationStore,
  usePositionStore,
  useGenericDialogStore,
  useShiftviewSelectionStore,
  useGenericNotificationStore,
  useConfirmDialogStore,
} from '@/stores/index';
import { eventBus } from '@/eventBus';
import addItemToLocalStorageArray from '@/helpers/localStorage/addItem';
import getItemsFromLocalStorageArray from '@/helpers/localStorage/getItemsFromLocalStorageArray';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import TopReasonsSelection from '@/components/organisms/shiftview/TopReasonsSelection/index.vue';
import ShiftviewSearch from '@/components/organisms/shiftview/ShiftviewSearch/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import ShiftviewSelect from '@/components/organisms/shiftview/ShiftviewSelect/index.vue';
import EvoconVCombobox from '@/components/atoms/EvoconVCombobox/index.vue';
import { DIALOG_HEIGHT_PTC } from '@/constants/dialog';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';

const { t } = useI18n();

const emit = defineEmits(['update:reason-id', 'update:position-id', 'update:notes']);

const props = defineProps({
  selectedReason: { type: Object, default: () => ({}) },
  positionId: { type: [Number], default: 0 },
  notes: { type: String, default: '' },
  toolbarColor: { type: String, default: null },
  toolbarTitle: { type: String, default: null },
  toolbarIcon: { type: String, default: null },
  reasons: { type: Array, default: () => [] },
  reasonsMap: { type: Object, default: () => ({}) },
  groups: { type: Array, default: () => [] },
  groupsMap: { type: Object, default: () => ({}) },
  positions: { type: Array, default: () => [] },
  emptyViewHeader: { type: String, default: null },
  emptyViewDescription: { type: String, default: null },
  emptyViewImg: { type: String, default: null },
  settingsModule: { type: String, required: true },
  loading: { type: Boolean, default: false },
  saveDisabled: { type: Boolean, default: false },
  saveCallback: { type: Function, required: true },
  deleteCallback: { type: Function, default: null },
  topReasons: { type: Array, default: () => [] },
  topReasonsLoading: { type: Boolean, default: false },
  extraNoteRequired: { type: Boolean, default: false },
  noteStorageKey: { type: String, required: true },
  originalReasonsCount: { type: Number, default: 0 },
  positionEntityProp: { type: String, required: true },
  isEdit: { type: Boolean, default: false },
});

const deviceStore = useDeviceStore();
const profileStore = useProfileStore();
const configurationStore = useConfigurationStore();
const positionStore = usePositionStore();
const genericDialogStore = useGenericDialogStore();
const selectionStore = useShiftviewSelectionStore();
const notificationStore = useGenericNotificationStore();
const confirmDialogStore = useConfirmDialogStore();

const { isMobileView } = storeToRefs(deviceStore);
const settingsAllowed = computed(() => profileStore.highestRoleAllows('settings'));
const { showLocationBeforeGroup, showLocationBeforeReason } = storeToRefs(configurationStore);
const { positionsMap } = storeToRefs(positionStore);

const groupId = ref(null);
const isRequiredPositionMissing = ref(false);
const valid = ref(true);
const saveLoading = ref(false);
const selectHeight = ref('300px');
const form = useTemplateRef('form');
const topreasons = ref(null);
let selectHeightTimeout = null;

const positionSelectOrder = computed(() => {
  if (showLocationBeforeGroup.value) return 0;
  if (showLocationBeforeReason.value) return 1;
  return 2;
});

const filteredGroups = computed(() => {
  const groupsWithItems = new Set(props.reasons.map((reason) => reason.groupId));
  return props.groups.filter((group) => groupsWithItems.has(group.id));
});

const filteredReasons = computed(() => {
  let reasonsFilteredByPosition = props.reasons;
  if ((showLocationBeforeGroup.value || showLocationBeforeReason.value) && props.positionId) {
    const selectedPosition = positionsMap.value[props.positionId];
    if (selectedPosition && selectedPosition[props.positionEntityProp].length > 0) {
      reasonsFilteredByPosition = props.reasons.filter((comment) => selectedPosition[props.positionEntityProp].includes(comment.id));
    }
  }
  if (groupId.value) {
    return reasonsFilteredByPosition.filter((reason) => reason.groupId === groupId.value);
  }
  return reasonsFilteredByPosition;
});

const selectableTopReasons = computed(() => {
  if (showLocationBeforeGroup.value) return props.positionId ? props.reasons : [];
  if (showLocationBeforeReason.value) return groupId.value ? filteredReasons.value : [];
  return props.reasons;
});

const filteredPositions = computed(() => {
  if (showLocationBeforeGroup.value) return props.positions;
  if (showLocationBeforeReason.value) {
    if (groupId.value) {
      const reasonIdsInGroup = new Set(filteredReasons.value.map((reason) => reason.id));
      return props.positions.filter((pos) => pos[props.positionEntityProp].length === 0 || pos[props.positionEntityProp].some((id) => reasonIdsInGroup.has(id)));
    }
    return props.positions;
  }
  return props.positions.filter((pos) => pos[props.positionEntityProp].length === 0 || pos[props.positionEntityProp].includes(props.selectedReason.id));
});

const searchItems = computed(() => {
  if (showLocationBeforeReason.value) {
    if (groupId.value) return [...filteredReasons.value, ...props.positions];
    return props.positions;
  }
  if (showLocationBeforeGroup.value) {
    if (props.positionId) return [...props.positions, ...props.reasons];
    return props.positions;
  }
  if (props.selectedReason.id) return [...props.reasons, ...props.positions];
  return props.reasons;
});

const isGroupSelectEnabled = computed(() => {
  if (showLocationBeforeGroup.value) return !!props.positionId || props.positions.length === 0;
  return true;
});

const isReasonSelectEnabled = computed(() => {
  if (showLocationBeforeReason.value) return !!props.positionId;
  return !!groupId.value || isMobileView.value;
});

const isPositionSelectEnabled = computed(() => {
  if (showLocationBeforeGroup.value) return true;
  if (showLocationBeforeReason.value) return isMobileView.value || !!groupId.value;
  return !!props.selectedReason.id;
});

const groupsVisible = computed(() => showLocationBeforeGroup.value || showLocationBeforeReason.value || filteredGroups.value.length > 1);

const numberOfSelectors = computed(() => {
  let count = 1;
  if (groupsVisible.value) count += 1;
  if (props.positions.length) count += 1;
  return count;
});

const extraNoteRule = computed(() => !props.extraNoteRequired || !!props.notes || t('Extra note'));

const showTopReasons = computed(() => props.originalReasonsCount >= 10);

watch(() => props.loading, (val) => {
  if (val) return;
  if (props.selectedReason && props.selectedReason.id && !isMobileView.value) {
    groupId.value = props.selectedReason.groupId;
  } else if (!showLocationBeforeGroup.value && !showLocationBeforeReason.value && !isMobileView.value) {
    groupId.value = filteredGroups.value[0]?.id || null;
  }
});

watch(() => [deviceStore.screenHeight, deviceStore.screenWidth, props.topReasons, props.loading], () => {
  if (props.loading) return;
  setSelectHeight();
});

onMounted(() => {
  addEventListener('keydown', keyDownHandler);
});

onUnmounted(() => {
  removeEventListener('keydown', keyDownHandler);
});

const keyDownHandler = (event) => {
  if (event.key === 'Enter' && !saveLoading.value && !props.saveDisabled) {
    onSave();
  }
};

const getSubtitle = (item) => (item.groupId ? props.groupsMap[item.groupId].name : t('Machine location'));

const goToSettings = () => {
  const url = `${globalThis.location.origin}/#/settings/${props.settingsModule}`;
  globalThis.open(url, '_blank');
};

const close = () => {
  const { previousState } = genericDialogStore;
  const { sliceSelection } = selectionStore;
  if (previousState.component && sliceSelection.length) genericDialogStore.openPreviousDialog();
  else genericDialogStore.closeDialog();
  selectionStore.clearSliceSelection();
};

const selectFromSearch = (item) => {
  item.groupId ? selectReason(item.id) : selectPosition(item.id);
};

const selectPosition = (id) => {
  isRequiredPositionMissing.value = false;
  emit('update:position-id', id);
  if (showLocationBeforeGroup.value) {
    selectGroup(filteredGroups.value[0]?.id);
    emit('update:reason-id', null);
  } else if (showLocationBeforeReason.value && !id) {
    emit('update:reason-id', null);
  }
};

const selectReason = (id) => {
  emit('update:reason-id', id);
  if (id) {
    const selected = props.reasonsMap[id] || {};
    if (!isMobileView.value) groupId.value = selected.groupId;
    if (!selected.requirePosition) isRequiredPositionMissing.value = false;
  }
  form?.value?.resetValidation?.();
  if (!showLocationBeforeGroup.value && !showLocationBeforeReason.value) emit('update:position-id', null);
};

const selectGroup = (id) => {
  if (isMobileView.value) return;
  groupId.value = id;
  if (showLocationBeforeReason.value) {
    emit('update:reason-id', null);
  } else {
    const firstReasonInGroup = filteredReasons.value[0];
    if (firstReasonInGroup) emit('update:reason-id', firstReasonInGroup.id);
  }
  if (!showLocationBeforeGroup.value) emit('update:position-id', null);
};

const setIsRequiredPositionMissing = () => {
  isRequiredPositionMissing.value = props.selectedReason.requirePosition && props.positions.length > 0 && !props.positionId;
};

const onSave = async () => {
  setIsRequiredPositionMissing();
  if (!props.selectedReason.id || props.saveLoading || isRequiredPositionMissing.value) return;
  await form?.value?.validate?.();
  if (valid.value) {
    saveLoading.value = true;
    const saveResult = await props.saveCallback();
    if (saveResult?.success) {
      notificationStore.notifySaved(props.selectedReason.name);
      if (props.notes) {
        addItemToLocalStorageArray(props.notes, props.noteStorageKey);
      }
      close();
      eventBus.$emit('stop-reason-saved');
    } else {
      notificationStore.notifyError(saveResult?.message);
    }
    saveLoading.value = false;
  }
};

const onDelete = async () => {
  const confirmDialogConfig = {
    title: t('Confirmation'),
    text: t('Are you sure you want to delete {value}?', { value: props.selectedReason.name }),
    action: deleteReason,
    hasLoading: true,
    confirmText: t('Delete'),
    cancelText: t('Cancel'),
  };
  confirmDialogStore.openConfirmDialog(confirmDialogConfig);
};

const deleteReason = async () => {
  if (props.deleteCallback) {
    saveLoading.value = true;
    const { name } = props.selectedReason;
    const deleteResult = await props.deleteCallback();
    if (deleteResult?.success) {
      notificationStore.notifyDeleted(name);
      close();
    } else {
      notificationStore.notifyError(deleteResult?.message);
    }
    saveLoading.value = false;
  }
};

const setSelectHeight = () => {
  if (isMobileView.value) return;
  selectHeightTimeout = setTimeout(() => {
    const dialogHeightConstant = deviceStore.showFullscreenDialogs ? 1 : DIALOG_HEIGHT_PTC;
    const dialogHeight = globalThis.innerHeight * dialogHeightConstant;
    const toolbarHeight = 64;
    const cardPadding = 16;
    let reasons = 0;
    if (showTopReasons.value) reasons = topreasons.value?.$el?.offsetHeight || 0;
    const search = 68;
    const extraTextHeight = 78;
    const selectMargins = 32;
    const actions = 60;
    const height = Math.max(200, dialogHeight - toolbarHeight - cardPadding - reasons - search - extraTextHeight - selectMargins - actions);
    selectHeight.value = `${height}px`;
  }, 100);
};

onUnmounted(() => {
  clearTimeout(selectHeightTimeout);
});

</script>

<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 1px - 116px);
  overflow-y: auto;
}
</style>
