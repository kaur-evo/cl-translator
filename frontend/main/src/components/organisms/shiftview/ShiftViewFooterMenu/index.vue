<template>
  <v-bottom-navigation
    ref="footer-menu"
    :horizontal="$vuetify.display.lgAndUp"
    height="48"
    class="bg-lw-background shiftview-footer"
    :class="{ 'shiftview-footer--disabled': isSelectionActive }"
    :disabled="isSelectionActive"
  >
    <v-menu v-if="showAdditionalFooterMenu">
      <template #activator="{ props }">
        <v-btn
          id="additional-footer-menu-button"
          color="white"
          :disabled="isAdditionalFooterMenuDisabled"
          class="max-width-reset min-width-reset text-body-medium px-3 flex-shrink-1 flex-grow-0"
          :height="48"
          :icon="mdiDotsVertical"
          v-bind="props"
        />
      </template>
      <shiftview-shift-options-menu :require-operator="requireOperator" />
    </v-menu>
    <v-menu v-if="currentUser.lineviewLanguages.length > 1 && $vuetify.display.smAndUp">
      <template #activator="{ props }">
        <v-btn
          class="max-width-reset min-width-reset text-body-medium px-3 flex-shrink-1 flex-grow-0"
          :disabled="isSelectionActive"
          v-bind="props"
          :height="48"
        >
          <evocon-flag-icon
            :flag-country-code="language"
            squared
            rounded
          />
        </v-btn>
      </template>
      <language-select-menu />
    </v-menu>
    <shift-view-footer-menu-item
      v-for="item in menu"
      :id="`footer-item-${item.id}`"
      :key="item.id"
      :item="item"
    />
  </v-bottom-navigation>
</template>
<script>
import { mapState } from 'pinia';
import {
  mdiAccountHardHat,
  mdiAutorenew,
  mdiHelpCircleOutline,
  mdiEmail,
  mdiDotsVertical,
  mdiSpeedometerSlow,
  mdiPlaylistCheck,
  mdiMinusCircleOutline,
} from '@mdi/js';
import { DateTime } from 'luxon';

import { checklistStatuses } from '@/constants/checklistsConstants';
import colorConstants from '@/constants/colorConstants';
import EvoconFlagIcon from '@/components/atoms/EvoconFlagIcon/index.vue';
import ShiftViewFooterMenuItem from '@/components/organisms/shiftview/ShiftViewFooterMenuItem/index.vue';
import shiftviewDialogs from '@/constants/dialogConfigs';
import scrapOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/scrapOverviewDialogConfig';
import downtimeOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/downtimeOverviewDialogConfig';
import speedLossOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/speedLossOverviewDialogConfig';
import checklistOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/checklistOverviewDialogConfig';
import teamOverviewDialogConfig from '@/constants/shiftviewDialogConfigs/teamOverviewDialogConfig';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import ShiftviewShiftOptionsMenu from '@/components/organisms/shiftview/ShiftviewShiftOptionsMenu/index.vue';
import LanguageSelectMenu from '@/components/organisms/shiftview/LanguageSelectMenu/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import userHasTimeRestriction from '@/helpers/timeRestriction';
import filterVisibleChecklists from '@/helpers/checklist/filterVisibleChecklists';
import {
  useConfigurationStore, useChecklistTaskStore, useProfileStore,
  useStationStore, useOperatorStore, useShiftviewTimelineStore,
  useShiftStore, useShiftviewSelectionStore, useUserPreferencesStore,
  useDeviceStore,
} from '@/stores/index';

const vectorIcons = {
  mdiAccountHardHat,
  mdiAutorenew,
  mdiHelpCircleOutline,
  mdiEmail,
  mdiDotsVertical,
  mdiSpeedometerSlow,
  mdiMinusCircleOutline,
};
export default {
  name: 'ShiftViewFooterMenu',
  components: {
    ShiftViewFooterMenuItem,
    ShiftviewShiftOptionsMenu,
    LanguageSelectMenu,
    EvoconFlagIcon,
  },
  props: {
    requireOperator: {
      type: Boolean,
    },
    unreadMessagesCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      ...vectorIcons,
      lastTeamExists: false,
    };
  },
  computed: {
    ...mapState(useConfigurationStore, ['checklistStations']),
    ...mapState(useChecklistTaskStore, ['checklistTasks']),
    ...mapState(useProfileStore, ['currentUser', 'language', 'shiftviewStationUserRole', 'numberFormattingOptions', 'shiftviewStationRoleAllows']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useOperatorStore, ['operatorsRealMap']),
    ...mapState(useShiftviewTimelineStore, ['teamTimeline', 'slicesByType', 'shiftScrapDisplayValue', 'yellowRanges']),
    ...mapState(useShiftStore, ['statistics', 'isLastShiftSelected', 'shift', 'shifts', 'isShiftRunning']),
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    ...mapState(useDeviceStore, ['isMobileView']),
    // store getter is not used here to distinguish user with read access from user with time restricion
    // user with time restriction has the right to start a new shift
    isReadOnly() {
      if (['OFFICE_USER', 'LINEVIEW_USER'].includes(this.shiftviewStationUserRole)) return !(this.currentUser.allowedStations[this.lineviewStation.id]);
      return false;
    },
    userHasTimeRestriction() {
      return userHasTimeRestriction(this.currentUser, this.shift, this.shifts, this.shiftviewStationUserRole);
    },
    colors() {
      return colorConstants[this.$vuetify.theme.name];
    },
    stoppagesCount() {
      return this.slicesByType.uncommented.length
        + this.slicesByType.commented.length
        + this.slicesByType.planned.length;
    },
    visibleChecklistTasks() {
      if (!this.lineviewStation?.id) {
        return this.checklistTasks;
      }
      return filterVisibleChecklists(
        this.checklistTasks,
        this.viewSettings.visibleChecklistIdsByStation,
        this.lineviewStation.id,
      );
    },
    menu() {
      return [
        {
          id: 'operator',
          dialogConf: this.teamTimeline.length ? teamOverviewDialogConfig : editTeamDialogConfig,
          name: this.getOperatorName(),
          icon: mdiAccountHardHat,
          hasIconDot: this.lineviewStation.requireOperator && this.teamTimeline.length === 0,
          color: this.colors['lw-red'],
          visible: true,
          disabled: (this.isReadOnly || this.userHasTimeRestriction) && this.teamTimeline.length === 0,
        },
        {
          id: 'changeover',
          name: this.$t('Product changeover'),
          icon: mdiAutorenew,
          visible: this.$vuetify.display.smAndUp && !this.viewSettings.hideChangeover,
          disabled: this.isReadOnly || this.userHasTimeRestriction,
          requireOperatorBeforeOpen: this.requireOperator,
        },
        {
          id: 'stoppages',
          name: this.$t('Downtime'),
          dialogConf: downtimeOverviewDialogConfig,
          icon: mdiHelpCircleOutline,
          visible: true,
          disabled: this.stoppagesCount === 0,
          counter: this.slicesByType.uncommented.length,
          color: this.colors['lw-red'],
          requireOperatorBeforeOpen: this.requireOperator,
        },
        {
          id: 'speedloss',
          name: this.$t('Speed loss'),
          dialogConf: speedLossOverviewDialogConfig,
          icon: mdiSpeedometerSlow,
          visible: true,
          disabled: this.yellowRanges.length === 0,
          counter: this.yellowRanges?.filter((el) => el.perfLossCommentId === 0).length,
          darkBadgeText: true,
          color: this.colors['lw-yellow'],
          requireOperatorBeforeOpen: this.requireOperator,
        },
        {
          id: 'scrap',
          name: this.$t('Scrap'),
          icon: mdiMinusCircleOutline,
          visible: true,
          dialogConf: scrapOverviewDialogConfig,
          counter: this.shiftScrapDisplayValue ? formatNumber(this.shiftScrapDisplayValue, { decimalPlaces: Math.min(2, this.numberFormattingOptions.decimalPlaces) }) : 0,
          disabled: this.statistics.shiftTotal?.quantity === 0,
          color: this.colors['lw-orange'],
          requireOperatorBeforeOpen: this.requireOperator,
        },
        {
          id: 'checklists',
          name: this.$t('Checklists'),
          icon: mdiPlaylistCheck,
          dialogConf: checklistOverviewDialogConfig,
          visible: this.checklistStations.includes(this.lineviewStation.id),
          counter: this.visibleChecklistTasks?.filter((check) => [checklistStatuses.NEW, checklistStatuses.MISSED].includes(check.status)).length || 0,
          color: this.colors['lw-red'],
          disabled: false,
          requireOperatorBeforeOpen: this.requireOperator,
        },
        {
          id: 'messages',
          name: this.$t('Messages'),
          icon: mdiEmail,
          dialogConf: shiftviewDialogs.MESSAGES,
          visible: true,
          disabled: this.isReadOnly || this.userHasTimeRestriction,
          counter: this.unreadMessagesCount,
          compact: true,
          color: colorConstants.dark.primary,
          requireOperatorBeforeOpen: this.requireOperator,
        },
      ]?.filter((item) => item.visible) || [];
    },
    showAdditionalFooterMenu() {
      const isShiftDeletable = this.shiftviewStationRoleAllows('deleteShift') && !this.isShiftRunning;
      return (this.lineviewStation.showManualShift || isShiftDeletable) && !this.isMobileView;
    },
    isAdditionalFooterMenuDisabled() {
      if (this.shiftviewStationRoleAllows('deleteShift')) return this.isSelectionActive;
      return !this.isLastShiftSelected || this.isSelectionActive || this.isReadOnly;
    },
  },
  methods: {
    getOperatorName() {
      if (this.teamTimeline.length === 0) {
        return this.$t('Operators');
      }
      let operators;
      try {
        operators = this.getLastActiveTeam();
      } catch {
        operators = '';
      }
      return operators;
    },
    getLastActiveTeam() {
      let currentTeam = {};
      const currentTime = DateTime.now().setZone(this.lineviewStation.zoneId).toISO();
      if (currentTime >= this.shift.startTimeISO && currentTime <= this.shift.endTimeISO) {
        currentTeam = this.teamTimeline.find((team) => currentTime >= team.startTimeISO && currentTime <= team.endTimeISO);
      } else {
        currentTeam = this.teamTimeline.find((team) => team.endTimeISO === this.shift.endTimeISO);
      }
      if (currentTeam) {
        const operator = this.operatorsRealMap.get(currentTeam.operatorIds[0]);
        let operatorName = '';
        if (typeof operator !== 'undefined') {
          operatorName = operator.name;
        }
        this.lastTeamExists = true;
        return currentTeam.operatorIds.length > 1 ? `${operatorName} +${currentTeam.operatorIds.length - 1}` : `${operatorName}`;
      }
      this.lastTeamExists = false;
      return this.$t('Operators');
    },
  },
};
</script>

<style lang="less" scoped>
.shiftview-footer {
  left: 0px !important;
  width: 100% !important;

  &--disabled {
    cursor: not-allowed
  }
}
</style>
