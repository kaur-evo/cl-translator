<template>
  <removed-entity-view v-if="isRemovedSpeedLossReason" />
  <form-page-template
    v-else
    :primary-segment-title="isEdit && currentSpeedLossReason ? currentSpeedLossReason.primaryName : `${$t('New')}: ${$t('Speed loss')}`"
    :secondary-segment-title="$t('Translations')"
    :secondary-segment-subtitle="$t('Please add translations')"
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
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-model.trim="formData.primaryName"
              :placeholder="$t('Name')"
              variant="filled"
              :rules="[(v) => !!v && !!v.trim() || $t('Speed loss name')]"
              required
              validate-on="blur"
              :counter="200"
              :maxlength="200"
              persistent-hint
              :hint="$t('Speed loss name')"
              :disabled="editForbidden"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="px-1 mb-2"
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
            cols="12"
            class="px-1 my-1"
          >
            <multi-line-switch
              v-if="selectedStationsPositions.length"
              id="require-position-switch"
              v-model="formData.requirePosition"
              :disabled="editForbidden"
              :main-text="$t('Require location from operators')"
              :help-text="$t('When enabled operators must choose location when using this reason.')"
            />
          </v-col>
          <v-col
            cols="12"
            class="px-1 my-1"
          >
            <multi-line-switch
              v-model="formData.noteRequired"
              :disabled="editForbidden"
              :main-text="$t('Require extra note from operators')"
              :help-text="$t('When enabled operators must enter an extra note when using this reason.') "
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <settings-translations-card
        ref="translations-card"
        language-text-entity="performance_comment"
        :entity-id="speedLossReasonId"
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
        :text="$t('Cancel')"
        type="secondary"
        @click="onCancel"
      />
      <evocon-v-button
        :text="$t('Save')"
        color="primary"
        :loading="isLoading"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useTagStore } from '@/stores/index';
import useStationStore from '@/stores/station';
import usePerfCommentStore from '@/stores/perfComment';
import useProfileStore from '@/stores/profile';
import usePositionStore from '@/stores/position';
import useFeatureStore from '@/stores/feature';
import useConfirmDialogStore from '@/stores/confirmDialog';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import SettingsTranslationsCard from '@/components/organisms/settings/SettingsTranslationsCard/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import StationDifferenceNotification from '@/components/organisms/settings/StationDifferenceNotification/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

export default {
  name: 'SettingsSpeedLossEdit',
  components: {
    SettingsTranslationsCard,
    FormPageTemplate,
    MultiLineSwitch,
    SelectionInput,
    GenericStationInput,
    StationDifferenceNotification,
    EvoconVButton,
    DeleteButton,
    EvoconVInput,
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
      valid: true,
      formData: {
        groupId: null,
        primaryName: '',
        stationIds: [],
        noteRequired: false,
        requirePosition: false,
        tagIds: [],
      },
      haveTranslationsChanged: false,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsWithAdminPermissions', 'stationGroupsWithAdminPermissions', 'getStationDifference']),
    ...mapState(usePerfCommentStore, ['isLoading', 'perfCommentsMap', 'perfCommentGroupsMap', 'perfCommentGroupsWithAdminPermissions']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(usePositionStore, ['positions', 'getPositionsByStationIds']),
    ...mapState(useFeatureStore, ['tagsEnabled']),
    ...mapState(useTagStore, ['tags']),
    stationsToBeRemoved() {
      if (!this.currentSpeedLossReason) return [];
      return this.getStationDifference(this.perfCommentGroupsMap[this.currentSpeedLossReason.groupId], this.currentPerfCommentGroup, this.currentSpeedLossReason.stationIds);
    },
    currentPerfCommentGroup() {
      return this.perfCommentGroupsMap[this.formData.groupId] || { local: false };
    },
    filteredStations() {
      if (!this.currentPerfCommentGroup.local) return this.stationsWithAdminPermissions;
      return this.stationsWithAdminPermissions.filter((station) => this.currentPerfCommentGroup.factoryIds.includes(station.factoryId));
    },
    filteredGroups() {
      return this.perfCommentGroupsWithAdminPermissions.filter((g) => g.local || this.canEditGlobalGroup || (this.isEdit && g.id === this.currentSpeedLossReason.groupId));
    },
    speedLossReasonId() {
      return Number(this.$route.params.id);
    },
    currentSpeedLossReason() {
      return this.perfCommentsMap[this.speedLossReasonId];
    },
    isEdit() {
      return !!this.speedLossReasonId;
    },
    isGlobalGroupComment() {
      return this.formData.groupId && this.perfCommentGroupsMap[this.formData.groupId] && !this.perfCommentGroupsMap[this.formData.groupId].local;
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
    isRemovedSpeedLossReason() {
      const speedLossReasonExists = this.currentSpeedLossReason && !this.currentSpeedLossReason.deleted;
      return !this.isLoading && this.isEdit && !speedLossReasonExists;
    },
  },
  watch: {
    perfCommentsMap() {
      this.setFormData();
    },
    speedLossReasonId() {
      this.setFormData();
    },
  },
  mounted() {
    if (this.tagsEnabled) this.fetchTags({ entity: [enabledTagEntities.PERFORMANCE_COMMENT] });
    this.setFormData();
  },
  methods: {
    ...mapActions(usePerfCommentStore, ['savePerfComment', 'deletePerfComment']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useTagStore, ['fetchTags']),
    setFormData() {
      if (this.isEdit) {
        this.formData = { ...this.perfCommentsMap[this.speedLossReasonId] };
      } else if (this.$route.params.groupId) {
        this.formData.groupId = this.$route.params.groupId;
      }
    },
    routeToOverview() {
      this.$router.push({
        name: 'perfCommentOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSave(navigateToOverview = true) {
      await this.validate();
      if (!this.valid) return;
      if (!this.selectedStationsPositions.length) this.formData.requirePosition = false;
      const filteredStationIds = this.formData.stationIds.filter((id) => !this.stationsToBeRemoved.includes(id));
      const speedLossReason = await this.savePerfComment({ ...this.formData, stationIds: filteredStationIds });
      if (speedLossReason.id) {
        this.$refs['translations-card'].saveTranslations(speedLossReason.id);
        if (navigateToOverview) this.routeToOverview();
      }
    },
    onCancel() {
      this.routeToOverview();
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.currentSpeedLossReason.primaryName }),
        action: () => {
          this.deletePerfComment(this.currentSpeedLossReason);
          this.routeToOverview();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
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
  },
};
</script>
