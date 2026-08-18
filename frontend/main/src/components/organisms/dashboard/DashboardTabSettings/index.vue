<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit="onSaveClick"
  >
    <dialog-toolbar
      :title="$t('Edit tabs')"
      color="lw-gray"
    />
    <v-card-text class="dialog-content">
      <draggable
        v-model="tabs"
        handle=".handle"
        item-key="id"
        draggable=".drag-item"
        @update="onTabOrderChange($event)"
      >
        <template #item="{ element: tab, index }">
          <v-card
            :id="`tab-item-${index}`"
            class="pa-4 my-2 drag-item"
            :disabled="selectedTabIndex > -1 && selectedTabIndex !== index"
          >
            <div v-if="selectedTabIndex === index">
              <evocon-v-input
                v-model.trim="tab.name"
                :placeholder="$t('Name')"
                :rules="[nameRule]"
                class="mb-2"
                required
                validate-on-blur
                :max-length="maxNameLength"
                autofocus
                density="compact"
              />
              <div class="d-flex">
                <v-spacer />
                <evocon-v-button
                  :text="$t('Cancel')"
                  type="secondary"
                  size="small"
                  class="mr-2"
                  @click="onCancelClick"
                />
                <evocon-v-button
                  :text="$t('Save')"
                  color="primary"
                  size="small"
                  @click="onSaveClick(tab)"
                />
              </div>
            </div>
            <div
              v-else
              class="d-flex justify-space-between align-center"
            >
              <div>
                <v-icon class="handle mr-2">
                  {{ mdiDragVertical }}
                </v-icon>
                <span class="text-body-medium">{{ tab.name }}</span>
              </div>
              <menu-with-button-activator
                :items="tabEditMenuItems"
                :button-icon="mdiDotsVertical"
                button-icon-color=""
                button-type="secondary"
                icon-key="icon"
                list-width="auto"
                @item-clicked="$event.action(tab, index)"
              />
            </div>
          </v-card>
        </template>
      </draggable>
    </v-card-text>
    <v-card-actions class="fullscreen-card-actions">
      <evocon-v-button
        :text="$t('Tab')"
        type="primary-light"
        :icon="mdiPlus"
        :disabled="selectedTabIndex > -1"
        size="small"
        @click="() => onAddTab()"
      />
      <v-spacer />
      <evocon-v-button
        :text="$t('Close')"
        type="secondary"
        size="small"
        @click="closeDialog"
      />
    </v-card-actions>
  </v-form>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiDragVertical, mdiPencil, mdiPlus, mdiContentDuplicate, mdiDelete, mdiDotsVertical } from '@mdi/js';
import draggable from 'vuedraggable';
import { nextTick } from 'vue';

import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import MenuWithButtonActivator from '@/components/molecules/MenuWithButtonActivator/index.vue';
import { useGenericDialogStore, useDashboardConfigStore } from '@/stores/index';

const icons = { mdiDragVertical, mdiPencil, mdiPlus, mdiContentDuplicate, mdiDelete, mdiDotsVertical };

export default {
  name: 'DashboardTabSettings',
  components: {
    draggable,
    DialogToolbar,
    EvoconVButton,
    EvoconVInput,
    MenuWithButtonActivator,
  },
  data() {
    return {
      ...icons,
      valid: true,
      selectedTabIndex: -1,
      tabs: [],
      isTabDuplication: false,
      maxNameLength: 25,
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction']),
    ...mapState(useDashboardConfigStore, ['pages']),
    nameRule() {
      return (v) => (!!v && v.length <= this.maxNameLength) || this.$t('Name');
    },
    tabEditMenuItems() {
      return [
        {
          icon: mdiPencil,
          name: this.$t('Rename'),
          action: (tab, index) => this.onEditTabSelect(index),
        },
        {
          icon: mdiContentDuplicate,
          name: this.$t('Duplicate'),
          action: (tab) => this.onAddTab(tab),
        },
        {
          icon: mdiDelete,
          name: this.$t('Delete'),
          action: (tab) => this.onDeleteTab(tab),
        },
      ];
    },
  },
  mounted() {
    this.tabs = [...this.pages];
  },
  beforeUnmount() {
    this.setIsPagesEdit(false);
    this.isTabDuplication = false;
  },
  methods: {
    ...mapActions(useDashboardConfigStore, ['setIsPagesEdit', 'initDeletePageFlow', 'startEditPagesFlow', 'cancelEditPagesFlow']),
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    onTabOrderChange(event) {
      this.dialogData.onTabOrderChange(this.tabs, event);
    },
    onEditTabSelect(index) {
      this.selectedTabIndex = index;
      this.startEditPagesFlow();
    },
    onCancelClick() {
      this.selectedTabIndex = -1;
      this.cancelEditPagesFlow();
      this.tabs = [...this.pages];
    },
    async onSaveClick(tab) {
      await this.$refs.form.validate();
      if (this.valid) {
        this.onPrimaryAction(tab, this.isTabDuplication);
      }
    },
    async onAddTab(tab) {
      if (tab) {
        this.isTabDuplication = true;
        this.tabs.push({ ...tab, name: `${this.$t('Copy of')} ${tab.name}` });
      } else {
        this.tabs.push({ name: '' });
      }
      const elementId = `tab-item-${this.tabs.length - 1}`;
      await nextTick();
      const element = document.getElementById(elementId);
      if (element) element.scrollIntoView({ behavior: 'instant', block: 'center' });
      this.selectedTabIndex = this.tabs.length - 1;
    },
    onDeleteTab(tab) {
      this.startEditPagesFlow();
      this.initDeletePageFlow(tab);
    },
  },
};
</script>
<style lang="scss" scoped>
.dialog-content {
  max-height: calc(var(--app-height) * 1px - 116px);
  overflow-y: auto;
  padding-bottom: 0;
  padding-top: 0;
}
</style>
