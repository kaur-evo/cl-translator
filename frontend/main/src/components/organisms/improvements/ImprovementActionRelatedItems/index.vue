<template>
  <v-col class="pa-4">
    <div class="mx-2 pr-2 vertical-overflow">
      <v-row>
        <v-col
          v-for="(monthList, month) in groupedMixedEntities"
          :key="month"
          cols="12"
        >
          <v-row>
            <span class="text-headline-small text-medium-emphasis">
              {{ getMonthName(month) }}
            </span>
          </v-row>
          <template
            v-for="(item, index) in monthList"
            :key="`month${index}`"
          >
            <improvement-note-card
              v-if="item.entity === 'note'"
              :project-id="project.id"
              :steps="actions"
              :note="item"
            />
            <improvement-file-card
              v-else-if="item.entity === 'file'"
              :project="project"
              :steps="actions"
              :file="item"
              :can-edit="canEdit"
            />
          </template>
        </v-col>
      </v-row>
    </div>
    <v-card-actions class="pa-0 pt-6 justify-end">
      <evocon-v-button
        :text="$t('Close')"
        @click="closeDialog"
      />
    </v-card-actions>
  </v-col>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { format } from 'date-fns';

import { useGenericDialogStore, useImprovementsNoteStore, useImprovementsFileStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ImprovementNoteCard from '@/components/organisms/improvements/ImprovementNoteCard/index.vue';
import ImprovementFileCard from '@/components/organisms/improvements/ImprovementFileCard/index.vue';
import parseDateStr from '@/helpers/date/parseDateStr';

export default {
  name: 'ImprovementActionRelatedItems',
  components: {
    EvoconVButton,
    ImprovementNoteCard,
    ImprovementFileCard,
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData']),
    ...mapState(useImprovementsNoteStore, ['notesByMonth']),
    ...mapState(useImprovementsFileStore, ['filesByMonth']),
    actions() {
      return this.dialogData.actions || [];
    },
    project() {
      return this.dialogData.project || null;
    },
    actionId() {
      return this.dialogData.actionId || null;
    },
    canEdit() {
      return this.dialogData.canEdit || false;
    },
    groupedMixedEntities() {
      const relatedItemsMap = {};
      Object.entries(this.filesByMonth).forEach(([month, filesGroup]) => {
        if (month in relatedItemsMap) {
          relatedItemsMap[month] = [
            ...relatedItemsMap[month],
            ...Object.values(filesGroup).filter((group) => Number(group.stepId) === Number(this.actionId)),
          ].sort((a, b) => new Date(b.orderBy) - new Date(a.orderBy));
        } else {
          relatedItemsMap[month] = [
            ...Object.values(filesGroup).filter((group) => Number(group.stepId) === Number(this.actionId)),
          ].sort((a, b) => new Date(b.orderBy) - new Date(a.orderBy));
        }
      });
      Object.entries(this.notesByMonth).forEach(([month, notes]) => {
        if (month in relatedItemsMap) {
          relatedItemsMap[month] = [
            ...relatedItemsMap[month],
            ...notes.filter((group) => Number(group.stepId) === Number(this.actionId)),
          ].sort((a, b) => new Date(b.orderBy) - new Date(a.orderBy));
        } else {
          relatedItemsMap[month] = [
            ...notes.filter((group) => Number(group.stepId) === Number(this.actionId)),
          ].sort((a, b) => new Date(b.orderBy) - new Date(a.orderBy));
        }
      });
      return relatedItemsMap;
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    getMonthName(date) {
      const parsedDate = parseDateStr(`${date}-01`);
      return format(parsedDate, 'MMMM yyyy');
    },
  },
};
</script>
<style lang="less" scoped>
.vertical-overflow {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 500px;
}
</style>
