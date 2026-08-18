<template>
  <removed-entity-view v-if="isRemovedPosition" />
  <form-page-template
    v-else
    :primary-segment-title="isEdit ? currentPosition?.primaryName : `${$t('New')}: ${$t('Machine location')}`"
    :secondary-segment-subtitle="$t('Please add translations')"
    :secondary-segment-title="$t('Translations')"
    :is-loading="isLoading"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit="onSaveClick"
      >
        <v-row>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <evocon-v-input
              v-model.trim="formData.primaryName"
              :rules="[locationRule]"
              required
              validate-on-blur
              max-length="200"
              :placeholder="$t('Machine location')"
              :hint="$t('Machine location - E.g press, cutter, labeler')"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <selection-input
              v-model="formData.stationIds"
              :items="stationsWithAdminPermissions"
              :groups="stationGroups"
              :placeholder="$t('Stations')"
              :hint="$t('Assign stations')"
              is-grouped-select
              required
              :hidden-items-count="hiddenStationsCount"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <selection-input
              v-model="formData.commentIds"
              v-model:some-selected="formData.commentsEnabled"
              :hint="`${$t('Connect to stop reasons')} (${$t('Optional').toLowerCase()})`"
              :items="filteredComments"
              :groups="commentGroups"
              :placeholder="`${$t('Stop reasons')} (${$t('Optional').toLowerCase()})`"
              :disabled="filteredComments.length === 0"
              remove-non-existent-selections
              empty-equals-all-selected
              is-grouped-select
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <selection-input
              v-model="formData.performanceCommentIds"
              v-model:some-selected="formData.performanceCommentsEnabled"
              :hint="`${$t('Connect to speed loss reasons')} (${$t('Optional').toLowerCase()})`"
              :items="filteredPerformanceLossReasons"
              :groups="perfCommentGroups"
              :placeholder="`${$t('Speed loss reasons')} (${$t('Optional').toLowerCase()})`"
              :disabled="filteredPerformanceLossReasons.length === 0"
              remove-non-existent-selections
              empty-equals-all-selected
              is-grouped-select
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #secondary-segment>
      <settings-translations-card
        ref="translations-card"
        :entity-id="positionId"
        language-text-entity="position"
        @update:have-translations-changed="haveTranslationsChanged = $event"
      />
    </template>
    <template #actions>
      <delete-button
        v-if="formData.id"
        @click="onDelete"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onCancelClick()"
      />
      <evocon-v-button
        color="primary"
        :loading="isLoading"
        :text="$t('Save')"
        @click="onSaveClick()"
      />
    </template>
  </form-page-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import usePositionStore from '@/stores/position';
import useStationStore from '@/stores/station';
import useCommentStore from '@/stores/comment';
import usePerfCommentStore from '@/stores/perfComment';
import useConfirmDialogStore from '@/stores/confirmDialog';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import SettingsTranslationsCard from '@/components/organisms/settings/SettingsTranslationsCard/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import listToKeyMap from '@/helpers/list/listToKeyMap';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';

export default {
  name: 'SettingsPositionEdit',
  components: {
    FormPageTemplate, EvoconVButton, EvoconVInput, SettingsTranslationsCard, SelectionInput, DeleteButton, RemovedEntityView,
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
        primaryName: '',
        id: undefined,
        stationIds: [],
        commentIds: [],
        commentsEnabled: false,
        performanceCommentIds: [],
        performanceCommentsEnabled: false,
      },
      haveTranslationsChanged: false,
    };
  },
  computed: {
    ...mapState(usePositionStore, ['positionsMap', 'isLoading']),
    ...mapState(useStationStore, ['stationsWithAdminPermissions', 'stationGroups']),
    ...mapState(useCommentStore, ['comments', 'commentGroups']),
    ...mapState(usePerfCommentStore, ['perfComments', 'perfCommentGroups']),
    positionId() {
      return Number(this.$route.params.id);
    },
    isEdit() {
      return !!this.positionId;
    },
    currentPosition() {
      return this.positionsMap[this.positionId];
    },
    filteredComments() {
      if (!this.formData.stationIds || this.formData.stationIds.length === 0) return this.comments;
      return this.comments.filter((comment) => comment.stationIds.some((id) => this.formData.stationIds.includes(id)));
    },
    filteredPerformanceLossReasons() {
      if (!this.formData.stationIds || this.formData.stationIds.length === 0) return this.perfComments;
      return this.perfComments.filter((comment) => comment.stationIds.some((id) => this.formData.stationIds.includes(id)));
    },
    adminStationsMap() {
      return listToKeyMap(this.stationsWithAdminPermissions, 'id');
    },
    hiddenStationsCount() {
      return this.formData.stationIds?.reduce((acc, id) => (this.adminStationsMap[id] ? acc : acc + 1), 0);
    },
    isRemovedPosition() {
      const positionExists = this.currentPosition && !this.currentPosition.deleted;
      return !this.isLoading && this.isEdit && !positionExists;
    },
  },
  watch: {
    positionsMap() {
      this.setFormData();
    },
  },
  mounted() {
    this.setFormData();
  },
  methods: {
    ...mapActions(usePositionStore, ['savePosition', 'deletePosition']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    locationRule(v) {
      return this.isTruthyOr(this.$t('Machine location'))(v);
    },
    isTruthyOr(label) {
      return (v) => !!v || label;
    },
    setFormData() {
      if (this.isEdit) this.formData = { ...this.currentPosition };
    },
    routeToOverview() {
      this.$router.push({
        name: 'positionOverview',
        query: this.$route.query ? { ...this.$route.query } : {},
      });
    },
    async validate() {
      this.$refs.form.validate();
    },
    async onSaveClick(navigateToOverview = true) {
      await this.validate();
      if (!this.valid) return;
      const position = await this.savePosition(this.formData);
      if (position.id) {
        await this.$refs['translations-card'].saveTranslations(position.id);
      }
      if (navigateToOverview) this.routeToOverview();
    },
    onCancelClick() {
      this.routeToOverview();
    },
    async onDelete() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.formData.primaryName }),
        action: () => {
          this.deletePosition(this.formData);
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
          await this.onSaveClick(false);
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
