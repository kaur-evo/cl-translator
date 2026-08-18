<template>
  <removed-entity-view v-if="isRemovedGroup" />
  <form-page-template
    v-else
    :primary-segment-title="primaryTitle"
    :secondary-segment-title="$t('Translations')"
    :secondary-segment-subtitle="$t('Please add translations')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="onSaveClick"
      >
        <v-row>
          <v-col
            cols="12"
            :md="showField('color') ? 6 : 12"
            class="px-1 mb-2"
          >
            <evocon-v-input
              v-if="showField('name') && groupEntity"
              id="group-name-field"
              v-model.trim="groupEntity[nameField]"
              :hint="$t('Group name')"
              required
              :disabled="commonInputDisabled"
              :rules="[nameRule]"
              :placeholder="$t('Group name')"
              counter="100"
              max-length="100"
              validate-on-blur
              autofocus
            />
          </v-col>
          <v-col
            v-if="showField('color')"
            cols="12"
            md="6"
            class="px-1 mb-2"
          >
            <color-selection-input
              :model-value="groupEntity.color"
              :hint="$t('Group color in reports')"
              :disabled="commonInputDisabled"
              @update:model-value="onColorChange"
            />
          </v-col>
          <v-col
            v-if="showField('tags') && tagsEnabled"
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <selection-input
              v-model="groupEntity.tagIds"
              :hint="`${$t('Tags')} (${$t('Optional')})`"
              :disabled="!tags.length || (!groupEntity.local && !canEditGlobalGroup)"
              :items="tags"
              :placeholder="$t('Tags')"
            />
          </v-col>
          <v-col
            v-if="showField('local')"
            cols="12"
            class="px-1 pt-4"
          >
            <multi-line-switch
              v-if="hasMultipleFactories"
              id="global-group-toggle"
              :model-value="!groupEntity.local"
              :disabled="!canEditGlobalGroup"
              :main-text="$t('Global group')"
              :help-text="canEditGlobalGroup ? $t('Enable if this group should be available in all factories.') : $t('You don’t have permission to manage global groups')"
              @update:model-value="toggleGlobalGroup"
            />
          </v-col>
          <v-col
            v-if="groupEntity.local && hasMultipleFactories"
            cols="12"
            class="px-1 my-2"
          >
            <selection-input
              v-model="groupEntity.factoryIds"
              :items="orderedWriteAccessFactories"
              :items-map="factoriesMap"
              :placeholder="$t('Factories')"
              :hint="$t('Factories')"
              hide-search
              required
            />
          </v-col>
          <v-col
            v-if="showField('singleFactory') && hasMultipleFactories"
            cols="12"
            class="px-1 mb-2"
          >
            <selection-input
              :model-value="[groupEntity.factoryId]"
              :items="orderedWriteAccessFactories"
              :items-map="factoriesMap"
              :placeholder="$t('Factory')"
              :hint="$t('Factory')"
              :disabled="selectedGroupItemsCount > 0"
              is-single-select
              hide-search
              required
              @update:model-value="onSingleSelectFactoryChange"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template v-if="showField('translations')" #secondary-segment>
      <settings-translations-card
        ref="translations-card"
        :language-text-entity="languageTextEntity"
        :entity-id="groupId"
      />
    </template>
    <template #actions>
      <delete-button
        v-if="!isAddNew && (canEditGlobalGroup || selectedGroup.local)"
        :loading="deleteLoading"
        :disabled="saveLoading"
        @click="onDeleteClick"
      />
      <v-spacer />
      <evocon-v-button
        type="secondary"
        :text="$t('Cancel')"
        @click="onGoBack"
      />
      <evocon-v-button
        color="primary"
        :text="$t('Save')"
        :disabled="deleteLoading"
        :loading="saveLoading"
        @click="onSaveClick()"
      />
    </template>
  </form-page-template>
</template>

<script>
import { mapStores, mapState, mapActions } from 'pinia';

import MultiLineSwitch from '@/components/atoms/MultiLineSwitch/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';
import SettingsTranslationsCard from '@/components/organisms/settings/SettingsTranslationsCard/index.vue';
import FormPageTemplate from '@/components/templates/FormPageTemplate/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { enabledTagEntities } from '@/components/organisms/settings/SettingsTagEditForm/enabledTagEntities';
import {
  useTagStore,
  useProfileStore,
  useCommentStore,
  usePerfCommentStore,
  useScrapReasonStore,
  useStationStore,
  useProductStore,
  useChecklistTemplateStore,
  useFactoryStore,
  useFeatureStore,
  useConfirmDialogStore,
} from '@/stores/index';
import RemovedEntityView from '@/components/atoms/RemovedEntityView/index.vue';
import ColorSelectionInput from '@/components/molecules/ColorSelectionInput/index.vue';

const namespaceToStore = {
  comment: useCommentStore,
  perfComment: usePerfCommentStore,
  scrapReason: useScrapReasonStore,
  station: useStationStore,
  product: useProductStore,
  checklistTemplate: useChecklistTemplateStore,
};


export default {
  name: 'SettingsGroupEdit',
  components: {
    SettingsTranslationsCard,
    FormPageTemplate,
    SelectionInput,
    MultiLineSwitch,
    EvoconVInput,
    EvoconVButton,
    DeleteButton,
    RemovedEntityView,
    ColorSelectionInput,
  },
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    namespace: {
      type: String,
      required: true,
    },
    languageTextEntity: {
      type: String,
      required: true,
    },
    saveActionName: {
      type: String,
      required: true,
    },
    nameField: {
      type: String,
      default: 'name',
    },
    deleteLoading: {
      type: Boolean,
    },
    selectedGroupItemsCount: {
      type: Number,
      default: 0,
    },
    groupDeleteFn: {
      type: Function,
      required: true,
    },
  },
  emits: ['group-added'],
  data() {
    return {
      saveLoading: false,
      valid: true,
      groupEntity: {
        [this.nameField]: '',
        color: '',
        local: false,
        factoryIds: [],
        factoryId: null,
      },
      isRemovedGroup: false,
    };
  },
  computed: {
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useCommentStore, ['commentGroupsWithAdminPermissionsMap']),
    ...mapState(usePerfCommentStore, ['perfCommentGroupsWithAdminPermissionsMap']),
    ...mapState(useScrapReasonStore, ['scrapReasonGroupsWithAdminPermissionsMap']),
    ...mapState(useStationStore, ['stationGroupsWithAdminPermissionsMap']),
    ...mapState(useProductStore, ['productGroupsWithAdminPermissionsMap']),
    ...mapState(useChecklistTemplateStore, ['checklistGroupsMap']),
    ...mapState(useFactoryStore, ['orderedWriteAccessFactories', 'hasMultipleFactories', 'factoriesMap']),
    ...mapState(useFeatureStore, ['tagsEnabled']),
    ...mapStores(useTagStore),
    ...mapState(useTagStore, ['tags']),
    primaryTitle() {
      return this.isAddNew ? this.$t('Add new group') : `${this.$t('Edit')}: ${this.selectedGroup.name}`;
    },
    groupId() {
      return this.selectedGroup?.id;
    },
    isAddNew() {
      return !this.groupId;
    },
    canEditGlobalGroup() {
      return this.highestRoleAllows('editGlobalGroup');
    },
    selectedGroup() {
      const currentGroupId = Number(this.$route.query.id);
      if (!currentGroupId) return {};
      if (this.namespace === 'checklistTemplate') return this.checklistGroupsMap[currentGroupId] ?? {};
      return this[`${this.namespace}GroupsWithAdminPermissionsMap`]?.[currentGroupId] ?? {};
    },
    commonInputDisabled() {
      return !this.groupEntity.local && !this.canEditGlobalGroup && !this.isAddNew;
    },
  },
  watch: {
    selectedGroup(newVal) {
      this.setGroupState();
      this.isRemovedGroup = !Number.isNaN(Number(this.$route.query.id)) && Object.keys(newVal).length === 0;
    },
  },
  mounted() {
    this.setTags();
    this.setGroupState();
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useTagStore, ['fetchTags']),
    nameRule() {
      return !!this.groupEntity[this.nameField] || this.$t('Group name');
    },
    async validate() {
      await this.$refs.form.validate();
    },
    async onSaveClick() {
      await this.validate();
      if (!this.valid) return;
      this.saveLoading = true;
      if (this.isAddNew && !this.canEditGlobalGroup) {
        this.groupEntity.local = true;
      }
      let savedEntity;
      if (this.isAddNew || this.groupEntity.local !== false || this.canEditGlobalGroup) {
        const storeFactory = namespaceToStore[this.namespace];
        savedEntity = await storeFactory()[this.saveActionName](this.groupEntity);
      } else {
        savedEntity = this.groupEntity;
      }
      this.saveLoading = false;
      if (!savedEntity || !savedEntity.id) throw new Error('action did not return entity with id');
      if (this.showField('translations')) {
        this.$refs['translations-card'].saveTranslations(savedEntity.id);
      }
      this.$emit('group-added', savedEntity.id);
      this.onGoBack();
    },
    onDeleteClick() {
      const dialogConfig = {
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete {value}?', { value: this.selectedGroup.name }),
        action: async () => {
          await this.groupDeleteFn(this.selectedGroup);
          this.onGoBack();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(dialogConfig);
    },
    onGoBack() {
      const query = this.$route.query ? { ...this.$route.query } : {};
      delete query.isGroupEdit;
      delete query.id;
      this.$router.push({ name: `${this.namespace}Overview`, query });
    },
    showField(name) {
      return this.fields.includes(name);
    },
    setGroupState() {
      if (this.selectedGroup && this.selectedGroup.id && !this.isAddNew) {
        this.groupEntity = {
          ...this.selectedGroup,
          factoryIds: this.selectedGroup.factoryIds?.filter((id) => this.orderedWriteAccessFactories.map((f) => f.id).includes(id)),
        };
      } else {
        this.groupEntity = {};
        if (this.showField('name')) this.groupEntity[this.nameField] = '';
        if (this.showField('color')) this.groupEntity.color = '';
        if (this.showField('singleFactory')) this.groupEntity.factoryId = this.orderedWriteAccessFactories[0].id;
        if (this.showField('local')) {
          this.groupEntity.local = !this.canEditGlobalGroup;
          this.groupEntity.factoryIds = this.canEditGlobalGroup ? [] : [this.orderedWriteAccessFactories[0].id];
        }
      }
    },
    toggleGlobalGroup(value) {
      this.groupEntity = { ...this.groupEntity, local: !value, factoryIds: [] };
    },
    onSingleSelectFactoryChange(val) {
      this.groupEntity = { ...this.groupEntity, factoryId: val[0] };
    },
    onColorChange(val) {
      this.groupEntity = { ...this.groupEntity, color: val };
    },
    setTags() {
      if (!this.tagsEnabled) return;
      if (this.namespace === 'comment') this.fetchTags({ entity: [enabledTagEntities.COMMENT_GROUP] });
      else if (this.namespace === 'perfComment') this.fetchTags({ entity: [enabledTagEntities.PERFORMANCE_COMMENT_GROUP] });
      else if (this.namespace === 'scrapReason') this.fetchTags({ entity: [enabledTagEntities.SCRAP_REASON_GROUP] });
    },
  },
};
</script>
<style lang="scss" scoped>
.marked-circle-icon {
  opacity: 1;
}
</style>
