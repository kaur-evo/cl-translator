<template>
  <v-col class="pa-4">
    <evocon-v-input
      v-model="search"
      class="mx-2"
      :placeholder="$t('Search')"
      :prepend-inner-icon="mdiMagnify"
      :loading="loading"
    />
    <div class="mx-2 pr-2 vertical-overflow">
      <v-list>
        <v-list-group
          v-for="(item, index) in searchFilteredTemplates"
          :key="item.id"
          class="small-padding"
          :class="item.id === selected ? 'grey-lighten-3' : ''"
          :model-value="item.id === selected"
          :append-icon="mdiMenuDown"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              class="list-item--flex"
              @click.stop="onSelectTemplate(item.id)"
            >
              <v-list-item-action
                class="my-0 mr-2"
                dense
              >
                <evocon-v-button
                  :icon="item.id === selected ? mdiCheckCircle : mdiRadioboxBlank"
                  :color="item.id === selected ? 'primary' : ''"
                />
              </v-list-item-action>
              <v-list-item-title
                class="text-black"
              >
                {{ item.name }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item
            v-for="(step, stepidx) in item.steps"
            :key="`${index}_${stepidx}`"
            class="px-2 list-item--flex"
          >
            <v-list-item-action class="mr-2 my-0">
              <v-avatar
                color="transparent"
                class="avatar-border ma-2"
                size="20"
              >
                <span class="text-body-small font-weight-medium">{{ stepidx + 1 }}</span>
              </v-avatar>
            </v-list-item-action>
            <v-list-item-title
              class="text-high-emphasis"
            >
              {{ step.description }}
            </v-list-item-title>
          </v-list-item>
          <div class="d-flex justify-end">
            <evocon-v-button
              :text="$t('Delete')"
              color="error"
              variant="text"
              @click="onDeleteClick(item.id)"
            />
          </div>
        </v-list-group>
      </v-list>
    </div>
    <v-card-actions class="pt-6 justify-end">
      <evocon-v-button
        color="grey-darken-4"
        variant="text"
        :text="$t('Cancel')"
        @click="closeDialog"
      />
      <evocon-v-button
        color="primary"
        :disabled="!selected"
        :text="$t('Save')"
        @click="onSaveClick"
      />
    </v-card-actions>
  </v-col>
</template>
<script>
import {
  mdiMagnify,
  mdiMenuDown,
  mdiCheckCircle,
  mdiRadioboxBlank,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import { useGenericDialogStore, useConfirmDialogStore } from '@/stores/index';
import improvementsActionsTemplateApi from '@/api/improvementsActionsTemplateApi';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';

const vectorIcons = {
  mdiMagnify,
  mdiMenuDown,
  mdiCheckCircle,
  mdiRadioboxBlank,
};

export default {
  name: 'ImprovementActionsTemplateLoadForm',
  components: { EvoconVButton, EvoconVInput },
  data() {
    return {
      ...vectorIcons,
      loading: false,
      search: '',
      selected: null,
      availableTemplates: [],
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['onPrimaryAction', 'dialogData']),
    searchFilteredTemplates() {
      const matchesSearch = (val) => String(val).toLowerCase().includes(String(this.search).toLowerCase());
      return this.availableTemplates.filter((template) => matchesSearch(template.name));
    },
  },
  async mounted() {
    try {
      this.loading = true;
      this.availableTemplates = await improvementsActionsTemplateApi.listActionTemplates();
    } catch {
      // pass for tests
    } finally {
      this.loading = false;
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    onSelectTemplate(idx) {
      if (this.selected === idx) {
        this.selected = null;
      } else {
        this.selected = idx;
      }
    },
    onSaveClick() {
      if (this.dialogData.actions && this.dialogData.actions.length) {
        this.openConfirmDialog({
          title: this.$t('Confirmation'),
          text: this.$t('Loading template will overwrite existing actions.'),
          color: 'primary',
          action: async () => {
            this.saveSelectedTemplate();
          },
          confirmText: this.$t('Yes'),
          cancelText: this.$t('Cancel'),
        });
      } else {
        this.saveSelectedTemplate();
      }
    },
    onDeleteClick(id) {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this template?'),
        action: async () => {
          await improvementsActionsTemplateApi.deleteActionTemplate(id);
          if (id === this.selected) this.selected = null;
          this.availableTemplates = [...this.availableTemplates.filter((template) => template.id !== id)];
          if (!this.availableTemplates.length) {
            this.onPrimaryAction(this.availableTemplates);
            this.closeDialog();
          }
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      });
    },
    saveSelectedTemplate() {
      const selectedTemplate = this.availableTemplates.find((template) => template.id === this.selected);
      if (selectedTemplate) {
        const modifiedActions = this.setTemplateProjectId(selectedTemplate.steps);
        selectedTemplate.steps = modifiedActions;
        this.onPrimaryAction(selectedTemplate);
      }
    },
    setTemplateProjectId(actions) {
      const currentProjectId = this.dialogData.project.id;
      return actions.map((action) => ({ ...action, projectId: currentProjectId }));
    },
  },
};
</script>
<style lang="scss" scoped>
.vertical-overflow {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 250px;
}
</style>
