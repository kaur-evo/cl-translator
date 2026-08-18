<template>
  <div
    v-if="$route.name === 'improvementAnalysisForm'"
    class="py-10 fill-height bg-quaternary-dark"
  >
    <v-container class="fill-height d-flex flex-wrap align-start justify-center">
      <v-card
        class="pa-4 pt-0"
        height="max-content"
        width="1488"
      >
        <div class="text-headline-small py-4 font-weight-medium text-center">
          {{ $t('5 Whys') }}
        </div>
        <v-form
          ref="analysisForm"
          v-model="valid"
        >
          <evocon-v-input
            ref="description"
            v-model.trim="problem"
            class="pb-4"
            :hint="$t('Problem statement')"
            max-length="200"
            required
          />
          <div
            v-for="(why, index) in whys"
            :key="`why-${index}`"
            class="mb-4"
          >
            <v-row class="pl-1 d-flex justify-space-between">
              <v-col class="px-0">
                <evocon-v-input
                  v-model.trim="why.question"
                  class="px-2 mb-2"
                  :placeholder="`${$t('Why')}`"
                  :hint="$t('Question')"
                  max-length="100"
                  density="compact"
                />
              </v-col>
              <v-col
                class="pa-0 pr-3 mt-2 action-button multiple"
                cols="1"
              >
                <evocon-v-button
                  :icon="mdiDelete"
                  @click="deleteWhy(index)"
                />
              </v-col>
            </v-row>
            <div class="px-0 pr-14">
              <evocon-v-textarea
                v-model.trim="why.answer"
                :placeholder="`${$t('Because')}...`"
                :hint="$t('Answer')"
                :rules="index === 0 ? firstAnswerRule : []"
                rows="1"
                max-length="200"
                density="compact"
                no-resize
              />
            </div>
          </div>
          <evocon-v-button
            :icon="mdiPlus"
            :text="$t('Why')"
            @click="addWhy()"
          />
          <evocon-v-button
            :icon="mdiPlus"
            :text="$t('Solution')"
            @click="addSolution()"
          />
          <div
            v-for="(solution, index) in solutions"
            :key="`solution-${index}`"
            class="my-4 solutions-section"
          >
            <v-row class="pl-1 d-flex align-baseline justify-space-between">
              <v-col class="px-2">
                <evocon-v-input
                  v-model.trim="solution.description"
                  :placeholder="$t('Solution')"
                  :hint="$t('Solution')"
                  required
                />
              </v-col>
              <v-col
                class="pa-0 pr-4 action-button"
                cols="1"
              >
                <evocon-v-button
                  :icon="mdiDelete"
                  @click="deleteSolution(index)"
                />
              </v-col>
            </v-row>
            <div>
              <v-checkbox
                v-model="solution.addSolutionToProject"
                class="mt-n1 include-solution-checkbox"
                :label="$t('Add to the solutions section')"
                color="primary"
              />
            </div>
          </div>
        </v-form>
        <v-card-actions class="pa-0 justify-end">
          <evocon-v-button
            :text="$t('Cancel')"
            variant="text"
            @click="goBack"
          />
          <evocon-v-button
            class="bg-primary"
            :text="$t('Save')"
            :loading="loading"
            :disabled="isSaveBtnDisabled"
            @click="onSaveClick"
          />
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
  <router-view v-else />
</template>
<script>
import { mdiDelete, mdiPlus } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { format } from 'date-fns';

import { useImprovementsAnalysisStore, useImprovementsSolutionsStore } from '@/stores/index';
import improvementsProjectApi from '@/api/improvementsProjectApi';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiDelete, mdiPlus };

export default {
  name: 'ImprovementAnalysisForm',
  components: {
    EvoconVInput,
    EvoconVTextarea,
    EvoconVButton,
  },
  data() {
    return {
      ...vectorIcons,
      project: undefined,
      loading: false,
      valid: true,
      problem: '',
      whys: [],
      solutions: [],
      firstAnswerRule: [
        (v) => !!v || this.$t('At least one answer is needed to save the analysis'),
      ],
    };
  },
  computed: {
    ...mapState(useImprovementsAnalysisStore, ['project5Whys']),
    analysisIndex() {
      return parseInt(this.$route.params.analysisIdx, 10);
    },
    isSaveBtnDisabled() {
      if (this.whys.length && this.solutions.length) {
        return !this.whys[0].answer || !this.solutions[0].description;
      }
      return this.whys.length ? !this.whys[0].answer : '';
    },
  },
  async mounted() {
    try {
      this.$refs.description.focus();
    } catch {
      // pass for tests
    }
    try {
      await this.fetchAnalysis(this.$route.params.id);
      this.project = await improvementsProjectApi.getProject(this.$route.params.id);
      if (this.analysisIndex > -1) {
        const currentAnalysis = this.project5Whys[this.analysisIndex];
        this.problem = currentAnalysis.problem;
        this.whys = currentAnalysis.whys.map((why) => ({ ...why }));
        this.solutions = currentAnalysis.solutions.map((solution) => ({ ...solution }));
      } else {
        this.problem = this.project.description;
        this.addWhy();
      }
    } catch {
      // pass for tests
    }
  },
  methods: {
    ...mapActions(useImprovementsAnalysisStore, ['fetchAnalysis', 'saveAnalysis']),
    ...mapActions(useImprovementsSolutionsStore, ['saveSolution']),
    goBack() {
      this.$router.push({ name: 'improvementProject', params: { id: this.project.id } });
    },
    onSaveClick() {
      const analysis = {
        problem: this.problem,
        whys: this.whys,
        solutions: this.solutions,
        lastEdited: format(new Date(), 'yyyy-MM-dd'),
      };
      if (this.analysisIndex > -1) {
        this.project5Whys[this.analysisIndex] = analysis;
      } else {
        this.project5Whys.push(analysis);
      }
      this.save5Whys(analysis);
      this.goBack();
    },
    save5Whys(currentAnalysis) {
      if (currentAnalysis && currentAnalysis.solutions.length) {
        currentAnalysis.solutions.forEach((analysisSolution) => {
          if (analysisSolution.addSolutionToProject) {
            const existingSolution = this.project.correctiveMeasures.find((solution) => solution.description === analysisSolution.description);
            if (!existingSolution) {
              const currentSolution = { description: analysisSolution.description, projectId: this.project.id, startDate: null };
              this.saveSolution({ solution: currentSolution });
            }
          }
        });
      }
      this.saveAnalysis({ projectId: this.project.id, analysis: { '5whys': this.project5Whys } });
    },
    deleteWhy(idx) {
      this.whys.splice(idx, 1);
    },
    addWhy() {
      this.whys.push({ question: '', answer: '' });
    },
    deleteSolution(idx) {
      this.solutions.splice(idx, 1);
    },
    addSolution() {
      this.solutions.push({ description: '', addSolutionToProject: false });
    },
  },
};
</script>
<style lang="less" scoped>
.solutions-section {
  .include-solution-checkbox {
    margin-left: 10px;
    &:deep(.v-label) {
      font-size: 14px;
      color: #000;
    }
  }
}
.action-button {
  max-width: max-content;
  &.multiple {
    display: grid;
  }
}
</style>
