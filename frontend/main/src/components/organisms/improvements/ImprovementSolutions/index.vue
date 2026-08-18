<template>
  <div v-if="solutions.length">
    <div
      class="pr-1 solutions"
      :style="{ 'max-height': overflowHeight }"
    >
      <draggable
        :model-value="solutions"
        handle=".handle"
        draggable=".drag-item"
        @change="orderChanged"
      >
        <template #item="{ element: solution, index }">
          <v-row
            class="drag-item flex-nowrap"
            @mouseleave="cardHovered = null"
            @mouseenter="cardHovered = index"
          >
            <v-col class="pa-0 flex-grow-0">
              <v-row class="fill-height align-center">
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
              </v-row>
            </v-col>
            <v-col class="my-2">
              <v-card>
                <v-row class="mb-1">
                  <v-col
                    v-if="solution.completed"
                    class="flex-grow-0 py-2 pl-2"
                  >
                    <v-icon
                      class="ma-2"
                      color="primary"
                      size="32"
                    >
                      {{ mdiCheckCircle }}
                    </v-icon>
                  </v-col>
                  <v-col>
                    <v-row class="fill-height">
                      <v-col
                        class="pl-4 pr-2 pt-2"
                        cols="12"
                      >
                        <v-row class="mt-2 align-baseline">
                          <div class="dont-break-out">
                            <span class="text-headline-small mt-2 mr-2 mb-2 text-black">
                              {{ solution.description }}
                            </span>
                          </div>
                        </v-row>
                      </v-col>
                      <v-col
                        v-if="solution.startDate"
                        class="px-2 text-truncate"
                        cols="12"
                      >
                        <span class="ml-2 mr-1 text-disabled text-label-small">
                          {{ $t('Implemented') }}
                        </span>
                        <span class="text-body-small font-weight-medium text-high-emphasis">
                          {{ formatDate(solution.startDate, 'long') }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-card-actions class="solution-btns">
                  <evocon-v-button
                    v-if="canEdit && cardHovered === index"
                    :icon="mdiDelete"
                    @click="removeSolution(index, solution)"
                  />
                  <evocon-v-button
                    v-if="canEdit && cardHovered === index"
                    :icon="mdiPencil"
                    @click="openEdit(true, solution, index)"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </draggable>
    </div>
    <v-card-actions class="pa-0 mt-4 justify-end">
      <evocon-v-button
        v-if="canEdit"
        type="primary-light"
        :text="$t('Solution')"
        :icon="mdiPlus"
        @click="openEdit(false)"
      />
    </v-card-actions>
  </div>
  <empty-view
    v-else
    id="improvement-solutions-empty-view"
    :header="$t('Define solution')"
    :description="canEdit ? $t('How will you stop the problem from reoccurring?') : ''"
    :img-url="'step6'"
    :primary-btn="canEdit ? $t('Solution') : ''"
    :secondary-btn="$t('Learn more')"
    :primary-btn-icon="mdiPlus"
    @button-clicked="openEdit"
    @secondary-btn-clicked="navigateToLearnMore"
  />
</template>
<script>
import draggable from 'vuedraggable';
import {
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { defineAsyncComponent } from 'vue';

import { useImprovementsSolutionsStore, useGenericDialogStore, useConfirmDialogStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = {
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
};

export default {
  name: 'ImprovementSolutions',
  components: {
    draggable,
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
  emits: ['remove-solution', 'reorder'],
  data() {
    return {
      ...vectorIcons,
      cardHovered: null,
    };
  },
  computed: {
    ...mapState(useImprovementsSolutionsStore, ['solutions']),
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useImprovementsSolutionsStore, ['saveSolution', 'saveSolutionById']),
    formatDate,
    orderChanged(solution) {
      this.$emit('reorder', solution, 'Solution');
    },
    removeSolution(i, solution) {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this?'),
        action: async () => {
          this.$emit('remove-solution', i, solution);
          this.closeDialog();
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      });
    },
    openEdit(isEdit, solution, index) {
      this.openDialog({
        title: this.$t('Solution'),
        component: defineAsyncComponent(() => import('../ImprovementMeasureForm/index.vue')),
        allowFullscreen: false,
        data: {
          measure: solution,
          users: this.project.users,
          isEdit,
          measures: this.solutions,
          measureType: 'Solution',
          saveCB: async ({ currentMeasure }) => {
            if (isEdit) {
              await this.saveSolutionById({ solution: currentMeasure, index });
            } else {
              await this.saveSolution({ solution: currentMeasure });
            }
          },
          removeCB: ({ idx, currentMeasure }) => this.removeSolution(idx, currentMeasure),
        },
      });
    },
    navigateToLearnMore() {
      window.open('https://evocon.com/kb/perform-root-cause-analysis/#solutions', '_blank');
    },
  },
};
</script>
<style lang="less" scoped>
.solutions {
  overflow-y: auto;
  overflow-x: hidden;
  .not-grabbable {
    width: 32px;
  }
  .solution-btns {
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
