<template>
  <evocon-v-snackbar
    id="check-notification"
    :model-value="isToastVisible"
    timeout="600000"
    location="bottom center"
    :min-width="$vuetify.display.smAndUp ? 573 : '90%'"
    max-width="1100"
    :min-height="isMobileView ? undefined : 68"
    :icon="mdiPlaylistCheck"
    :description="checkText"
    @close="closed = true"
  >
    <template #actions>
      <evocon-v-button
        v-if="!isReadOnly && currentShift.id === shift.id"
        id="do-button"
        class="mx-2"
        color="primary"
        :text="$t('Start_verb')"
        @click="onDoCheck()"
      />
      <evocon-v-button
        v-if="!isReadOnly && currentShift.id !== shift.id"
        id="shift-button"
        color="primary"
        class="mx-2"
        :text="$t('Current shift')"
        @click="navigateToRunningShift()"
      />
    </template>
  </evocon-v-snackbar>
</template>

<script>
import { mdiPlaylistCheck } from '@mdi/js';
import { mapActions, mapState } from 'pinia';
import { differenceInSeconds } from 'date-fns';

import {
  useChecklistTaskStore,
  useProfileStore,
  useStationStore,
  useShiftStore,
  useGenericDialogStore,
  useShiftviewSelectionStore,
  useDeviceStore,
} from '@/stores/index';
import { checklistStatuses } from '@/constants/checklistsConstants';
import { formatTime } from '@/helpers/time/formatTime';
import checklistOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/checklistOverviewDialogConfig';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import EvoconVSnackbar from '@/components/atoms/EvoconVSnackbar/index.vue';

const vectorIcons = { mdiPlaylistCheck };

export default {
  name: 'ChecklistNotification',
  components: {
    EvoconVButton,
    EvoconVSnackbar,
  },
  emits: ['toggle-notification'],
  data() {
    return {
      ...vectorIcons,
      closed: false,
      isVisible: false,
    };
  },
  computed: {
    ...mapState(useChecklistTaskStore, ['checklistTasks', 'runningShiftChecklists']),
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useShiftStore, ['currentShift', 'shift']),
    ...mapState(useGenericDialogStore, ['componentName', 'isDialogOpened']),
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(useDeviceStore, ['isMobileView']),
    checkText() {
      return this.newChecks.length === 1
        ? `${this.firstCheck.name} ${this.$t('due at')} ${formatTime(this.firstCheck.dateTime)}`
        : this.$t('New checklists ({variable})', { variable: this.newChecks.length });
    },
    newChecks() {
      const checklists = this.shift?.id === this.currentShift?.id ? this.checklistTasks : this.runningShiftChecklists;
      return checklists.filter((el) => el.status === checklistStatuses.NEW && differenceInSeconds(new Date(), new Date(el.dateTime)) < 300);
    },
    firstCheck() {
      return this.newChecks[0];
    },
    isToastVisible() {
      if (this.isSelectionActive) return false;
      return this.newChecks.length > 0
        && !['ChecklistOverviewDialog', 'ChecklistEditDialog'].includes(this.componentName)
        && !this.closed
        && this.isVisible;
    },
  },
  watch: {
    isToastVisible(newValue) {
      this.$emit('toggle-notification', newValue);
    },
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    onDoCheck() {
      if (this.isDialogOpened) this.closeDialog();
      if (this.newChecks.length === 1) {
        this.openDialog({ ...checklistEditDialogConfig, data: { item: this.newChecks[0] } });
      } else {
        this.openDialog(checklistOverviewDialogConfig);
      }
    },
    navigateToRunningShift() {
      this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: this.currentShift.id } });
    },
    // eslint-disable-next-line vue/no-unused-properties
    showNotification() {
      this.isVisible = true;
      this.closed = false;
    },
  },
};
</script>
