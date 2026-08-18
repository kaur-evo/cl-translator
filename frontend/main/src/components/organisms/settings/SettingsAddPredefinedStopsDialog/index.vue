<template>
  <form-dialog-template
    :primary-segment-title="$t('Downtime auto-commenting')"
    :primary-segment-subtitle="$t('Automatic comments for recurring events within a shift (e.g., Break)')"
  >
    <template #primary-segment>
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-row>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <evocon-time-input
              id="start-time-input"
              v-model.trim="formData.startTime"
              :rules="[startTimeRule]"
              :hint="$t('Start time')"
              :prepend-inner-icon="mdiClockOutline"
              validate-on-blur
              required
              @update:model-value="setTime('startTime', $event)"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
            md="6"
          >
            <evocon-time-input
              id="end-time-input"
              v-model.trim="formData.endTime"
              :rules="[endTimeRule]"
              :hint="$t('End time')"
              :prepend-inner-icon="mdiClockOutline"
              validate-on-blur
              required
              @update:model-value="setTime('endTime', $event)"
            />
          </v-col>
          <v-col
            id="comment-select-column"
            class="px-1 mb-2"
            cols="12"
          >
            <selection-input
              id="comment-select"
              :model-value="[formData.commentId]"
              :items="filteredComments"
              :groups="commentGroups"
              :placeholder="$t('Stop reason')"
              :hint="commentSelectionHintText"
              is-single-select
              is-grouped-select
              required
              @update:model-value="formData.commentId = $event[0]"
            />
          </v-col>
          <v-col
            class="px-1 mb-2"
            cols="12"
          >
            <selection-input
              id="position-select"
              :model-value="[formData.positionId]"
              :items="filteredPositions"
              :items-map="positionsMap"
              :placeholder="$t('Machine location')"
              :hint="`${$t('Machine location')} (${$t('Optional').toLowerCase()})`"
              is-single-select
              @update:model-value="formData.positionId = $event[0]"
            />
          </v-col>
        </v-row>
      </v-form>
    </template>
    <template #actions>
      <delete-button
        v-if="dialogData.predefinedStop"
        @click="onDeleteStop"
      />
      <v-spacer />
      <evocon-v-button
        id="cancel-button"
        :text="$t('Cancel')"
        type="secondary"
        @click="closeDialog()"
      />
      <evocon-v-button
        v-if="formData.shiftTemplateId"
        id="save-button"
        :text="$t('Save')"
        color="primary"
        @click="onSaveClick()"
      />
      <evocon-v-button
        v-else
        id="save-button"
        :text="$t('Apply')"
        type="primary-light"
        @click="onSaveClick()"
      />
    </template>
  </form-dialog-template>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiClockOutline } from '@mdi/js';

import useGenericDialogStore from '@/stores/genericDialog';
import useGenericNotificationStore from '@/stores/genericNotification';
import useCommentStore from '@/stores/comment';
import usePositionStore from '@/stores/position';
import { isTimeBetweenRange, isTimeOverlapping } from '@/helpers/time/timeComparison';
import EvoconTimeInput from '@/components/atoms/EvoconTimeInput/index.vue';
import FormDialogTemplate from '@/components/templates/FormDialogTemplate/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import DeleteButton from '@/components/atoms/DeleteButton/index.vue';

const vectorIcons = { mdiClockOutline };

export default {
  name: 'SettingsPredefinedStopsDialog',
  components: {
    FormDialogTemplate,
    EvoconTimeInput,
    EvoconVButton,
    SelectionInput,
    DeleteButton,
  },
  data() {
    return {
      ...vectorIcons,
      valid: true,
      formData: {
        shiftTemplateId: undefined,
        startTime: undefined,
        endTime: undefined,
        commentId: undefined,
        positionId: 0,
        enabled: true,
      },
    };
  },
  computed: {
    ...mapState(useGenericDialogStore, ['dialogData', 'onPrimaryAction', 'onSecondaryAction']),
    ...mapState(useCommentStore, ['commentGroups', 'comments', 'commentsMap']),
    ...mapState(usePositionStore, ['getPositionsByStationIds', 'positionsMap']),
    startTimeRule() {
      if (!this.formData.startTime) return this.$t('Start time needs to be defined');
      if (this.formData.startTime === this.formData.endTime) return this.$t('Start time');
      if (!isTimeBetweenRange(this.dialogData.shiftStart, this.dialogData.shiftEnd, this.formData.startTime)) return this.$t('Entered time is outside shift boundaries');
      if (!isTimeBetweenRange(this.dialogData.shiftStart, this.formData.endTime, this.formData.startTime)) return this.$t('Start time');
      return true;
    },
    endTimeRule() {
      if (!this.formData.endTime) return this.$t('End time needs to be defined');
      if (this.formData.startTime === this.formData.endTime) return this.$t('End time');
      if (!isTimeBetweenRange(this.dialogData.shiftStart, this.dialogData.shiftEnd, this.formData.endTime)) return this.$t('Entered time is outside shift boundaries');
      if (!isTimeBetweenRange(this.formData.startTime, this.dialogData.shiftEnd, this.formData.endTime)) return this.$t('End time');
      return true;
    },
    filteredComments() {
      return this.comments.filter((comment) => comment.stationIds.some((id) => this.dialogData.stationIds.includes(id)));
    },
    filteredPositions() {
      return this.getPositionsByStationIds(this.dialogData.stationIds);
    },
    commentSelectionHintText() {
      const maxDuration = this.commentsMap[this.formData.commentId]?.maxDuration;
      if (this.formData.commentId && maxDuration) {
        const formattedDuration = formatSecondsFriendly(maxDuration, false);
        return this.$t('Maximum allowed duration {value}', { value: formattedDuration });
      }
      return this.$t('Stop reason');
    },
  },
  mounted() {
    if (this.dialogData.predefinedStop) this.setFormData(this.dialogData.predefinedStop);
    else {
      this.formData.startTime = this.dialogData.shiftStart;
      this.formData.endTime = this.dialogData.shiftEnd;
      this.formData.shiftTemplateId = this.dialogData.shiftId;
    }
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyError']),
    async onSaveClick() {
      await this.$refs.form.validate();
      const isOverlapping = this.checkOverlapping();
      if (isOverlapping) {
        const errorMessage = this.$t('Overlapping times, auto-commenting not saved');
        this.notifyError(errorMessage);
      } else if (this.valid) {
        this.onPrimaryAction(this.formData);
        this.closeDialog();
      }
    },
    onDeleteStop() {
      this.onSecondaryAction();
      this.closeDialog();
    },
    setTime(key, input) {
      if (!input || input.length !== 5) return;
      this.formData[key] = input;
    },
    setFormData(data) {
      this.formData = { ...data };
      if (!this.formData.shiftTemplateId) this.formData.shiftTemplateId = this.dialogData.shiftId;
    },
    checkOverlapping() {
      return this.dialogData.predefinedStops.some((stop, i) => i !== this.dialogData.index
        && isTimeOverlapping(stop.startTime, stop.endTime, this.formData.startTime, this.formData.endTime));
    },
  },
};
</script>
