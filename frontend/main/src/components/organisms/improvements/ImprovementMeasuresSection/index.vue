<template>
  <v-col cols="6">
    <v-card class="ma-3">
      <GenericTabsRow
        v-model="activeTab"
        :items="tabs"
        :count-func="(val) => getTabCount(val.value)"
        height="56"
        color="black"
      />
      <v-divider />
      <improvement-analysis-card
        v-if="activeTab === 0"
        class="pa-4 pl-0"
        :can-edit="canEdit"
        :project="project"
        :overflow-height="'600px'"
      />
      <improvement-actions
        v-if="activeTab === 1"
        class="pa-6 pl-0"
        :can-edit="canEdit"
        :project="project"
        :overflow-height="'600px'"
        @remove-action="removeAction"
        @reorder="reorderMeasures"
        @replace-actions="replaceActions"
      />
      <improvement-solutions
        v-if="activeTab === 2"
        class="pa-6 pl-0"
        :can-edit="canEdit"
        :project="project"
        @remove-solution="removeSolution"
        @reorder="reorderMeasures"
      />
    </v-card>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';

import { useImprovementsAnalysisStore, useImprovementsActionsStore, useImprovementsSolutionsStore } from '@/stores/index';
import { ACTION } from '@/constants/improvementsMeasureTypes';
import improvementsMeasureApi from '@/api/improvementsMeasureApi';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import ImprovementAnalysisCard from '@/components/organisms/improvements/ImprovementAnalysisCard/index.vue';
import ImprovementActions from '@/components/organisms/improvements/ImprovementActions/index.vue';
import ImprovementSolutions from '@/components/organisms/improvements/ImprovementSolutions/index.vue';
import getNewOrder from '@/helpers/getNewOrder';

export default {
  name: 'ImprovementMeasuresSection',
  components: {
    GenericTabsRow,
    ImprovementAnalysisCard,
    ImprovementActions,
    ImprovementSolutions,
  },
  props: {
    project: {
      type: Object,
      default: () => {},
    },
    canEdit: {
      type: Boolean,
    },
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        { label: this.$t('Analysis'), value: 'analysis' },
        { label: this.$t('Actions'), value: 'actions' },
        { label: this.$t('Solutions'), value: 'solutions' },
      ],
    };
  },
  computed: {
    ...mapState(useImprovementsAnalysisStore, ['analysis']),
    ...mapState(useImprovementsActionsStore, ['actions']),
    ...mapState(useImprovementsSolutionsStore, ['solutions']),
  },
  methods: {
    ...mapActions(useImprovementsActionsStore, ['saveAction']),
    getTabCount(tabValue) {
      if (tabValue === 'analysis' && this.analysis['5whys']) return this.analysis['5whys'].length;
      if (tabValue === 'actions') return this.actions.length;
      if (tabValue === 'solutions') return this.solutions.length;
      return 0;
    },
    async removeAction(i, action) {
      this.actions.splice(i, 1);
      await improvementsMeasureApi.deleteAction(action.id);
    },
    async removeSolution(i, solution) {
      this.solutions.splice(i, 1);
      await improvementsMeasureApi.deleteSolution(solution.id);
    },
    async reorderMeasures(measure, type) {
      const currentArray = type === ACTION ? this.actions : this.solutions;
      const currentElem = currentArray[measure.moved.oldIndex];
      const reorderedMeasure = { ordering: getNewOrder(measure.moved, currentArray) };
      currentArray.splice(measure.moved.oldIndex, 1);
      currentArray.splice(measure.moved.newIndex, 0, measure.moved.element);
      for (let i = 0; i < currentArray.length; i += 1) {
        currentArray[i].ordering = i;
      }
      if (type === ACTION) {
        await improvementsMeasureApi.reorderAction(currentElem.id, reorderedMeasure);
      } else {
        await improvementsMeasureApi.reorderSolution(currentElem.id, reorderedMeasure);
      }
    },
    async replaceActions(newActionsArray) {
      await improvementsMeasureApi.deleteAllMeasures(this.project.id);
      await this.saveAction({ action: newActionsArray, replace: true });
    },
  },
};
</script>
