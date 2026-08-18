<template>
  <div v-if="actions.length">
    <div
      class="pr-1 measures"
      :style="{ 'max-height': overflowHeight }"
    >
      <draggable
        :model-value="modifiedArray"
        handle=".handle"
        draggable=".drag-item"
        @change="orderChanged"
      >
        <template #item="{ element: action, index }">
          <v-row
            class="drag-item flex-nowrap"
            @mouseleave="cardHovered = null"
            @mouseenter="cardHovered = index"
          >
            <v-col class="pa-0 flex-grow-0 flex-shrink-1">
              <div class="fill-height d-flex align-center">
                <v-icon
                  v-if="canEdit && cardHovered === index"
                  class="handle grabbable mx-1"
                  color="grey-darken-1"
                >
                  {{ mdiDrag }}
                </v-icon>
                <div
                  v-else
                  class="not-grabbable"
                />
              </div>
            </v-col>
            <v-col class="my-2">
              <v-card>
                <v-row class="mb-1">
                  <v-col class="flex-grow-0 flex-shrink-1 py-2 pl-2">
                    <improvement-step-number
                      :step="action"
                      :step-number="index"
                      :additional-class="{
                        complete: isIncompletedHovered(action) || action.completed,
                        incomplete: isCompletedHovered(action),
                      }"
                      :size="32"
                    />
                  </v-col>
                  <v-col>
                    <v-row class="fill-height">
                      <v-col
                        class="pl-4 pr-2 pt-2"
                        cols="12"
                      >
                        <v-row class="mt-2 align-baseline">
                          <div class="dont-break-out">
                            <span
                              class="text-headline-small mt-2 mr-2 mb-2 text-black"
                            >
                              {{ action.description }}
                            </span>
                          </div>
                        </v-row>
                      </v-col>
                      <v-col
                        v-if="action.completionDate"
                        class="px-2 py-0 text-truncate"
                        cols="12"
                      >
                        <span class="ml-2 mr-1 text-disabled text-label-small">
                          {{ $t('Done') }}
                        </span>
                        <span class="text-body-small font-weight-medium text-high-emphasis">
                          {{ formatDate(action.completionDate, 'long') }}
                        </span>
                      </v-col>
                      <v-col
                        v-if="action.deadline"
                        class="px-2 py-0 text-truncate"
                        cols="12"
                      >
                        <span class="ml-2 mr-1 text-disabled text-label-small">
                          {{ $t('Deadline') }}
                        </span>
                        <v-tooltip
                          v-if="actionsWithWarning.includes(action)"
                          location="right"
                          :text="$t('Please review deadlines of actions or rearrange your actions.')"
                        >
                          <template #activator="{ props }">
                            <span
                              class="value deadline-error"
                              v-bind="props"
                            >
                              <span class="text-body-small font-weight-medium text-high-emphasis">{{ formatDate(action.deadline, 'long') }}</span>
                              <v-icon
                                class="ml-1"
                                color="warning"
                                size="small"
                              >
                                {{ mdiAlertOutline }}
                              </v-icon>
                            </span>
                          </template>
                        </v-tooltip>
                        <span
                          v-else
                          class="text-body-small font-weight-medium text-high-emphasis"
                        >
                          {{ formatDate(action.deadline, 'long') }}
                        </span>
                      </v-col>
                      <v-col
                        v-if="action.responsibleUsers && action.responsibleUsers.length > 0"
                        class="px-2 py-0 text-truncate"
                        cols="12"
                      >
                        <span class="ml-2 mr-1 text-disabled text-label-small">
                          {{ $t('Person responsible') }}
                        </span>
                        <span class="text-body-small font-weight-medium text-high-emphasis">
                          {{ getResponsibleUsers(action.responsibleUsers) }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-card-actions class="action-btns">
                  <evocon-v-button
                    v-if="canEdit && cardHovered === index"
                    :disabled="!temporaryLinksIconVisibilityMap[action.id]"
                    :icon="mdiLink"
                    @click="onOpenRelatedItemsClick(action.id)"
                  />
                  <evocon-v-button
                    v-if="canEdit && cardHovered === index"
                    :icon="mdiDelete"
                    @click="removeAction(index, action)"
                  />
                  <evocon-v-button
                    v-if="canEdit && cardHovered === index"
                    :icon="mdiPencil"
                    @click="openEdit(true, action, index)"
                  />
                  <evocon-v-button
                    v-if="cardHovered === index && canEdit"
                    :class="{
                      'text-primary': isIncompletedHovered(action),
                      'text-secondary': isCompletedHovered(action),
                    }"
                    variant="text"
                    :text="action.completed ? $t('Undo') : $t('Done')"
                    :icon="action.completed ? mdiCheckCircleOutline : mdiCheckCircle"
                    @mouseenter="currentHoveredAction = action"
                    @mouseleave="currentHoveredAction = {}"
                    @click="action.completed ? markAsUndone(action) : markAsDone(action)"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </draggable>
    </div>
    <v-row class="ml-5 mt-4">
      <v-col class="pa-1">
        <template v-if="canEdit">
          <evocon-v-button
            block
            color="quaternary-dark"
            :text="$t('Save as template')"
            :icon="mdiContentSave"
            @click="onSaveTemplateClick"
          />
        </template>
      </v-col>
      <v-col class="pa-1">
        <template v-if="availableTemplates.length">
          <evocon-v-button
            block
            color="quaternary-dark"
            :text="$t('Load template')"
            @click="onLoadTemplateClick"
          />
        </template>
      </v-col>
      <v-col class="pa-1">
        <template v-if="canEdit">
          <evocon-v-button
            block
            type="primary-light"
            :text="$t('Action')"
            :icon="mdiPlus"
            @click="openEdit(false)"
          />
        </template>
      </v-col>
    </v-row>
  </div>
  <empty-view
    v-else
    id="improvement-actions-empty-view"
    :header="$t('Create an action plan')"
    :description="canEdit ? $t('A goal without a plan is just a wish.') : ''"
    :img-url="'steps345'"
    :primary-btn="canEdit ? $t('Action') : ''"
    :secondary-btn="canEdit && availableTemplates.length ? $t('Load template') : ''"
    :tertiary-btn="$t('Learn more')"
    :primary-btn-icon="mdiPlus"
    @button-clicked="openEdit"
    @secondary-btn-clicked="onLoadTemplateClick"
    @tertiary-btn-clicked="navigateToLearnMore"
  />
</template>
<script>
import draggable from 'vuedraggable';
import { mapState, mapActions } from 'pinia';
import {
  mdiDrag,
  mdiLink,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiAlertOutline,
  mdiCheckCircle,
  mdiContentSave,
  mdiCheckCircleOutline,
} from '@mdi/js';
import { defineAsyncComponent } from 'vue';

import { useImprovementsNoteStore, useImprovementsFileStore, useImprovementsActionsStore, useGenericDialogStore, useConfirmDialogStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import improvementsActionsTemplateApi from '@/api/improvementsActionsTemplateApi';
import ImprovementStepNumber from '@/components/organisms/improvements/ImprovementStepNumber/index.vue';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = {
  mdiDrag,
  mdiLink,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiAlertOutline,
  mdiCheckCircle,
  mdiContentSave,
  mdiCheckCircleOutline,
};

export default {
  name: 'ImprovementActions',
  components: {
    draggable,
    ImprovementStepNumber,
    EmptyView,
    EvoconVButton,
  },
  props: {
    canEdit: {
      type: Boolean,
    },
    project: {
      type: Object,
      default: () => {},
    },
    overflowHeight: {
      type: String,
      default: 'auto',
    },
  },
  emits: ['remove-action', 'reorder', 'replace-actions'],
  data() {
    return {
      ...vectorIcons,
      cardHovered: null,
      actionsWithWarning: [],
      availableTemplates: [],
      currentHoveredAction: {},
    };
  },
  computed: {
    ...mapState(useImprovementsNoteStore, ['notes']),
    ...mapState(useImprovementsFileStore, ['files']),
    ...mapState(useImprovementsActionsStore, ['actions']),
    temporaryLinksIconVisibilityMap() {
      const merged = [...this.notes, ...this.files];
      return merged.reduce((map, item) => {
        const mapClone = { ...map };
        if (!(item.stepId in map)) mapClone[item.stepId] = [];
        mapClone[item.stepId].push(item);
        return mapClone;
      }, {});
    },
    modifiedArray() {
      return this.checkActionsDeadline(this.actions);
    },
  },
  async mounted() {
    await this.setAvailableTemplates();
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useImprovementsActionsStore, ['saveAction', 'saveActionById']),
    formatDate,
    async setAvailableTemplates() {
      this.availableTemplates = await improvementsActionsTemplateApi.listActionTemplates();
    },
    orderChanged(action) {
      this.$emit('reorder', action, 'Action');
    },
    checkActionsDeadline(actions) {
      this.actionsWithWarning = [];
      let maxDeadlineVal = null;
      actions.forEach((action) => {
        if (maxDeadlineVal === null) {
          maxDeadlineVal = action.deadline;
        } else {
          if (action.deadline && action.deadline < maxDeadlineVal) this.actionsWithWarning.push(action);
          if (action.deadline && action.deadline > maxDeadlineVal) maxDeadlineVal = action.deadline;
        }
        if (this.project && action.deadline < this.project.startDate) {
          this.actionsWithWarning.push(action);
        }
      });
      return actions;
    },
    getResponsibleUsers(users) {
      const fullNamesArray = [];
      if (this.project.users.length) {
        users.forEach((user) => {
          fullNamesArray.push(this.project.users.find((x) => x.userId === user.userId).fullName);
        });
      }
      return fullNamesArray.join('; ');
    },
    onOpenRelatedItemsClick(actionId) {
      this.openDialog({
        title: this.$t('Links'),
        component: defineAsyncComponent(() => import('../ImprovementActionRelatedItems/index.vue')),
        width: 909,
        allowFullscreen: false,
        data: {
          actionId,
          actions: this.actions,
          files: this.files,
          notes: this.notes,
          canEdit: this.canEdit,
          project: this.project,
        },
        onPrimaryAction: () => {
          this.closeDialog();
        },
      });
    },
    openEdit(isEdit, action, index) {
      this.openDialog({
        title: this.$t('Action'),
        component: defineAsyncComponent(() => import('../ImprovementMeasureForm/index.vue')),
        allowFullscreen: false,
        data: {
          measure: action,
          users: this.project.users,
          isEdit,
          measures: this.actions,
          measureType: 'Action',
          saveCB: async ({ currentMeasure }) => {
            if (isEdit) {
              await this.saveActionById({ action: currentMeasure[0], index });
            } else {
              await this.saveAction({ action: currentMeasure });
            }
          },
          removeCB: ({ idx, currentMeasure }) => this.removeAction(idx, currentMeasure),
        },
      });
    },
    removeAction(i, action) {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this?'),
        action: async () => {
          this.$emit('remove-action', i, action);
          this.closeDialog();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      });
    },
    onSaveTemplateClick() {
      this.openDialog({
        title: this.$t('Save as template'),
        component: defineAsyncComponent(() => import('../ImprovementActionsTemplateSaveForm/index.vue')),
        allowFullscreen: false,
        data: { actions: this.actions },
        width: 404,
        onPrimaryAction: (val) => {
          this.availableTemplates = val;
        },
      });
    },
    onLoadTemplateClick() {
      this.openDialog({
        title: this.$t('Load template'),
        component: defineAsyncComponent(() => import('../ImprovementActionsTemplateLoadForm/index.vue')),
        allowFullscreen: false,
        width: 606,
        data: {
          actions: this.actions,
          project: this.project,
        },
        onPrimaryAction: (val) => {
          if (val && val.steps) {
            this.$emit('replace-actions', val.steps);
            this.closeDialog();
          }
        },
      });
    },
    isIncompletedHovered(action) {
      return this.currentHoveredAction === action && !action.completed;
    },
    isCompletedHovered(action) {
      return this.currentHoveredAction === action && action.completed;
    },
    markAsDone(action) {
      this.openDialog({
        title: this.$t('Done'),
        component: defineAsyncComponent(() => import('../ImprovementCompleteActionDialog/index.vue')),
        allowFullscreen: false,
        width: 606,
        data: { action },
        onPrimaryAction: (completedAction, date) => {
          this.saveCurrentAction(completedAction, 'done', date);
          this.closeDialog();
        },
      });
    },
    markAsUndone(action) {
      this.saveCurrentAction(action, 'undone');
    },
    async saveCurrentAction(action, status, date) {
      const savedAction = this.actions.find((elem) => elem === action);
      savedAction.completed = !savedAction.completed;
      if (date) {
        savedAction.completionDate = date;
      }
      this.saveActionById({ action: savedAction, index: this.cardHovered });
    },
    navigateToLearnMore() {
      window.open('https://evocon.com/kb/perform-root-cause-analysis/#actions', '_blank');
    },
  },
};
</script>
<style lang="less" scoped>
.measures {
  overflow-y: auto;
  overflow-x: hidden;
  .not-grabbable {
    width: 32px;
  }
  .action-btns {
    height: 52px;
    padding: 8px;
    justify-content: end;
  }
}
.grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}
.dont-break-out {
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;

  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}
</style>
