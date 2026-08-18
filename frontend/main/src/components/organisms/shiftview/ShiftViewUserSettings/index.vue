<template>
  <div>
    <dialog-toolbar :title="$t('View settings')" />
    <v-card-text class="pb-0">
      <v-radio-group
        v-model="formData.useStandardEvocon"
        hide-details
        :inline="!isMobileView"
        color="primary"
      >
        <v-row>
          <v-col
            cols="12"
            sm="6"
            class="d-flex flex-column align-center pa-0"
            :class="{ 'mb-2': isMobileView }"
          >
            <img
              class="mx-auto"
              src="@/assets/images/mr-evocon-standard.svg"
              alt="mr-evocon-standard"
              eager
            >
            <v-radio
              :value="true"
              :class="{ 'my-4': !isMobileView }"
              :label="`${$t('Standard')}`"
              :true-icon="mdiCheckCircle"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="d-flex flex-column align-center pa-0"
            :class="{ 'mb-2': isMobileView }"
          >
            <img
              class="mx-auto"
              src="@/assets/images/mr-evocon-standard-and-fun.svg"
              alt="mr-evocon-standard-and-fun"
              eager
            >
            <v-radio
              :value="false"
              :class="{ 'my-4': !isMobileView }"
              :label="`${$t('Standard')} + ${$t('Fun')}`"
              :true-icon="mdiCheckCircle"
            />
          </v-col>
        </v-row>
      </v-radio-group>
      <v-row class="mb-2">
        <v-col class="pa-1" cols="12" sm="6">
          <selection-input
            :model-value="[formData.useShiftGoodQty]"
            :items="quantityOptions"
            :items-map="quantityOptionsMap"
            :hint="`${$t('Shift quantity')} & ${$t('Hour quantity')}`"
            :prepend-inner-icon="mdiCircleMultipleOutline"
            :dark="false"
            is-single-select
            hide-search
            item-value="value"
            required
            @update:model-value="formData.useShiftGoodQty = $event[0]"
          />
        </v-col>
        <v-col class="pa-1" cols="12" sm="6">
          <selection-input
            :model-value="[formData.usePrimaryUnit]"
            :items="unitOptions"
            :items-map="unitOptionsMap"
            :hint="$t('Unit')"
            :prepend-inner-icon="mdiRuler"
            :dark="false"
            is-single-select
            hide-search
            item-value="value"
            required
            @update:model-value="formData.usePrimaryUnit = $event[0]"
          />
        </v-col>
      </v-row>
      <evocon-v-checkbox
        v-model="formData.hideChangeover"
        class="pl-2 my-2"
        :label="$t('Hide changeover button from footer')"
      />
      <div class="d-flex align-center">
        <span>
          <evocon-v-checkbox
            v-model="formData.hideChecklists"
            class="pl-2 my-2"
            :label="$t('Hide checklist pins from timeline')"
            :disabled="!checklistsEnabled"
          />
        </span>
        <icon-with-tooltip
          :icon="mdiInformationOutline"
          :tooltip-text="$t('Learn more')"
          additional-classes="ml-2"
          :icon-clicked-fn="openChecklistsInformation"
        />
      </div>
      <v-row class="mb-2">
        <v-col class="pa-1" cols="12">
          <selection-input
            :model-value="localVisibleChecklistIds"
            :items="stationChecklists"
            :items-map="checklistOptionsMap"
            :groups="relevantChecklistGroups"
            :hint="$t('Select which checklists appear in Shift View')"
            :disabled="formData.hideChecklists || !checklistsEnabled"
            :dark="false"
            show-empty-array-as-all-selected
            item-value="id"
            item-group-id-key="groupId"
            is-grouped-select
            @update:model-value="onChecklistSelectionChange"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions
      class="justify-end"
      :class="{ 'fullscreen-card-actions': showFullscreenDialogs }"
    >
      <evocon-v-button
        type="secondary"
        :text="$t('Close')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        @click="onSave"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import {
  mdiCheckCircle, mdiRuler, mdiCircleMultipleOutline, mdiInformationOutline,
} from '@mdi/js';

import {
  useDeviceStore, useUserPreferencesStore, useFeatureStore,
  useChecklistTemplateStore, useStationStore, useGenericDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

const icons = {
  mdiCheckCircle, mdiRuler, mdiCircleMultipleOutline, mdiInformationOutline,

};

export default {
  name: 'ShiftViewUserSettings',
  components: {
    DialogToolbar,
    EvoconVCheckbox,
    EvoconVButton,
    IconWithTooltip,
    SelectionInput,
  },
  data() {
    return {
      ...icons,
      formData: {
        hideChangeover: false,
        hideChecklists: false,
        usePrimaryUnit: true,
        useShiftGoodQty: true,
        useStandardEvocon: false,
      },
      localVisibleChecklistIds: [],
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    ...mapState(useFeatureStore, ['checklistsEnabled']),
    ...mapState(useChecklistTemplateStore, ['checklistTemplates', 'checklistGroups']),
    ...mapState(useStationStore, ['lineviewStation']),
    stationChecklists() {
      if (!this.lineviewStation?.id) return [];
      return this.checklistTemplates.filter(
        (t) => t.active && t.stationIds.includes(this.lineviewStation.id),
      );
    },
    relevantChecklistGroups() {
      const relevantGroupIds = new Set(this.stationChecklists.map((c) => c.groupId));
      return this.checklistGroups.filter((g) => relevantGroupIds.has(g.id));
    },
    currentStationVisibleIds() {
      const map = this.viewSettings.visibleChecklistIdsByStation || {};
      const stationId = String(this.lineviewStation?.id);
      return map[stationId] || [];
    },
    quantityOptions() {
      return [
        { value: true, name: this.$t('Good quantity') },
        { value: false, name: `${this.$t('Good quantity')} + ${this.$t('Scrap')}` },
      ];
    },
    quantityOptionsMap() {
      return listToKeyMap(this.quantityOptions, 'value');
    },
    unitOptions() {
      return [
        { value: true, name: this.$t('Primary unit') },
        { value: false, name: this.$t('Alternative unit') },
      ];
    },
    unitOptionsMap() {
      return listToKeyMap(this.unitOptions, 'value');
    },
    checklistOptionsMap() {
      return listToKeyMap(this.stationChecklists, 'id');
    },
  },
  watch: {
    'formData.hideChecklists'(newVal) {
      if (newVal) {
        this.localVisibleChecklistIds = [];
      } else {
        this.localVisibleChecklistIds = this.stationChecklists.map((c) => c.id);
      }
    },
  },
  async mounted() {
    this.formData = { ...this.viewSettings };
    if (this.checklistsEnabled) {
      const promises = [];
      if (!this.checklistTemplates.length) promises.push(this.fetchChecklists());
      if (!this.checklistGroups.length) promises.push(this.fetchChecklistGroups());
      if (promises.length) await Promise.all(promises);
    }
    this.localVisibleChecklistIds = this.expandEmptyToAllIds(this.currentStationVisibleIds);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useUserPreferencesStore, ['saveViewSettings']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    ...mapActions(useChecklistTemplateStore, ['fetchChecklists', 'fetchChecklistGroups']),
    async onSave() {
      try {
        const stationId = String(this.lineviewStation?.id || '');
        const existingMap = { ...(this.viewSettings.visibleChecklistIdsByStation || {}) };
        existingMap[stationId] = this.getVisibleIdsForStorage();

        const preferences = {
          ...this.formData,
          visibleChecklistIdsByStation: existingMap,
        };

        await this.saveViewSettings(preferences);
        this.notifySuccess(this.$t('Changes saved'));
        this.closeDialog();
      } catch {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      }
    },
    onChecklistSelectionChange(selectedIds) {
      this.localVisibleChecklistIds = selectedIds;
    },
    getVisibleIdsForStorage() {
      if (this.localVisibleChecklistIds.length === this.stationChecklists.length) {
        return [];
      }
      return this.localVisibleChecklistIds;
    },
    expandEmptyToAllIds(ids) {
      if (!ids.length && this.stationChecklists.length) {
        return this.stationChecklists.map((c) => c.id);
      }
      return ids;
    },
    openChecklistsInformation() {
      window.open('https://support.evocon.com/Checklists-cb34be0256c24f96b81acabfd591e6ad', '_blank');
    },
  },
};
</script>
