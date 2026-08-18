<template>
  <removed-entity-view v-if="isRemovedChecklist" />
  <form-page-template
    v-else-if="!isFakeDuplicating"
    id="checklist-form-page"
    :primary-segment-title="cardTitle"
    :secondary-segment-title="$t('Set frequency')"
    :secondary-segment-icon="mdiInformationOutline"
    :tertiary-segment-title="$t('Add checklist tasks')"
    :tertiary-segment-subtitle="$t('Create a list of tasks that operators should perform')"
    :is-loading="!isMounted"
    @secondary-icon-click="onSecondaryIconClick"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <info-block
          v-if="showResetWarning"
          :body="$t('Making changes to the checklist settings will reset the current counter.')"
          :icon="mdiInformationOutline"
          :color="colorConstants.dark['lw-orange']"
          class="mx-1 mb-3"
        />
        <v-row>
          <v-col
            sm="6"
            cols="12"
            class="px-1"
            :class="{ 'mb-2': $vuetify.display.smAndDown }"
          >
            <evocon-v-input
              id="name-input"
              ref="checklistName"
              v-model.trim="formData.name"
              :rules="[(v) => !!v && !!v.trim() || $t('Checklist name')]"
              required
              validate-on="blur"
              max-length="50"
              autofocus
              :placeholder="$t('Name')"
              :hint="$t('Checklist name')"
            />
          </v-col>
          <v-col
            sm="6"
            cols="12"
            class="px-1"
          >
            <selection-input
              :model-value="[formData.groupId]"
              :hint="$t('Group')"
              :items="checklistGroups"
              :placeholder="$t('Group')"
              is-single-select
              required
              remove-non-existent-selections
              @update:model-value="formData.groupId = $event[0]"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <event-conditions-block
        v-if="isMounted"
        ref="eventConditionsBlock"
        class="mx-1"
        :secondary-title="$t('Frequency')"
        :event-type="'checklist'"
        :filters="['factoryIds', 'stationIds', 'productIds']"
        :requirements="{
          ...formData.frequency,
          factoryIds,
          currentMonthlyTriggerMode,
          stationIds: formData.stationIds,
          manualAllowed: formData.manualAllowed,
        }"
        :saved-requirements="savedRequirements"
        :stations-overwrite="adminChecklistStations"
        @update:requirements="onUpdateFrequency"
        @update:requirements-ready="conditionsReady = $event"
      />
    </template>
    <template #tertiary-segment>
      <draggable-list
        id="checklist-elements"
        :key="`checklist-elements-${formData.elements.length}`"
        class="px-1"
        :items="formData.elements"
        @order-change="onTaskOrderChange"
      >
        <template #item="props">
          <v-hover>
            <template #default="hoverProps">
              <list-card
                class="mb-2"
                v-bind="hoverProps.props"
                :elevation="hoverProps.isHovering ? 3 : 2"
                :title="props.item.name"
                :icon="hoverProps.isHovering ? mdiDragVertical : ''"
                :subtitle-key-value-pairs="[{ key: getSubtitle(props.item), value: getSubtitleValue(props.item) }]"
                :number="hoverProps.isHovering ? null : props.index + 1"
                :card-buttons="checklistTaskCardButtons"
                :button-params="props"
                @click="onItemEdit(props)"
              />
            </template>
          </v-hover>
        </template>
      </draggable-list>
      <div class="d-flex align-start py-2">
        <evocon-v-button
          id="add-item-btn"
          type="primary-light"
          :text="$t('Task')"
          :icon="mdiPlus"
          @click="onAddItem"
        />
        <new-indicator shown-until="2026-04-26T00:00:00" small class="ml-2" />
      </div>
      <p
        v-if="noItemsError"
        class="text-error text-body-small my-3"
      >
        {{ $t('Please add at least one task') }}
      </p>
      <v-textarea
        id="checklist-description"
        v-model.trim="formData.description"
        class="my-2"
        maxlength="500"
        counter="500"
        :placeholder="$t('Description')"
        :hint="$t('Describe the standard operating procedure')"
        persistent-hint
        persistent-counter
        auto-grow
      />
      <multi-line-switch
        v-model="formData.authenticationRequired"
        :main-text="$t('Require authentication')"
        class="my-2"
      >
        <template #label-additions>
          <icon-with-tooltip
            :icon="mdiInformationOutline"
            :tooltip-text="$t('Learn more')"
            additional-classes="ml-2"
            :icon-clicked-fn="openChecklistAuthHelp"
          />
        </template>
        <template #enabled-input>
          <info-block
            :body="$t('Please make sure you have assigned passcodes to the operators.')"
            :icon="mdiAlertCircleOutline"
          />
        </template>
      </multi-line-switch>
      <multi-line-switch
        v-model="formData.active"
        :main-text="$t('Checklist status')"
      />
      <div
        v-if="intervalStartTimeVisible"
        class="d-flex text-body-medium align-center mt-4"
      >
        {{ $t('Set interval start time') }}
        <evocon-time-input
          v-model="startClock"
          :prepend-inner-icon="mdiClockOutline"
          use-chip
          class="ml-2"
        />
      </div>
    </template>
    <template #actions>
      <delete-button
        v-if="checklistId"
        @click="onDelete()"
      />
      <v-tooltip
        v-if="checklistId"
        location="top"
      >
        <template #activator="{ props }">
          <evocon-v-button
            id="copy-btn"
            :icon="mdiContentDuplicate"
            v-bind="props"
            @click="onCopyClick()"
          />
        </template>
        <span>{{ $t('Duplicate') }}</span>
      </v-tooltip>
      <v-spacer />
      <evocon-v-button
        id="cancel-btn"
        type="secondary"
        :text="$t('Cancel')"
        @click="goBackToOverview()"
      />
      <evocon-v-button
        id="save-btn"
        type="primary"
        color="primary"
        :loading="isLoading"
        :text="$t('Save')"
        @click="onSave()"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapActions, mapState } from 'pinia';
import {
  mdiPlus, mdiCheck, mdiContentDuplicate, mdiDragVertical, mdiDelete, mdiInformationOutline, mdiAlertCircleOutline, mdiPencil, mdiClockOutline,
} from '@mdi/js';
import cloneDeep from 'lodash/cloneDeep';
import { defineAsyncComponent } from 'vue';
import { isEqual } from 'lodash';
import { DateTime } from 'luxon';

import { checkTypes, allowedPropertiesByType, checklistTypes, periodicSubTypes, monthlyTriggerModes } from '@/constants/checklistsConstants';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import DraggableList from '@/components/molecules/DraggableList/index.vue';
import ListCard from '@/components/molecules/ListCard/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import EventConditionsBlock from '@/components/organisms/settings/EventConditionsBlock/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { getDaysList } from '@/helpers/days/getDays';
import { buildIntervalStartTimeISO } from '@/helpers/time/buildIntervalStartTimeISO';
import InfoBlock from '@/components/atoms/InfoBlock/index.vue';
import colorConstants from '@/constants/colorConstants';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';
import {
  useChecklistTemplateStore,
  useFactoryStore,
  useStationStore,
  useConfigurationStore,
  useConfirmDialogStore,
  useGenericDialogStore,
} from '@/stores/index';

const vectorIcons = {
  mdiPlus, mdiCheck, mdiContentDuplicate, mdiDragVertical, mdiInformationOutline, mdiAlertCircleOutline, mdiClockOutline,
};

export default {
  name: 'SettingsChecklistEdit',
  components: {
    FormPageTemplate,
    DraggableList,
    MultiLineSwitch,
    EvoconVButton,
    ListCard,
    EventConditionsBlock,
    SelectionInput,
    EvoconVInput,
    InfoBlock,
    IconWithTooltip,
    DeleteButton,
    RemovedEntityView,
    EvoconTimeInput,
    NewIndicator,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { itemGroupId } = to.query;
      if (Number(itemGroupId) && !to.params.id) {
        // default to group we entered from
        // eslint-disable-next-line no-param-reassign
        vm.formData.groupId = Number(itemGroupId);
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.haveChecklistElementsChanged) {
      this.promptSavingChanges(to.fullPath);
    } else next();
  },
  data() {
    return {
      ...vectorIcons,
      colorConstants,
      valid: true,
      noItemsError: false,
      conditionsReady: false,
      formData: {
        name: '',
        groupId: null,
        stationIds: [],
        id: undefined,
        frequency: {
          type: '',
          intervalTime: null,
          delayTime: 0,
          leadTime: 0,
          pauseDuringDowntime: false,
          productIds: [],
          resetOnShiftStart: false,
          resetOnChangeover: false,
          daysOfWeek: [],
          times: [''],
          targetQty: null,
          commentIds: [],
          positionIds: [],
          setpoint: null,
          offsetFromStartSeconds: null,
          offsetFromEndSeconds: null,
        },
        description: '',
        elements: [],
        active: false,
        manualAllowed: false,
        authenticationRequired: false,
        startTime: null,
      },
      startClock: null,
      haveChecklistElementsChanged: false,
      currentMonthlyTriggerMode: monthlyTriggerModes.ON_WEEKDAY,
      factoryIds: [],
      isDuplicate: false,
      isFakeDuplicating: false,
      isMounted: false,
    };
  },
  computed: {
    ...mapState(useChecklistTemplateStore, [
      'isLoading',
      'checklistsTemplatesMap',
      'checklistGroups',
    ]),
    ...mapState(useFactoryStore, ['getFactoryIdsByStationIds']),
    ...mapState(useStationStore, ['adminStationsMap']),
    ...mapState(useConfigurationStore, ['adminChecklistStations']),
    checklistId() {
      return this.$route.params.id ? this.$route.params.id : '';
    },
    savedChecklist() {
      return this.checklistsTemplatesMap[this.checklistId];
    },
    cardTitle() {
      if (this.checklistId) {
        return this.savedChecklist?.name;
      }
      if (this.isDuplicate) {
        return this.formData.name;
      }
      return `${this.$t('New')}: ${this.$t('Checklist')}`;
    },
    savedRequirements() {
      const checklist = this.savedChecklist;
      if (!checklist) {
        return {
          type: '',
          intervalTime: null,
          delayTime: 0,
          leadTime: 0,
          pauseDuringDowntime: false,
          productIds: [],
          resetOnShiftStart: false,
          resetOnChangeover: false,
          stationIds: [],
          factoryIds: [],
          manualAllowed: false,
          daysOfWeek: [],
          times: [''],
          targetQty: null,
          commentIds: [],
          positionIds: [],
          setpoint: null,
          offsetFromStartSeconds: null,
          offsetFromEndSeconds: null,
        };
      }
      return {
        ...checklist.frequency,
        stationIds: checklist.stationIds,
        factoryIds: this.getFactoryIdsByStationIds(checklist.stationIds),
        manualAllowed: checklist.manualAllowed,
      };
    },
    showResetWarning() {
      if (!(this.savedChecklist?.active && this.formData.active)) return false; // must be and stay active
      if (checklistTypes.CHANGEOVER === this.savedRequirements.type) return !!this.savedRequirements.intervalTime;
      if (checklistTypes.PERIODIC === this.savedRequirements.type) return [periodicSubTypes.WEEKLY, periodicSubTypes.MONTHLY].includes(this.savedRequirements.subType);
      return [checklistTypes.INTERVAL, checklistTypes.QUANTITY, checklistTypes.CHANGEOVER].includes(this.savedRequirements.type);
    },
    hasChecklistChanged() {
      if (!this.isMounted) return false;
      const formDataItems = ['name', 'groupId', 'description', 'active', 'manualAllowed', 'stationIds', 'authenticationRequired', 'startTime'];
      const hasFormDataChanged = formDataItems.some((key) => !isEqual(this.savedChecklist?.[key], this.formData?.[key]));
      const haveConditionsChaned = Object.keys(this.formData.frequency).some((key) => !isEqual(this.savedRequirements?.[key], this.formData.frequency?.[key]));
      return haveConditionsChaned || this.haveChecklistElementsChanged || hasFormDataChanged;
    },
    checklistTaskCardButtons() {
      return [
        {
          icon: mdiPencil,
          text: this.$t('Edit'),
          tooltip: this.$t('Edit'),
          action: (props) => this.onItemEdit(props),
        },
        {
          icon: mdiContentDuplicate,
          text: this.$t('Duplicate'),
          tooltip: this.$t('Duplicate'),
          action: (props) => this.onItemCopy(props),
        },
        {
          icon: mdiDelete,
          text: this.$t('Delete'),
          tooltip: this.$t('Delete'),
          action: (props) => this.onItemDelete(props),
        },
      ];
    },
    isRemovedChecklist() {
      const checklistExists = this.savedChecklist && !this.savedChecklist.deleted;
      return this.isMounted && this.checklistId.length > 0 && !checklistExists;
    },
    intervalStartTimeVisible() {
      return this.formData.frequency.type === checklistTypes.INTERVAL && this.formData.active;
    },
    isWeeklyChecklist() {
      return this.formData.frequency.type === checklistTypes.PERIODIC && this.formData.frequency.subType === periodicSubTypes.WEEKLY;
    },
    isMonthlyChecklist() {
      return this.formData.frequency.type === checklistTypes.PERIODIC && this.formData.frequency.subType === periodicSubTypes.MONTHLY;
    },
  },
  watch: {
    checklistId(newVal, oldVal) {
      if (newVal !== oldVal) this.setFormData();
    },
    startClock(newVal) {
      this.formData.startTime = buildIntervalStartTimeISO(newVal);
    },
  },
  async mounted() {
    this.isMounted = false;
    await this.fetchChecklists();
    this.setFormData();
    this.isMounted = true;
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    ...mapActions(useChecklistTemplateStore, ['saveChecklist', 'fetchChecklists', 'deleteChecklistTemplate']),
    setFormData() {
      if (this.savedChecklist) {
        this.formData = cloneDeep(this.savedChecklist);
        if (this.intervalStartTimeVisible && this.formData.startTime && new Date(this.formData.startTime) > new Date()) {
          const dateTime = DateTime.fromISO(this.formData.startTime);
          this.startClock = dateTime.toFormat('HH:mm');
        } else {
          this.formData.startTime = null;
        }
        this.factoryIds = this.getFactoryIdsByStationIds(this.formData.stationIds);
        if (this.isMonthlyChecklist && this.formData.frequency.dayOfMonth) {
          this.currentMonthlyTriggerMode = monthlyTriggerModes.ON_CALENDAR_DAY;
        }
      }
    },
    openChecklistAuthHelp() {
      window.open('https://support.evocon.com/Checklist-Authentication-e3874ac4def74a2b866d8702fb7c803a', '_blank');
    },
    async validate() {
      this.noItemsError = this.formData.elements.length === 0;
      await this.$refs.form.validate();
    },
    async onSave(navigateToOverview = true) {
      await this.validate();
      if (!this.conditionsReady) {
        this.$refs.eventConditionsBlock.$refs.checklistTriggerBlock.validate();
      }
      if (!this.valid || this.noItemsError || !this.conditionsReady) {
        return;
      }
      if (this.showResetWarning && this.hasChecklistChanged) {
        this.openConfirmDialog(
          {
            title: this.$t('Confirmation'),
            text: `${this.$t('Making changes to the checklist settings will reset the current counter.')} ${this.$t('Do you want to save changes?')}`,
            action: () => {
              this.closeDialog();
              this.cleanAndSaveChecklist();
            },
            confirmText: this.$t('Save'),
            cancelText: this.$t('Don\'t save'),
            color: 'primary',
          },
        );
      } else {
        this.cleanAndSaveChecklist(navigateToOverview);
      }
    },
    async cleanAndSaveChecklist(navigateToOverview = true) {
      this.removeRedundantFrequencyProperties();
      if (this.isWeeklyChecklist && this.formData.frequency.daysOfWeek.length === 0) {
        this.formData.frequency.daysOfWeek = getDaysList().map((day) => day.id);
      }
      if (this.hasChecklistChanged) {
        await this.saveChecklist({
          ...this.formData,
          stationIds: this.getStationIds(),
        });
        this.haveChecklistElementsChanged = false;
      }
      if (navigateToOverview) this.goBackToOverview();
    },
    getStationIds() {
      if (this.formData.stationIds.length > 0) return this.formData.stationIds;
      if (this.factoryIds.length === 0) return this.adminChecklistStations;
      return this.adminChecklistStations.reduce((stationIds, stationId) => {
        if (this.factoryIds.includes(this.adminStationsMap[stationId].factoryId)) {
          stationIds.push(stationId);
        }
        return stationIds;
      }, []);
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.formData.name }),
        action: () => {
          this.deleteChecklistTemplate(this.formData);
          this.goBackToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    goBackToOverview() {
      this.$router.push({ name: 'checklistTemplateOverview', params: { ...this.$route.params }, query: this.$route.query ? { ...this.$route.query } : {} });
    },
    onCopyClick() {
      this.$router.push({ name: 'checklistTemplateEdit', params: { ...this.$route.params, id: null }, query: { ...this.$route.query } });
      this.isDuplicate = true;
      this.isFakeDuplicating = true;

      this.formData.id = undefined;
      // eslint-disable-next-line no-magic-numbers
      this.formData.name = `${this.$t('Copy of')} ${this.formData.name}`.substring(0, 50);
      this.formData.active = false;
      this.formData.authenticationRequired = false;

      setTimeout(() => {
        this.isFakeDuplicating = false;
      }, 200);
    },
    onAddItem() {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsAddChecklistItemDialog/index.vue')),
        data: {
          action: (item) => {
            this.formData.elements.push(item);
            this.noItemsError = false;
            this.haveChecklistElementsChanged = true;
          },
        },
        width: 732,
      };
      this.openDialog(dialogConfig);
    },
    onItemEdit({ item, index }) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsAddChecklistItemDialog/index.vue')),
        data: {
          itemData: item,
          action: (editedItem) => {
            this.formData.elements[index] = editedItem;
            this.haveChecklistElementsChanged = true;
          },
          duplicate: this.onItemCopy,
          delete: () => this.onItemDelete(index),
        },
        width: 732,
      };
      this.openDialog(dialogConfig);
    },
    onItemCopy({ item }) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsAddChecklistItemDialog/index.vue')),
        data: {
          itemData: { ...item, name: `${this.$t('Copy of')} ${item.name}` },
          isDuplicated: true,
          action: (duplicatedItem) => {
            this.formData.elements.push(duplicatedItem);
            this.haveChecklistElementsChanged = true;
          },
        },
        width: 732,
      };
      this.openDialog(dialogConfig);
    },
    onItemDelete({ index }) {
      this.formData.elements.splice(index, 1);
      this.haveChecklistElementsChanged = true;
    },
    getSubtitle(item) {
      if (item.type === checkTypes.YES_NO) {
        return `${this.$t('Yes')}/${this.$t('No')}`;
      }
      if (item.type === checkTypes.MEASUREMENT) {
        return this.$t('Measurement');
      }
      if (item.type === checkTypes.TEXT) {
        return this.$t('Enter text');
      }
      if ([checkTypes.SELECTION].includes(item.type)) {
        return this.$t('Select');
      }
      if (item.type === checkTypes.CHECK) {
        return this.$t('Mark as done');
      }
      return '';
    },
    getSubtitleValue(item) {
      return item.type === checkTypes.MEASUREMENT
        ? `${this.formatNumber(item.minVal, { decimalPlaces: null })} ${item.unit} - ${this.formatNumber(item.maxVal, { decimalPlaces: null })} ${item.unit}`
        : '';
    },
    promptSavingChanges(navigateToPath) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('You are about to exit without saving changes. Do you want to save changes?'),
        action: async () => {
          await this.onSave(false);
          this.$router.push({ path: navigateToPath });
        },
        closeAction: () => {
          this.haveChecklistElementsChanged = false;
          this.$router.push({ path: navigateToPath });
        },
        confirmText: this.$t('Save'),
        cancelText: this.$t('Don\'t save'),
        color: 'primary',
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    onTaskOrderChange(newOrder) {
      this.formData.elements = newOrder;
      this.haveChecklistElementsChanged = true;
    },
    formatNumber,
    onUpdateFrequency(changes) {
      Object.entries(changes).forEach(([key, value]) => {
        if (key === 'factoryIds') {
          this.factoryIds = value;
        } else if (key === 'currentMonthlyTriggerMode') {
          this.currentMonthlyTriggerMode = value;
        } else if (['manualAllowed', 'stationIds'].includes(key)) {
          this.formData[key] = value;
        } else {
          this.formData.frequency[key] = value;
        }
      });
    },
    onSecondaryIconClick() {
      window.open('https://support.evocon.com/Settings-Creating-and-managing-Checklists-9119a05d2dc8475bb905981022d091a1', '_blank');
    },
    getAllowedProperties() {
      if (this.formData.frequency.type === checklistTypes.PERIODIC) {
        if (this.isMonthlyChecklist) {
          return allowedPropertiesByType[checklistTypes.PERIODIC][periodicSubTypes.MONTHLY][this.currentMonthlyTriggerMode];
        }
        return allowedPropertiesByType[checklistTypes.PERIODIC][this.formData.frequency.subType];
      }
      return allowedPropertiesByType[this.formData.frequency.type];
    },
    removeRedundantFrequencyProperties() {
      const allowedProperties = this.getAllowedProperties();
      Object.keys(this.formData.frequency).forEach((key) => {
        if (!allowedProperties.includes(key)) {
          delete this.formData.frequency[key];
        }
      });
      if (this.formData.frequency.type !== checklistTypes.INTERVAL) {
        this.formData.startTime = null;
      }
    },
  },
};
</script>
