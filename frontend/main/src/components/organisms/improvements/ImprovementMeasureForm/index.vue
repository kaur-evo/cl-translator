<template>
  <div class="px-4">
    <evocon-v-textarea
      id="measure-description"
      v-model.trim="currentMeasure.description"
      :placeholder="$t('Description')"
      :hint="$t('Description')"
      :rules="[(v) => !!v && !!v.trim() || $t('Description')]"
      max-length="500"
      no-resize
      class="mb-2"
    />
    <v-row v-if="measureType === ACTION">
      <v-col
        :cols="4"
        class="pr-2"
      >
        <evocon-date-input
          id="deadline-field"
          v-model="currentMeasure.deadline"
          :hint="`${$t('Deadline')} (${$t('Optional').toLowerCase()})`"
          clearable
        />
      </v-col>
      <v-col :cols="8">
        <selection-input
          id="responsible-people"
          v-model="peopleResponsible"
          :items="users"
          item-text="fullName"
          item-value="userId"
          :placeholder="$t('Person responsible')"
          :hint="`${$t('Person responsible')} (${$t('Optional').toLowerCase()})`"
          hide-search
        />
      </v-col>
    </v-row>
    <evocon-date-input
      v-else
      id="implementation-date-field"
      v-model="currentMeasure.startDate"
      :hint="`${$t('Implemented')} (${$t('Optional').toLowerCase()})`"
      clearable
    />
    <v-card-actions class="px-0">
      <evocon-v-button
        v-if="isEdit"
        id="delete-btn"
        variant="text"
        color="error"
        :text="$t('Delete')"
        @click="removeMeasure()"
      />
      <v-spacer />
      <evocon-v-button
        id="cancel-btn"
        variant="text"
        :text="$t('Cancel')"
        @click="cancelEdit()"
      />
      <evocon-v-button
        id="save-btn"
        color="primary"
        :disabled="currentMeasure.description.length === 0"
        :text="$t('Save')"
        @click="saveMeasure()"
      />
    </v-card-actions>
  </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiCalendar } from '@mdi/js';

import { useGenericDialogStore } from '@/stores/index';
import { ACTION, SOLUTION } from '@/constants/improvementsMeasureTypes';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';
import EvoconDateInput from '@/components/molecules/EvoconDateInput/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';

const measureTypes = { ACTION, SOLUTION };
const vectorIcons = { mdiCalendar };

export default {
  name: 'ImprovementMeasureForm',
  components: {
    EvoconVButton, EvoconVTextarea, EvoconDateInput, SelectionInput,
  },
  data() {
    return {
      ...measureTypes,
      ...vectorIcons,
      dateMenu: false,
      currentMeasure: {
        startDate: null,
        description: '',
        deadline: null,
      },
      peopleResponsible: [],
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    isEdit() {
      return this.dialogData.isEdit || false;
    },
    measureArray() {
      return this.dialogData.measures || [];
    },
    users() {
      return this.dialogData.users || [];
    },
    measureType() {
      return this.dialogData.measureType || [];
    },
  },
  mounted() {
    this.dateMenu = false;
    this.currentMeasure = { ...this.currentMeasure, ...this.dialogData.measure };
    this.peopleResponsible = this.currentMeasure.responsibleUsers ? this.currentMeasure.responsibleUsers.map((user) => user.userId) : [];
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    cancelEdit() {
      this.dateMenu = false;
      this.closeDialog();
    },
    saveMeasure() {
      if (this.currentMeasure.description.length) {
        const responsibleUsers = this.users.filter((user) => this.peopleResponsible.includes(user.userId));
        if (!this.isEdit) {
          if (this.measureType === ACTION) {
            this.currentMeasure = {
              description: this.currentMeasure.description,
              projectId: this.$route.params.id || null,
              ordering: null,
              responsibleUsers,
              deadline: this.currentMeasure.deadline,
            };
          } else {
            this.currentMeasure = {
              description: this.currentMeasure.description,
              projectId: this.$route.params.id || null,
              startDate: this.currentMeasure.startDate,
            };
          }
        } else if (this.measureType === ACTION) {
          this.currentMeasure.responsibleUsers = responsibleUsers;
        }
        this.dateMenu = false;
        this.closeDialog();
        const measureToSave = (this.measureType === ACTION) ? [this.currentMeasure] : this.currentMeasure;
        this.dialogData.saveCB({ currentMeasure: measureToSave });
      }
    },
    removeMeasure() {
      const elemIndex = this.measureArray.indexOf(this.currentMeasure);
      if (this.dialogData.removeCB) {
        this.dialogData.removeCB({ index: elemIndex, currentMeasure: this.currentMeasure });
      }
    },
  },
};
</script>
