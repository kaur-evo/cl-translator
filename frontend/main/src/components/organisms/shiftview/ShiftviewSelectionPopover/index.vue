<template>
  <shiftview-popover
    v-if="isVisible && popoverTarget"
    ref="popover"
    :target-el="popoverTarget"
    :secondary-target-el="secondaryPopoverTarget"
    :are-arrows-enabled="arrowsVisible"
    :dot-color="dotColor"
    :can-move-left="canMoveLeft"
    :can-move-right="canMoveRight"
    :title="title"
    :title-class="sliceSelection.length === 0 && shiftviewSelectionType !== 'SLOW' ? 'text-secondary' : ''"
    :title-icon="areAllSlicesInSameJoin ? mdiLink : ''"
    :items="Object.values(items).filter((item) => item.isVisible)"
    :item-icon="(item) => item.icon"
    :item-icon-color="(item) => item.iconColor"
    :item-text="(item) => item.text"
    :disabled="disabled"
    @left-arrow-click="selectSliceOnLeft"
    @right-arrow-click="selectSliceOnRight"
    @item-click="(item) => item.action()"
    @outside-click="onOutsideClick"
  >
    <template #subtitle>
      <span>
        <span id="subtitle-time">{{ subtitleTime }}</span>
        <template v-if="subtitlePrimaryValue">
          (<span id="subtitle-primary-value">{{ subtitlePrimaryValue }}</span>
          <span
            v-if="subtitleSecondaryValue"
            id="subtitle-secondary-value"
            class="text-lw-orange"
          >+{{ subtitleSecondaryValue }}</span>)
        </template>
      </span>
    </template>
    <template
      v-if="isMobileView && (shiftviewSelectionType === 'SLOW' || isOnlyOneSliceSelected)"
      #events
    >
      <v-divider class="my-2 shiftview-popover-divider" />
      <div class="hide-scrollbar overflow-auto mx-n2">
        <div class="event-slices-row d-flex">
          <div
            v-for="(eventSlice, i) in eventSlices"
            :key="`event-slice-${i}`"
            class="event-chip"
            :class="{
              selected: isSliceSelected(eventSlice),
              downtime: eventSlice.type !== 'PRODUCT' && !eventSlice.isYellowRange,
              speedloss: eventSlice.isYellowRange,
              'ml-2': i === 0,
              'mr-2': i === timeline.length - 1,
            }"
            @click="onSliceClick(eventSlice)"
          >
            <div
              class="justify-center d-flex flex-wrap"
              :style="{ width: getEventDots(eventSlice).length > 1 ? '16px' : 'auto', 'margin-right': getEventDots(eventSlice).length > 0 ? '2px' : '0px' }"
            >
              <div
                v-for="dot in getEventDots(eventSlice)"
                :key="`dot-${dot}`"
                class="event-dot"
                :class="`event-dot--${dot}`"
              />
            </div>
            {{ getEventLabel(eventSlice) }}
          </div>
        </div>
      </div>
    </template>
  </shiftview-popover>
</template>

<script>
import {
  mdiSync, mdiMinusCircleOutline, mdiHelpCircleOutline, mdiSpeedometerSlow, mdiDeleteForever, mdiPlusCircleOutline, mdiPlaylistCheck, mdiLink,
} from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import {
  differenceInDays,
} from 'date-fns';
import { DateTime } from 'luxon';
import { nextTick } from 'vue';

import {
  useShiftviewSelectionStore,
  useShiftviewTimelineStore,
  useCommentStore,
  usePerfCommentStore,
  useStationStore,
  useProfileStore,
  useFeatureStore,
  useChecklistTemplateStore,
  useShiftStore,
  useGenericDialogStore,
  useDeviceStore,
  useUserPreferencesStore,
  useGenericNotificationStore,
  useConfirmDialogStore,
} from '@/stores/index';
import formatSecondsFriendly from '@/helpers/time/formatSecondsFriendly';
import shiftviewDialogs from '@/constants/dialogConfigs';
import { SHIFT_HISTORY_VISIBLE_DAYS } from '@/constants/shiftviewPinConstants';
import timelineApi from '@/api/timelineApi';
import ShiftviewPopover from '@/components/organisms/shiftview/ShiftviewPopover/index.vue';
import { formatNumber } from '@/helpers/numbers/formatNumber';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import editScrapDialogConfig from '@/constants/shiftviewDialogConfigs/editScrapDialogConfig';
import { getBatchMainToAltUnitConversion } from '@/helpers/batch/getBatchMainToAltUnitConversion';

const icons = {
  mdiSync, mdiMinusCircleOutline, mdiHelpCircleOutline, mdiSpeedometerSlow, mdiDeleteForever, mdiPlusCircleOutline, mdiPlaylistCheck, mdiLink,
};

export default {
  name: 'ShiftviewSelectionPopover',
  components: { ShiftviewPopover },
  data() {
    return {
      popoverTarget: null,
      secondaryPopoverTarget: null,
      ...icons,
    };
  },
  computed: {
    ...mapState(useShiftviewSelectionStore, ['bracketRange', 'shiftviewSelectionType', 'firstSelectedSlice', 'canMoveRight', 'canMoveLeft', 'sliceSelection']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'batches', 'yellowRanges']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    ...mapState(usePerfCommentStore, ['perfCommentsRealMap']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['shiftviewStationRoleAllows']),
    ...mapState(useFeatureStore, ['qualityYieldEnabled']),
    ...mapState(useChecklistTemplateStore, ['shiftviewStationManualTemplates']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useGenericDialogStore, ['isDialogOpened']),
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    arrowsVisible() {
      return this.isOnlyOneSliceSelected && this.shiftviewSelectionType !== 'SLOW';
    },
    selectedBatch() {
      return this.batches.get(this.firstSelectedSlice.batchId) || {};
    },
    useAltUnit() {
      return this.selectedBatch.alternativeUnitId && !this.viewSettings.usePrimaryUnit;
    },
    disabled() {
      return this.sliceSelection.length === 0 && this.shiftviewSelectionType !== 'SLOW';
    },
    isVisible() {
      return this.shiftviewSelectionType && this.shiftviewSelectionType !== 'pin' && !this.isDialogOpened;
    },
    isOnlyOneSliceSelected() {
      return this.sliceSelection.length === 1;
    },
    batchMainToAltUnitConversion() {
      return getBatchMainToAltUnitConversion(this.selectedBatch);
    },
    dotColor() {
      if (this.shiftviewSelectionType === 'SLOW') return 'lw-yellow';
      if (this.shiftviewSelectionType === 'STOPPAGE') return 'lw-red';
      if (this.shiftviewSelectionType === 'PRODUCT' && this.selectedSlicesSums.scrapQty > 0) return 'lw-orange';
      return 'quaternary-dark-2';
    },
    lastSelectedSlice() {
      return this.sliceSelection[this.sliceSelection.length - 1];
    },
    subtitleTime() {
      if (this.sliceSelection.length <= 1) {
        if (this.shiftviewSelectionType === 'PRODUCT' && this.firstSelectedSlice.sliceEndTmISO) {
          return formatTimeInZone(
            this.firstSelectedSlice.sliceEndTmISO,
            this.lineviewStation.zoneId,
            'long',
          );
        }
        return `${formatTimeInZone(
          this.bracketRange.selectedRange[0],
          this.lineviewStation.zoneId,
        )} - ${formatTimeInZone(
          this.bracketRange.selectedRange[1],
          this.lineviewStation.zoneId,
        )}`;
      }
      if (this.shiftviewSelectionType === 'PRODUCT') {
        return `${formatTimeInZone(
          this.firstSelectedSlice.sliceEndTmISO,
          this.lineviewStation.zoneId,
          'long',
        )
        } - ${formatTimeInZone(
          this.lastSelectedSlice.sliceEndTmISO,
          this.lineviewStation.zoneId,
          'long',
        )
        }`;
      }
      if (this.bracketRange.selectedRange) {
        return `${formatTimeInZone(this.bracketRange.selectedRange[0], this.lineviewStation.zoneId)} - ${formatTimeInZone(this.bracketRange.selectedRange[1], this.lineviewStation.zoneId)}`;
      }
      return `${formatTimeInZone(this.firstSelectedSlice.sliceStartTmISO, this.lineviewStation.zoneId)} - ${formatTimeInZone(this.lastSelectedSlice.sliceEndTmISO, this.lineviewStation.zoneId)}`;
    },
    subtitlePrimaryValue() {
      if (this.sliceSelection.length === 0 && this.shiftviewSelectionType !== 'SLOW') return '';
      if (this.shiftviewSelectionType === 'PRODUCT') {
        let qtyString = this.useAltUnit
          ? formatNumber(this.selectedSlicesSums.goodQty * this.batchMainToAltUnitConversion)
          : formatNumber(this.selectedSlicesSums.goodQty);
        if (this.selectedSlicesSums.scrapQty === 0) {
          if (this.useAltUnit) qtyString += ` ${this.selectedBatch.alternativeUnitId}`;
          else qtyString += ` ${this.selectedBatch.unitId}`;
        }
        return qtyString;
      }
      if (this.shiftviewSelectionType === 'SLOW') return formatSecondsFriendly(this.speedLossDurationInSeconds, false);
      return formatSecondsFriendly(this.selectedSlicesSums.duration, false);
    },
    subtitleSecondaryValue() {
      if (this.selectedSlicesSums.scrapQty) {
        if (this.useAltUnit) return `${formatNumber(this.selectedSlicesSums.scrapQty * this.batchMainToAltUnitConversion)}${this.selectedBatch.alternativeUnitId}`;
        return `${formatNumber(this.selectedSlicesSums.scrapQty)}${this.selectedBatch.unitId}`;
      }
      return '';
    },
    selectedSlicesCommentIds() {
      return [...new Set(this.sliceSelection.map((slice) => slice.commentId))];
    },
    selectedLossesCommentIds() {
      return [...new Set(this.sliceSelection.map((slice) => slice.perfLossCommentId))];
    },
    areAllSlicesInSameJoin() {
      if (this.selectedSlicesCommentIds.length === 1) {
        const joinIds = new Set();
        let hasNullJoinId = false;
        this.sliceSelection.forEach((slice) => {
          if (slice.joinId) joinIds.add(slice.joinId);
          else hasNullJoinId = true;
        });
        return !hasNullJoinId && joinIds.size === 1;
      }
      return false;
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    title() {
      const selectedSlicesCount = this.sliceSelection.length;
      if (this.shiftviewSelectionType === 'SLOW') {
        if (this.selectedLossesCommentIds.length > 1) {
          return `${this.$t('Speed loss')} (${selectedSlicesCount})`;
        }
        const perfCommentName = this.selectedLossesCommentIds[0] === 0 ? this.$t('Uncommented') : this.perfCommentsRealMap.get(this.selectedLossesCommentIds[0])?.name;
        return selectedSlicesCount > 1 ? `${perfCommentName} (${selectedSlicesCount})` : perfCommentName;
      }
      if (selectedSlicesCount === 0) {
        const typeString = (this.shiftviewSelectionType === 'PRODUCT' ? this.$t('Production signal') : this.$t('Downtime')).toLowerCase();
        return `${this.$t('This area does not include selected event ({variable})', { variable: typeString })}`;
      }
      if (this.shiftviewSelectionType === 'PRODUCT') {
        let title = this.selectedBatch.productName;
        if (this.selectedBatch.productSku) title += ` (${this.selectedBatch.productSku})`;
        return title;
      }
      if (this.selectedSlicesCommentIds.length > 1) {
        return `${this.$t('Downtime')} (${selectedSlicesCount})`;
      }
      const commentName = this.selectedSlicesCommentIds[0] === 0 ? this.$t('Uncommented') : this.commentsRealMap.get(this.selectedSlicesCommentIds[0])?.name;
      return selectedSlicesCount > 1 ? `${commentName} (${selectedSlicesCount})` : commentName;
    },
    isDeleteSignalEnabled() {
      const isChangeover = this.sliceSelection.some((slice) => slice.isProductChange);
      if (isChangeover) return false;
      const isAllowed = this.lineviewStation.deleteSliceAllowed || this.shiftviewStationRoleAllows('editSignal');
      return isAllowed && this.shiftviewSelectionType === 'PRODUCT';
    },
    isSignalEditEnabled() {
      if (this.shiftviewSelectionType === 'STOPPAGE' && this.lineviewStation.timeModeActive) return !this.isReadOnly;
      const isAllowed = this.shiftviewStationRoleAllows('editSignal');
      if (!isAllowed && this.shiftviewSelectionType !== 'PRODUCT') return false;
      return this.sliceSelection.length === 1;
    },
    signalEditText() {
      if (this.shiftviewSelectionType === 'PRODUCT') return this.$t('Edit signal');
      if (this.lineviewStation.timeModeActive) return this.$t('Change to production');
      return this.$t('Add signal');
    },
    availableChecklists() {
      const { batchId } = this.sliceSelection[0];
      const productId = this.batches.get(batchId)?.productId;
      if (!productId) return [];
      return this.shiftviewStationManualTemplates.filter((template) => template.frequency.productIds.length === 0 || template.frequency.productIds.includes(productId));
    },
    isManualChecklistEnabled() {
      const isOneSliceSelected = this.sliceSelection.length === 1;
      if (!isOneSliceSelected) return false;
      if (this.availableChecklists.length === 0) return false;
      if (this.isReadOnly) return false;
      const diffInDays = differenceInDays(new Date(), new Date(this.shift.endTime));
      return diffInDays <= SHIFT_HISTORY_VISIBLE_DAYS;
    },
    items() {
      return {
        downtime: {
          isVisible: this.shiftviewSelectionType === 'STOPPAGE',
          icon: mdiHelpCircleOutline,
          iconColor: 'lw-red',
          text: this.selectedSlicesCommentIds.includes(0) ? this.$t('Add reason') : this.$t('Edit reason'),
          action: this.openCommentDownTimeDialog,
          saveOnEnter: false,
        },
        changeover: {
          isVisible: this.shiftviewSelectionType !== 'SLOW' && this.sliceSelection.length <= 1,
          icon: mdiSync,
          iconColor: 'lw-blue',
          text: this.firstSelectedSlice.isProductChange ? this.$t('Edit changeover') : this.$t('Add changeover'),
          action: this.openChangeoverDialog,
        },
        scrap: {
          isVisible: this.shiftviewSelectionType === 'PRODUCT' && !this.qualityYieldEnabled,
          icon: mdiMinusCircleOutline,
          iconColor: 'lw-orange',
          text: this.sliceSelection.some((slice) => slice.scrapQty === 0) ? this.$t('Add scrap') : this.$t('Edit scrap'),
          action: this.openScrapDialog,
        },
        speedloss: {
          isVisible: this.shiftviewSelectionType === 'SLOW',
          icon: mdiSpeedometerSlow,
          iconColor: 'lw-yellow',
          text: this.selectedLossesCommentIds.includes(0) ? this.$t('Add reason') : this.$t('Edit reason'),
          action: this.openSpeedlossDialog,
          saveOnEnter: false,
        },
        signalEdit: {
          isVisible: this.isSignalEditEnabled,
          icon: mdiPlusCircleOutline,
          iconColor: '',
          text: this.signalEditText,
          action: this.openSignalEditDialog,
        },
        signalDelete: {
          isVisible: this.isDeleteSignalEnabled,
          icon: mdiDeleteForever,
          iconColor: '',
          text: this.sliceSelection.length > 1 ? this.$t('Delete signals') : this.$t('Delete signal'),
          action: this.deleteSignals,
        },
        manualChecklist: {
          isVisible: this.isManualChecklistEnabled,
          icon: mdiPlaylistCheck,
          text: this.$t('Start checklist'),
          action: this.startManualChecklist,
        },
      };
    },
    selectedSlicesSums() {
      const bracketStart = this.bracketRange.selectedRange && DateTime.fromISO(this.bracketRange.selectedRange[0], { zone: this.lineviewStation.zoneId });
      const bracketEnd = this.bracketRange.selectedRange && DateTime.fromISO(this.bracketRange.selectedRange[1], { zone: this.lineviewStation.zoneId });
      return this.sliceSelection.reduce((acc, slice) => {
        let sliceDuration = slice.duration;
        if (this.shiftviewSelectionType === 'STOPPAGE' && this.bracketRange.selectedRange) {
          const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
          const sliceEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: this.lineviewStation.zoneId });
          const start = sliceStart > bracketStart ? sliceStart : bracketStart;
          const end = sliceEnd < bracketEnd ? sliceEnd : bracketEnd;
          sliceDuration = end.diff(start, 'seconds').toObject().seconds;
        }
        const { quantity = 0, scrapQty = 0 } = slice;
        return {
          quantity: acc.quantity + quantity,
          scrapQty: acc.scrapQty + scrapQty,
          goodQty: acc.goodQty + (quantity - scrapQty),
          duration: acc.duration + sliceDuration,
        };
      }, {
        quantity: 0, scrapQty: 0, goodQty: 0, duration: 0,
      });
    },
    speedLossDurationInSeconds() {
      return this.sliceSelection.reduce((acc, slice) => {
        const ret = acc + slice.yellowDuration;
        return ret;
      }, 0);
    },
    eventSlices() {
      const yellows = this.yellowRanges.map((range) => ({
        ...range,
        isYellowRange: true,
        sliceStartTmISO: range.yellowSlices[0].sliceStartTmISO,
        end: range.yellowSlices[range.yellowSlices.length - 1].yellowEnd,
      }));
      return [...this.timeline, ...yellows].sort((a, b) => (a.sliceStartTmISO > b.sliceStartTmISO ? 1 : -1));
    },
  },
  watch: {
    async sliceSelection(newVal, oldVal) {
      await nextTick();
      this.setPopoverTarget();
      if (newVal.length === 1 && newVal[0].id !== oldVal[0]?.id) this.setScrollPosition();
    },
  },
  beforeUnmount() {
    this.popoverTarget = null;
    this.secondaryPopoverTarget = null;
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useShiftviewSelectionStore, ['clearSliceSelection', 'selectSliceOnLeft', 'selectSliceOnRight', 'selectSlice']),
    ...mapActions(useGenericNotificationStore, ['notifySuccess', 'notifyError']),
    ...mapActions(useConfirmDialogStore, ['openConfirmDialog']),
    openCommentDownTimeDialog() {
      this.openDialog(shiftviewDialogs.COMMENT_DOWNTIME);
    },
    openChangeoverDialog() {
      this.openDialog(shiftviewDialogs.CHANGEOVER);
    },
    openScrapDialog() {
      this.openDialog(editScrapDialogConfig);
    },
    openSpeedlossDialog() {
      this.openDialog(shiftviewDialogs.COMMENT_SPEED_LOSS);
    },
    openSignalEditDialog() {
      this.openDialog(shiftviewDialogs.SIGNAL_EDIT);
    },
    deleteSignals() {
      const singleSignal = this.sliceSelection.length === 1;
      const confirmDialogConfig = {
        title: this.$t('Confirmation'),
        text: singleSignal ? this.$t('Are you sure you want to delete this production signal?') : this.$t('Are you sure you want to delete these production signals?'),
        action: async () => {
          const requestResponse = await timelineApi.deleteProductionSignals(this.lineviewStation.id, this.sliceSelection.map((slice) => slice.sliceEndTmISO));
          if (requestResponse[0].success) {
            this.notifySuccess(singleSignal ? this.$t('Production signal deleted') : this.$t('Production signals deleted'));
            this.clearSliceSelection();
          } else {
            this.notifyError(requestResponse[0].message);
          }
        },
        confirmText: this.$t('Delete'),
        cancelText: this.$t('Cancel'),
      };
      this.openConfirmDialog(confirmDialogConfig);
    },
    startManualChecklist() {
      let checkTime = this.bracketRange.selectedRange[1];
      if (this.shiftviewSelectionType === 'PRODUCT') {
        checkTime = this.firstSelectedSlice.sliceEndTmISO;
      }
      this.openDialog({
        ...shiftviewDialogs.MANUAL_CHECKLIST,
        data: {
          templates: this.availableChecklists,
          time: checkTime,
        },
      });
    },
    setPopoverTarget() {
      if (this.bracketRange.selectedRange) {
        this.popoverTarget = document.getElementById('left-bracket');
        this.secondaryPopoverTarget = document.getElementById('right-bracket');
      } else if (this.lastSelectedSlice) {
        this.popoverTarget = document.getElementById(`comment-slice-${this.lastSelectedSlice.id}`);
        this.secondaryPopoverTarget = null;
      } else {
        this.popoverTarget = null;
        this.secondaryPopoverTarget = null;
      }
    },
    onOutsideClick(event) {
      const isStoppageSelection = this.shiftviewSelectionType === 'STOPPAGE';
      const isStoppageClicked = event.target.id.includes('comment-slice-') || event.target.classList.contains('comment-text');
      const isMultiCommentSelection = isStoppageSelection && isStoppageClicked;
      if (this.isVisible && !isMultiCommentSelection) this.clearSliceSelection();
    },
    getEventLabel(slice) {
      if (slice.isYellowRange) return `${formatTimeInZone(slice.sliceStartTmISO, this.lineviewStation.zoneId)} - ${formatTimeInZone(slice.end, this.lineviewStation.zoneId)}`;
      if (slice.type === 'PRODUCT') return formatTimeInZone(slice.sliceEndTmISO, this.lineviewStation.zoneId, 'long');
      return `${formatTimeInZone(slice.sliceStartTmISO, this.lineviewStation.zoneId)} - ${formatTimeInZone(slice.sliceEndTmISO, this.lineviewStation.zoneId)}`;
    },
    getEventDots(slice) {
      const dots = [];
      if (slice.isProductChange) dots.push('changeover');
      if (slice.scrapQty > 0) dots.push('scrap');
      if (slice.type !== 'PRODUCT' && !slice.isYellowRange) dots.push('downtime');
      if (slice.signalNotes?.length) dots.push('signal');
      if (slice.isYellowRange) dots.push('speedloss');
      return dots;
    },
    async onSliceClick(slice) {
      await this.clearSliceSelection();
      this.selectSlice(slice);
    },
    async setScrollPosition() {
      if (!this.isMobileView) return;
      await nextTick();
      const selectedChip = document.getElementsByClassName('event-chip selected')[0];
      if (selectedChip) selectedChip.scrollIntoView({ behavior: 'instant', inline: 'center' });
    },
    isSliceSelected(slice) {
      if (this.shiftviewSelectionType === 'SLOW' && slice.isYellowRange) {
        const rangeStart = DateTime.fromISO(this.bracketRange.selectedRange[0], { zone: this.lineviewStation.zoneId });
        const rangeEnd = DateTime.fromISO(this.bracketRange.selectedRange[1], { zone: this.lineviewStation.zoneId });
        const sliceStart = DateTime.fromISO(slice.start, { zone: this.lineviewStation.zoneId });
        const sliceEnd = DateTime.fromISO(slice.end, { zone: this.lineviewStation.zoneId });
        const startWithinRange = rangeStart <= sliceStart && sliceStart <= rangeEnd;
        const endWithinRange = rangeStart <= sliceEnd && sliceEnd <= rangeEnd;
        return startWithinRange && endWithinRange;
      }
      return this.shiftviewSelectionType !== 'SLOW' && slice.id === this.firstSelectedSlice.id;
    },
  },
};
</script>

<style lang="less" scoped>
.event-slices-row {
  &::before {
    content: "";
    display: block;
    position: absolute;
    height: 28px;
    width: 12px;
    background: linear-gradient(90deg, #212121 27.08%, rgba(33, 33, 33, 0) 100%);
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    height: 28px;
    width: 12px;
    right: 0;
    margin-right: 4px;
    background: linear-gradient(90deg, #212121 27.08%, rgba(33, 33, 33, 0) 100%);
    transform: rotate(-180deg);
  }
}

.event-chip {
  cursor: pointer;
  background: var(--color-12-light);
  border-radius: 16px;
  padding: 4px 10px;
  font-size: 12px;
  white-space: nowrap;
  margin-right: 4px;
  display: flex;
  align-items: center;

  &.downtime {
    background: var(--color-12-error);
  }

  &.speedloss {
    background: rgba(var(--v-theme-lw-yellow), 0.12)
  }

  &.selected {
    background: var(--color-12-primary);
    border: 1px rgb(var(--v-theme-primary)) solid;
  }
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  margin: 1px 2px;

  &--changeover {
    background: rgb(var(--v-theme-lw-blue));
  }
  &--scrap {
    background: rgb(var(--v-theme-lw-orange));
  }
  &--downtime {
    background: rgb(var(--v-theme-lw-red));
  }
  &--speedloss {
    background: rgb(var(--v-theme-lw-yellow));
  }
  &--signal {
    background: rgb(var(--v-theme-quaternary-dark));
  }
}

.hide-scrollbar {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
