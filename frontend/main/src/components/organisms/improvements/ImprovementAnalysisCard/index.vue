<template>
  <div>
    <div
      v-if="project5Whys.length"
      class="pa-2 pl-0"
    >
      <div
        class="pr-1 analysis-cards"
        :style="{ 'max-height': overflowHeight }"
      >
        <draggable
          :model-value="project5Whys"
          handle=".handle"
          draggable=".drag-item"
          @change="orderChanged"
        >
          <template #item="{ element: analysis, index }">
            <v-row
              class="drag-item flex-nowrap"
              @mouseleave="cardHovered = null"
              @mouseenter="cardHovered = index"
            >
              <v-col class="pa-0 flex-grow-0 flex-shrink-1">
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
                <v-card class="pa-4">
                  <div class="mb-1">
                    <span class="text-disabled text-label-small">{{ $t('Status') }}:</span>
                    <span class="ml-1 text-label-small">{{ analysis.solutions.length ? $t('Solution found') : $t('Solution missing') }}</span>
                  </div>
                  <div class="mb-4">
                    <v-icon
                      :color="analysis.solutions.length ? 'primary' : 'warning'"
                      size="32"
                    >
                      {{ analysis.solutions.length ? mdiCheckCircle : mdiProgressCheck }}
                    </v-icon>
                    <span class="ml-2 text-headline-small text-black mt-1">{{ analysis.problem }}</span>
                  </div>
                  <span class="text-disabled text-label-small text-no-wrap">{{ $t('Last edited') }}:</span>
                  <span class="ml-1 text-body-small">{{ formatDate(analysis.lastEdited, 'long') }}</span>
                  <span class="ml-2 text-disabled text-label-small text-no-wrap">{{ $t('Last answer') }}:</span>
                  <span class="ml-1 text-body-small">{{ getLastAnswer(analysis.whys) }}</span>
                  <div v-if="analysis.solutions.length">
                    <span class="text-disabled text-label-small">{{ $t('Last solution') }}:</span>
                    <span class="truncate-text ml-1 text-body-small text-wrap-normal">{{ getLastSolution(analysis.solutions) }}</span>
                  </div>
                  <v-card-actions class="analysis-actions">
                    <evocon-v-button
                      v-if="canEdit && cardHovered === index"
                      :icon="mdiDelete"
                      @click="deleteAnalysis(index)"
                    />
                    <evocon-v-button
                      v-if="canEdit && cardHovered === index"
                      :icon="mdiPencil"
                      @click="editAnalysis(index)"
                    />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </draggable>
      </div>
      <v-card-actions class="pa-0 mt-4 d-flex justify-end">
        <evocon-v-button
          v-if="canEdit"
          type="primary-light"
          :text="$t('5 Whys')"
          :icon="mdiPlus"
          @click="add5Whys"
        />
      </v-card-actions>
    </div>
    <empty-view
      v-else
      id="improvement-analysis-empty-view"
      :header="$t('Root cause analysis')"
      :description="canEdit ? $t('Perform 5 Whys analysis and get to the bottom of things.') : ''"
      :primary-btn="canEdit ? $t('5 Whys') : ''"
      :img-url="'5whys'"
      :primary-btn-icon="mdiPlus"
      :secondary-btn="$t('Learn more')"
      @button-clicked="add5Whys"
      @secondary-btn-clicked="navigateToLearnMore"
    />
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import { mapState, mapActions } from 'pinia';
import {
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
  mdiProgressCheck,
} from '@mdi/js';

import { useImprovementsAnalysisStore, useConfirmDialogStore } from '@/stores/index';
import { formatDate } from '@/helpers/date/formatDate';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = {
  mdiDrag,
  mdiPlus,
  mdiDelete,
  mdiPencil,
  mdiCheckCircle,
  mdiProgressCheck,
};

export default {
  name: 'ImprovementAnalysisCard',
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
  data() {
    return {
      ...vectorIcons,
      cardHovered: null,
      currentSelectedIdx: null,
    };
  },
  computed: {
    ...mapState(useImprovementsAnalysisStore, ['project5Whys']),
  },
  methods: {
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    ...mapActions(useImprovementsAnalysisStore, ['saveAnalysis']),
    formatDate,
    getLastAnswer(whys) {
      return whys && whys.length ? whys[whys.length - 1].answer : '';
    },
    getLastSolution(solutions) {
      return solutions && solutions.length ? solutions[solutions.length - 1].description : '';
    },
    add5Whys() {
      this.$router.push({ name: 'improvementAnalysisForm', params: { id: this.project.id } });
    },
    editAnalysis(index) {
      this.currentSelectedIdx = index;
      this.$router.push({ name: 'improvementAnalysisForm', params: { id: this.project.id, analysisIdx: this.currentSelectedIdx } });
    },
    deleteAnalysis(index) {
      this.openConfirmDialog({
        title: this.$t('Confirmation'),
        text: this.$t('Are you sure you want to delete this?'),
        action: () => {
          this.project5Whys.splice(index, 1);
          this.saveAnalysis({ projectId: this.project.id, analysis: { '5whys': this.project5Whys } });
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      });
    },
    orderChanged(analysisCard) {
      const currentElem = this.project5Whys[analysisCard.moved.oldIndex];
      this.project5Whys.splice(analysisCard.moved.oldIndex, 1);
      this.project5Whys.splice(analysisCard.moved.newIndex, 0, currentElem);
      this.saveAnalysis({ projectId: this.project.id, analysis: { '5whys': this.project5Whys } });
    },
    navigateToLearnMore() {
      window.open('https://evocon.com/kb/5-whys-root-cause-analysis/', '_blank');
    },
  },
};
</script>
<style lang="less" scoped>
.analysis-cards {
  overflow-x: hidden;
  .not-grabbable {
    width: 32px;
  }
  .analysis-actions {
    min-height: 24px;
    height: 24px;
    padding: 0;
    margin-top: 8px;
    justify-content: end;
  }
}
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}
.text-wrap-normal {
  white-space: normal;
  word-break: break-all;
}
</style>
