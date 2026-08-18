<template>
  <removed-entity-view v-if="isRemovedStopReason" />
  <form-page-template
    v-else
    :primary-segment-title="isEdit ? currentComment.primaryName : `${$t('New')}: ${$t('Stop reason')}`"
    :secondary-segment-subtitle="$t('Please add translations')"
    :secondary-segment-title="$t('Translations')"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <station-difference-notification :stations-to-be-removed="stationsToBeRemoved" />
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSave"
      >
        <v-row>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <evocon-v-input
              v-model.trim="formData.primaryName"
              counter="200"
              :hint="$t('Stop name')"
              maxlength="200"
              :placeholder="$t('Name')"
              required
              :rules="[(v) => !!v && !!v.trim() || $t('Stop name')]"
              validate-on-blur
              :disabled="editForbidden"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <selection-input
              :model-value="[formData.groupId]"
              :hint="$t('Group')"
              :items="filteredGroups"
              :placeholder="$t('Group')"
              :disabled="editForbidden"
              is-single-select
              required
              @update:model-value="formData.groupId = $event[0]"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <selection-input
              :model-value="[formData.negative]"
              :hint="$t('Stop type')"
              :items="commentTypes"
              :placeholder="$t('Type')"
              :disabled="editForbidden"
              is-single-select
              hide-search
              item-text="text"
              item-value="value"
              required
              @update:model-value="onStopTypeInput($event[0])"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <generic-station-input
              v-model="formData.stationIds"
              :groups-override="stationGroupsWithAdminPermissions"
              :items-override="filteredStations"
            />
          </v-col>
          <v-col
            v-if="tagsEnabled"
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <selection-input
              v-model="formData.tagIds"
              :hint="`${$t('Tags')} (${$t('Optional')})`"
              :disabled="!tags.length || editForbidden"
              :items="tags"
              :placeholder="$t('Tags')"
            />
          </v-col>
          <v-col
            class="px-1 mt-4"
            cols="12"
          >
            <evocon-v-button
              color="quaternary-dark"
              :text="$t('Machine locations')"
              :icon="mdiOpenInNew"
              @click="goToMachineLocationsSettings"
            />
            <icon-with-tooltip
              additional-classes="ml-2"
              :icon="mdiInformationOutline"
              :tooltip-text="`${$t('Link reasons to specific machine locations to track exactly where issues occur')}.`"
              :icon-clicked-fn="onOpenLocationsHelp"
            />
          </v-col>
          <v-expansion-panels v-model="openedPanelId" class="px-1 mt-4" static>
            <v-expansion-panel>
              <template #title>
                <div class="text-body-large font-weight-bold full-width d-flex justify-center expansion-panel-title-left-margin">
                  {{ $t('Advanced settings') }}
                </div>
              </template>
              <template #text>
                <div
                  v-for="setting in advancedSettings"
                  :key="`setting-${setting.id}`"
                >
                  <div
                    class="d-flex my-2"
                    :class="{ 'flex-column align-start': isMobilePortrait, 'align-center': !isMobilePortrait }"
                  >
                    <evocon-v-checkbox
                      :model-value="setting.id === 'maxDuration' ? isMaxDurationSelected : formData[setting.id]"
                      :label="setting.label"
                      :disabled="setting.disabled"
                      @update:model-value="onSettingToggled(setting.id, $event)"
                    />
                    <evocon-duration-chip
                      v-if="setting.durationId"
                      :model-value="formData[setting.durationId] ? formData[setting.durationId] : null"
                      :error="setting.numberInputErrorText?.length"
                      :disabled="setting.numberInputDisabled"
                      :class="{ 'my-2 ml-10': isMobilePortrait, 'ml-2': !isMobilePortrait }"
                      hour-input-hidden
                      @update:model-value="formData[setting.durationId] = $event"
                    />
                    <span v-if="setting.numberInputErrorText?.length" class="text-body-small text-error" :class="{ 'ml-10': isMobilePortrait, 'ml-1': !isMobilePortrait }">
                      {{ setting.numberInputErrorText }}
                    </span>
                    <icon-with-tooltip
                      v-if="!isMobileView && setting.tooltipText"
                      :icon="mdiInformationOutline"
                      :tooltip-text="setting.tooltipText"
                      additional-classes="ml-2"
                    />
                    <new-indicator v-if="setting.newIndicatorShownUntil" class="ml-2" :shown-until="setting.newIndicatorShownUntil" />
                  </div>
                  <v-divider v-if="setting.hasDivider" />
                </div>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <settings-translations-card
        ref="translations-card"
        :entity-id="commentId"
        language-text-entity="comment"
        @update:have-translations-changed="haveTranslationsChanged = $event"
      />
    </template>
    <template #actions>
      <delete-button
        v-if="isEdit && !editForbidden"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancel"
      />
      <evocon-v-button
        color="primary"
        :loading="isLoading"
        :text="$t('Save')"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiInformationOutline, mdiClockOutline, mdiAlertCircleOutline, mdiOpenInNew } from '@mdi/js';

import { useTagStore } from '@/stores/index';
import useStationStore from '@/stores/station';
import useCommentStore from '@/stores/comment';
import useFeatureStore from '@/stores/feature';
import usePositionStore from '@/stores/position';
import useProfileStore from '@/stores/profile';
import useDeviceStore from '@/stores/device';
import useConfirmDialogStore from '@/stores/confirmDialog';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import EvoconVCheckbox from '@/components/atoms/EvoconVCheckbox/index.vue';
import EvoconDurationChip from '@/components/atoms/EvoconDurationChip/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import SettingsTranslationsCard from '@/components/organisms/settings/SettingsTranslationsCard/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';
import StationDifferenceNotification from '@/components/organisms/settings/StationDifferenceNotification/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

const icons = { mdiInformationOutline, mdiClockOutline, mdiAlertCircleOutline, mdiOpenInNew };

export default {
  name: 'SettngsStopReasonEdit',
  components: {
    FormPageTemplate,
    SettingsTranslationsCard,
    IconWithTooltip,
    EvoconVCheckbox,
    EvoconDurationChip,
    EvoconVInput,
    SelectionInput,
    GenericStationInput,
    StationDifferenceNotification,
    EvoconVButton,
    DeleteButton,
    NewIndicator,
    RemovedEntityView,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      const { itemGroupId } = to.query;
      if (itemGroupId && !to.params.id) {
        // default to group we entered from
        // eslint-disable-next-line no-param-reassign
        vm.formData.groupId = Number(itemGroupId);
      }
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.haveTranslationsChanged) {
      this.promptSavingTranslationsChanges(to.fullPath);
    } else next();
  },
  data() {
    return {
      ...icons,
      valid: true,
      durationMaxValue: 86400, // 24h
      durationMinValue: 60, // 1m
      formData: {
        groupId: null,
        primaryName: '',
        stationIds: [],
        maxDuration: null, // * 60
        negative: true, // type
        noteRequired: false,
        requirePosition: false,
        technical: false, // technical availability
        tagIds: [],
        noteRequiredDuration: null,
        includeInOee: true,
        joiningAllowed: false,
      },
      isMaxDurationSelected: false,
      haveTranslationsChanged: false,
      openedPanelId: 0,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsWithAdminPermissions', 'stationGroupsWithAdminPermissions', 'getStationDifference']),
    ...mapState(useCommentStore, ['isLoading', 'commentsMap', 'commentGroupsMap', 'commentGroupsWithAdminPermissions']),
    ...mapState(useFeatureStore, ['tagsEnabled']),
    ...mapState(usePositionStore, ['positions', 'getPositionsByStationIds']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useDeviceStore, ['isMobileView', 'isMobilePortrait']),
    ...mapState(useTagStore, ['tags']),
    stationsToBeRemoved() {
      if (!this.commentId) return [];
      return this.getStationDifference(this.commentGroupsMap[this.currentComment.groupId], this.currentCommentGroup, this.currentComment.stationIds);
    },
    currentCommentGroup() {
      return this.commentGroupsMap[this.formData.groupId] || { local: false };
    },
    filteredStations() {
      if (!this.currentCommentGroup.local) return this.stationsWithAdminPermissions;
      return this.stationsWithAdminPermissions.filter((station) => this.currentCommentGroup.factoryIds.includes(station.factoryId));
    },
    commentId() {
      return Number(this.$route.params.id);
    },
    isEdit() {
      return !!this.commentId;
    },
    commentTypes() {
      return [{
        text: this.$t('Unplanned'),
        value: true,
      },
      {
        text: this.$t('Planned'),
        value: false,
      }];
    },
    currentComment() {
      return this.commentsMap[this.commentId] || {};
    },
    filteredGroups() {
      return this.commentGroupsWithAdminPermissions.filter((g) => g.local || this.canEditGlobalGroup || (this.isEdit && g.id === this.currentComment.groupId));
    },
    isGlobalGroupComment() {
      return this.formData.groupId && this.commentGroupsMap[this.formData.groupId] && !this.commentGroupsMap[this.formData.groupId].local;
    },
    canEditGlobalGroup() {
      return this.highestRoleAllows('editGlobalGroup');
    },
    editForbidden() {
      return this.isEdit && this.isGlobalGroupComment && !this.canEditGlobalGroup;
    },
    selectedStationsPositions() {
      if (!this.formData.stationIds?.length) return this.positions;
      return this.getPositionsByStationIds(this.formData.stationIds);
    },
    durationErrorText() {
      return this.$t('Value must be between {min} and {max}', { min: this.durationMinValue / 60, max: this.durationMaxValue / 60 });
    },
    advancedSettings() {
      return [
        {
          id: 'includeInOee',
          label: this.$t('Include in OEE calculation'),
          disabled: this.formData.negative || this.editForbidden,
          tooltipText: this.$t('When enabled, this stop reason will reduce OEE.'),
          hasDivider: true,
        },
        {
          id: 'technical',
          label: this.$t('Include in technical availability'),
          disabled: !this.formData.negative || this.editForbidden,
          tooltipText: this.$t('When enabled this reason will be used to calculate technical availability.'),
          hasDivider: true,
        },
        {
          id: 'noteRequired',
          durationId: 'noteRequiredDuration',
          label: this.$t('Require extra note from operators'),
          disabled: this.editForbidden,
          tooltipText: `${this.$t('Require extra note only if stop exceeds set time')}.`,
          numberInputErrorText: this.isDurationValid(this.formData.noteRequiredDuration) ? '' : this.durationErrorText,
          numberInputDisabled: !this.formData.noteRequired || this.editForbidden,
        },
        {
          id: 'requirePosition',
          label: this.$t('Require location from operators'),
          disabled: !this.selectedStationsPositions.length || this.editForbidden,
          tooltipText: this.$t('When enabled operators must choose location when using this reason.'),
          hasDivider: true,
        },
        {
          id: 'joiningAllowed',
          label: this.$t('Allow joining of multiple stops'),
          disabled: this.editForbidden,
          tooltipText: this.$t('Joined stops count as one in statistics.'),
        },
        {
          id: 'maxDuration',
          durationId: 'maxDuration',
          label: this.$t('Maximum allowed duration'),
          disabled: this.editForbidden,
          numberInputErrorText: this.isDurationValid(this.formData.maxDuration) ? '' : this.durationErrorText,
          numberInputDisabled: !this.isMaxDurationSelected || this.editForbidden,
        },
      ];
    },
    isRemovedStopReason() {
      const commentExists = this.commentsMap[this.commentId] && !this.commentsMap[this.commentId].deleted;
      return !this.isLoading && this.isEdit && !commentExists;
    },
  },
  watch: {
    commentsMap() {
      this.setFormData();
    },
    commentId() {
      this.setFormData();
    },
  },
  mounted() {
    if (this.tagsEnabled) this.fetchTags({ entity: [enabledTagEntities.COMMENT] });
    this.setFormData();
  },
  methods: {
    isDurationValid(value) {
      return !value || (value >= this.durationMinValue && value <= this.durationMaxValue);
    },
    ...mapActions(useCommentStore, ['saveComment', 'deleteComment']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useTagStore, ['fetchTags']),
    setFormData() {
      if (this.isEdit) {
        this.formData = { ...this.commentsMap[this.commentId] };
      } else if (this.$route.params.groupId) {
        this.formData.groupId = this.$route.params.groupId;
      }
      if (this.formData.maxDuration) this.isMaxDurationSelected = true;
    },
    routeToOverview() {
      this.$router.push({ name: 'commentOverview', query: this.$route.query ? { ...this.$route.query } : {} });
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSave(navigateToOverview = true) {
      await this.validate();
      if (!this.valid) return;
      if (!this.selectedStationsPositions.length) this.formData.requirePosition = false;
      const filteredStationIds = this.formData.stationIds.filter((id) => !this.stationsToBeRemoved.includes(id));
      const stopReason = await this.saveComment({ ...this.formData, stationIds: filteredStationIds });
      if (stopReason.id) {
        await this.$refs['translations-card'].saveTranslations(stopReason.id);
        if (navigateToOverview) this.routeToOverview();
      }
    },
    onCancel() {
      this.routeToOverview();
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.currentComment.primaryName }),
        action: () => {
          this.deleteComment(this.currentComment);
          this.routeToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    onSettingToggled(id, value) {
      if (id === 'maxDuration') {
        this.isMaxDurationSelected = value;
        if (!value) this.formData.maxDuration = null;
      } else if (id === 'noteRequired' && !value) {
        this.formData.noteRequired = value;
        this.formData.noteRequiredDuration = null;
      } else {
        this.formData[id] = value;
      }
    },
    promptSavingTranslationsChanges(navigateToPath) {
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('You are about to exit without saving changes. Do you want to save changes?'),
        action: async () => {
          await this.onSave(false);
          this.$router.push({ path: navigateToPath });
        },
        closeAction: () => {
          this.haveTranslationsChanged = false;
          this.$router.push({ path: navigateToPath });
        },
        confirmText: this.$t('Save'),
        cancelText: this.$t('Don\'t save'),
        color: 'primary',
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    onStopTypeInput(ev) {
      this.formData.negative = ev;
      if (ev === true) this.formData.includeInOee = true;
      else this.formData.technical = false;
    },
    goToMachineLocationsSettings() {
      const route = this.$router.resolve({ name: 'positionOverview' });
      window.open(route.href, '_blank');
    },
    onOpenLocationsHelp() {
      window.open('https://support.evocon.com/Using-locations-for-production-stop-reasons-6cce1437ebed42c0b133c45e0a031005', '_blank');
    },
  },
};
</script>
<style lang="scss" scoped>
.expansion-panel-title-left-margin {
  margin-left: 22.5px; // so that title would be centered, because arrow icon width is 22.5px
}
</style>
