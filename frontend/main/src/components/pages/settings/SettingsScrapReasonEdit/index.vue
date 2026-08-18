<template>
  <removed-entity-view v-if="isRemovedScrapReason" />
  <form-page-template
    v-else
    :primary-segment-title="isEdit ? currentScrapReason?.primaryName : `${$t('New')}: ${$t('Scrap reason')}`"
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
              :rules="[(v) => !!v && !!v.trim() || $t('Scrap reason name')]"
              required
              validate-on="blur"
              :counter="200"
              :maxlength="200"
              autofocus
              :hint="$t('Scrap reason name')"
              persistent-hint
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
            cols="12"
            md="6"
            class="px-1"
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
            class="px-1 my-2"
          >
            <multi-line-switch
              v-model="formData.noteRequired"
              :disabled="editForbidden"
              :main-text="$t('Require extra note from operators')"
              :help-text="$t('When enabled operators must enter an extra note when using this reason.') "
            />
          </v-col>
          <v-col
            v-if="increaseQtyWithScrapEnabled"
            cols="12"
            class="px-1 mb-2"
          >
            <multi-line-switch
              v-model="formData.increaseTotalQty"
              :disabled="editForbidden"
              :main-text="$t('Add scrap and increase total quantity')"
              :help-text="$t('When enabled, this reason will add scrap and increase total quantity.') "
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <settings-translations-card
        ref="translations-card"
        language-text-entity="scrap_reason"
        :entity-id="scrapReasonId"
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
        @click="routeToOverview"
      />
      <evocon-v-button
        :text="$t('Save')"
        :loading="isLoading"
        color="primary"
        @click="onSave"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useTagStore } from '@/stores/index';
import useStationStore from '@/stores/station';
import useScrapReasonStore from '@/stores/scrapReason';
import useProfileStore from '@/stores/profile';
import useFeatureStore from '@/stores/feature';
import useConfirmDialogStore from '@/stores/confirmDialog';
import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import SettingsTranslationsCard from '@/components/organisms/settings/SettingsTranslationsCard/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import GenericStationInput from '@/components/organisms/GenericStationInput/index.vue';
import StationDifferenceNotification from '@/components/organisms/settings/StationDifferenceNotification/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

export default {
  name: 'SettingsScrapReasonEdit',
  components: {
    FormPageTemplate,
    SettingsTranslationsCard,
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
        increaseTotalQty: false,
        tagIds: [],
      },
      haveTranslationsChanged: false,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsWithAdminPermissions', 'stationGroupsWithAdminPermissions', 'getStationDifference']),
    ...mapState(useScrapReasonStore, ['isLoading', 'scrapReasonsMap', 'scrapReasonGroupsMap', 'scrapReasonGroupsWithAdminPermissions']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useFeatureStore, ['tagsEnabled', 'increaseQtyWithScrapEnabled']),
    ...mapState(useTagStore, ['tags']),
    stationsToBeRemoved() {
      if (!this.scrapReasonId) return [];
      return this.getStationDifference(this.scrapReasonGroupsMap[this.currentScrapReason.groupId], this.currentScrapReasonGroup, this.currentScrapReason.stationIds);
    },
    currentScrapReasonGroup() {
      return this.scrapReasonGroupsMap[this.formData.groupId] || { local: false };
    },
    filteredStations() {
      if (!this.currentScrapReasonGroup.local) return this.stationsWithAdminPermissions;
      return this.stationsWithAdminPermissions.filter((station) => this.currentScrapReasonGroup.factoryIds.includes(station.factoryId));
    },
    scrapReasonId() {
      return Number(this.$route.params.id);
    },
    currentScrapReason() {
      return this.scrapReasonsMap[this.scrapReasonId];
    },
    filteredGroups() {
      return this.scrapReasonGroupsWithAdminPermissions.filter((g) => g.local || this.canEditGlobalGroup || (this.isEdit && this.currentScrapReason.groupId === g.id));
    },
    isEdit() {
      return !!this.scrapReasonId;
    },
    isGlobalGroupComment() {
      return this.formData.groupId && this.scrapReasonGroupsMap[this.formData.groupId] && !this.scrapReasonGroupsMap[this.formData.groupId].local;
    },
    canEditGlobalGroup() {
      return this.highestRoleAllows('editGlobalGroup');
    },
    editForbidden() {
      return this.isEdit && this.isGlobalGroupComment && !this.canEditGlobalGroup;
    },
    isRemovedScrapReason() {
      const scrapReasonExists = this.currentScrapReason && !this.currentScrapReason.deleted;
      return !this.isLoading && this.isEdit && !scrapReasonExists;
    },
  },
  watch: {
    scrapReasonsMap() {
      this.setFormData();
    },
    scrapReasonId() {
      this.setFormData();
    },
  },
  mounted() {
    if (this.tagsEnabled) this.fetchTags({ entity: [enabledTagEntities.SCRAP_REASON] });
    this.setFormData();
  },
  methods: {
    ...mapActions(useScrapReasonStore, ['saveScrapReason', 'deleteScrapReason']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useTagStore, ['fetchTags']),
    setFormData() {
      if (this.isEdit) {
        this.formData = { ...this.scrapReasonsMap[this.scrapReasonId] };
      } else if (this.$route.query?.groupId) {
        this.formData.groupId = this.$route.query.groupId;
      }
    },
    routeToOverview() {
      this.$router.push({
        name: 'scrapReasonOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    async onSave(navigateToOverview = true) {
      await this.$refs.form.validate();
      if (!this.valid) return;
      const filteredStationIds = this.formData.stationIds.filter((id) => !this.stationsToBeRemoved.includes(id));
      const scrapReason = await this.saveScrapReason({ ...this.formData, stationIds: filteredStationIds });
      if (scrapReason.id) {
        this.$refs['translations-card'].saveTranslations(scrapReason.id);
        if (navigateToOverview) this.routeToOverview();
      }
    },
    onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.currentScrapReason.primaryName }),
        action: () => {
          this.deleteScrapReason(this.currentScrapReason);
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
