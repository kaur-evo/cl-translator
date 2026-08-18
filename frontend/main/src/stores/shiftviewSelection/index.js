import { defineStore } from 'pinia';
import { findLast } from 'lodash';
import { DateTime } from 'luxon';

import i18n from '@/services/i18n';
import useProfileStore from '@/stores/profile';
import useGenericNotificationStore from '@/stores/genericNotification';
import useStationStore from '@/stores/station';
import useShiftviewTimelineStore from '@/stores/shiftviewTimeline';

const useShiftviewSelectionStore = defineStore('shiftviewSelection', {
  state: () => ({
    shiftviewSelectionType: null,
    bracketRange: {},
    hasSelectedEndChanged: false,
    clickSelectedSlices: {},
    selectedPinItems: [],
  }),
  actions: {
    clearSliceSelection() {
      this.shiftviewSelectionType = null;
      this.bracketRange = {};
      this.hasSelectedEndChanged = false;
      this.clickSelectedSlices = {};
    },
    async selectSlice(slice) {
      if (!slice) return;
      const profileStore = useProfileStore();
      if (profileStore.isReadOnly) {
        const genericNotificationStore = useGenericNotificationStore();
        genericNotificationStore.notifyError(i18n.global.t('You are in read-only mode'));
        return;
      }
      this.clearPinSelection();
      if (slice.parent?.type === 'SLOW' || slice.isYellowRange) this.selectYellowRange(slice);
      else if (slice.type === 'PRODUCT') this.selectProductSlice(slice);
      else this.selectStoppage(slice);
    },
    async selectProductSlice(slice) {
      const stationStore = useStationStore();
      const shiftviewTimelineStore = useShiftviewTimelineStore();

      const isDeselect = slice.id === this.bracketRange.id;
      await this.clearSliceSelection();
      if (isDeselect) return;
      const stationTimezone = stationStore.lineviewStation.zoneId;
      const selectedCircleBatch = shiftviewTimelineStore.batches.get(slice.batchId);
      const batchStartTm = DateTime.fromISO(selectedCircleBatch.startTimeISO, { zone: stationTimezone });
      const batchEndTm = DateTime.fromISO(selectedCircleBatch.endTimeISO, { zone: stationTimezone });
      const productSlices = shiftviewTimelineStore.slicesByType.products;
      const firstProductSlice = productSlices[0];
      const firstProductStartTm = DateTime.fromISO(firstProductSlice.sliceStartTmISO, { zone: stationTimezone });
      const lastProductSlice = productSlices[productSlices.length - 1];
      const bracketRangeStart = batchStartTm > firstProductStartTm ? batchStartTm : firstProductStartTm;
      const getLastSliceBeforeBatchEnd = () => findLast(productSlices, (circle) => DateTime.fromISO(circle.sliceEndTmISO) <= batchEndTm);
      const bracketRangeEnd = selectedCircleBatch.endTimeISO
        ? getLastSliceBeforeBatchEnd().sliceEndTmISO
        : lastProductSlice.sliceEndTmISO;

      let greenStart = slice.sliceStartTmISO;

      const startThreshold = 10;

      if (slice.yellowEnd && slice.yellowEnd !== slice.sliceEndTmISO) {
        greenStart = slice.yellowEnd;
      }
      if (slice.duration > startThreshold && !slice.yellowEnd) {
        greenStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: stationTimezone }).plus({ seconds: startThreshold }).toISO();
      }
      let greenEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: stationTimezone }).plus({ seconds: startThreshold }).toISO();
      if (shiftviewTimelineStore.timeline[slice.id + 1]?.duration <= startThreshold) {
        greenEnd = slice.sliceEndTmISO;
      }
      const range = {
        id: slice.id,
        startTime: bracketRangeStart.toISO(),
        endTime: DateTime.fromISO(bracketRangeEnd, { zone: stationTimezone }).plus({ seconds: startThreshold }).toISO(),
        selectedRange: [greenStart, greenEnd],
        type: slice.type,
      };
      this.setBracketRange(range);
    },
    async selectStoppage(slice) {
      const shiftviewTimelineStore = useShiftviewTimelineStore();

      if (this.shiftviewSelectionType && this.shiftviewSelectionType !== 'STOPPAGE') await this.clearSliceSelection();
      const joinIdNotIncludedInSelection = Object.values(this.clickSelectedSlices).every((selectedSlice) => selectedSlice.joinId !== slice.joinId);
      if (!slice.isPin && slice.joinId && joinIdNotIncludedInSelection) {
        const commentedSlices = slice.type === 'STANDBY' ? shiftviewTimelineStore.slicesByType.planned : shiftviewTimelineStore.slicesByType.commented;
        commentedSlices.forEach(async (commentedSlice) => {
          if (commentedSlice.joinId === slice.joinId) {
            await this.toggleSlice(commentedSlice);
          }
        });
      } else {
        await this.toggleSlice(slice);
      }
      let range = {};
      if (Object.keys(this.clickSelectedSlices).length === 0) {
        this.clearSliceSelection();
        return;
      }
      if (Object.keys(this.clickSelectedSlices).length === 1) {
        const selectedSlice = Object.values(this.clickSelectedSlices)[0];
        const { timeline } = shiftviewTimelineStore;
        const firstStoppage = timeline.find((el) => el.type !== 'PRODUCT');
        const lastStoppage = findLast(timeline, (el) => el.type !== 'PRODUCT');
        range = {
          id: selectedSlice.id,
          startTime: firstStoppage.sliceStartTmISO,
          endTime: lastStoppage.sliceEndTmISO,
          selectedRange: [selectedSlice.sliceStartTmISO, selectedSlice.sliceEndTmISO],
          type: selectedSlice.type,
        };
      } else {
        range = {
          type: 'STOPPAGE',
        };
      }
      this.setBracketRange(range);
    },
    toggleSlice(slice) {
      if (slice.id in this.clickSelectedSlices) delete this.clickSelectedSlices[slice.id];
      else this.clickSelectedSlices[slice.id] = slice;
      if (Object.keys(this.clickSelectedSlices).length === 0) this.shiftviewSelectionType = null;
    },
    async selectSliceOnLeft() {
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const newSlice = shiftviewTimelineStore.timeline[this.bracketSelectedSlices[0].id - 1];
      await this.clearSliceSelection();
      this.selectSlice(newSlice);
    },
    async selectSliceOnRight() {
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const newSlice = shiftviewTimelineStore.timeline[this.bracketSelectedSlices[0].id + 1];
      await this.clearSliceSelection();
      this.selectSlice(newSlice);
    },
    async selectYellowRange(selectedSlice) {
      const shiftviewTimelineStore = useShiftviewTimelineStore();

      const range = { type: 'SLOW' };
      if (selectedSlice.isYellowRange) {
        range.startTime = selectedSlice.yellowSlices[0].sliceStartTmISO;
        range.endTime = selectedSlice.yellowSlices[selectedSlice.yellowSlices.length - 1].yellowEnd;
        range.selectedRange = [range.startTime, range.endTime];
      } else {
        const { speedlossSlices } = shiftviewTimelineStore;

        const firstSliceOfBatch = speedlossSlices.find((s) => s.batchId === selectedSlice.parent.batchId);
        const lastSliceOfBatch = findLast(speedlossSlices, (s) => s.batchId === selectedSlice.parent.batchId);

        const yellowSlice = speedlossSlices.find((s) => s.sliceStartTmISO === selectedSlice.parent.sliceStartTmISO);
        const yellowRange = shiftviewTimelineStore.yellowRanges.find((r) => r.perfLossTimelineStart === yellowSlice.perfLossTimelineStart && r.batchId === yellowSlice.batchId);

        range.startTime = firstSliceOfBatch.sliceStartTmISO;
        range.endTime = lastSliceOfBatch.yellowEnd;
        range.selectedRange = [yellowRange.yellowSlices[0].sliceStartTmISO, yellowRange.yellowSlices[yellowRange.yellowSlices.length - 1].yellowEnd];
      }
      this.setBracketRange(range);
    },
    setBracketRange(range) {
      if (range.selectedRange && this.bracketRange.selectedRange && !DateTime.fromISO(this.bracketRange.selectedRange[1]).hasSame(DateTime.fromISO(range.selectedRange[1]), 'second')) {
        this.hasSelectedEndChanged = true;
      }
      this.bracketRange = range;
      const type = range.type === 'STOPPAGE' || range.type === 'STANDBY' ? 'STOPPAGE' : range.type;
      this.shiftviewSelectionType = type;
    },
    selectPin(pinItems) {
      this.selectedPinItems = pinItems;
      this.shiftviewSelectionType = 'pin';
    },
    clearPinSelection() {
      this.selectedPinItems = [];
      this.shiftviewSelectionType = null;
    },
  },
  getters: {
    firstSelectedSlice() {
      return this.sliceSelection.length ? this.sliceSelection[0] : {};
    },
    isSelectionActive: (state) => !!state.shiftviewSelectionType,
    bracketSelectedSlices() {
      const stationStore = useStationStore();
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const stationTimezone = stationStore.lineviewStation.zoneId;

      if (!this.bracketRange.selectedRange || this.bracketRange.selectedRange.length === 0) return [];
      const [bracketStart, bracketEnd] = this.bracketRange.selectedRange;
      const bracketStartTm = DateTime.fromISO(bracketStart, { zone: stationTimezone });
      const bracketEndTm = DateTime.fromISO(bracketEnd, { zone: stationTimezone });
      if (this.shiftviewSelectionType === 'SLOW') {
        return shiftviewTimelineStore.speedlossSlices.filter(
          (slice) => {
            const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: stationTimezone });
            const sliceEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: stationTimezone });
            return sliceEnd > bracketStartTm && sliceStart < bracketEndTm;
          },
        );
      }
      return shiftviewTimelineStore.timeline.filter((slice) => {
        const type = slice.type === 'PRODUCT' ? slice.type : 'STOPPAGE';
        const isSelectionType = type === this.shiftviewSelectionType;
        let isInBracketsRange = false;
        const sliceStart = DateTime.fromISO(slice.sliceStartTmISO, { zone: stationTimezone });
        const sliceEnd = DateTime.fromISO(slice.sliceEndTmISO, { zone: stationTimezone });
        if (type === 'PRODUCT') {
          isInBracketsRange = sliceEnd > bracketStartTm && sliceEnd <= bracketEndTm;
        } else {
          isInBracketsRange = sliceEnd > bracketStartTm && sliceStart < bracketEndTm;
        }
        return isSelectionType && isInBracketsRange;
      });
    },
    canMoveLeft() {
      return this.shiftviewSelectionType !== 'SLOW' && this.bracketSelectedSlices.length === 1 && this.firstSelectedSlice.id > 0;
    },
    canMoveRight() {
      if (this.bracketSelectedSlices.length > 1 || this.shiftviewSelectionType === 'SLOW') return false;
      const shiftviewTimelineStore = useShiftviewTimelineStore();
      const { timeline } = shiftviewTimelineStore;
      const selectedSliceIndex = this.firstSelectedSlice.id;
      if (selectedSliceIndex === timeline.length - 1) {
        return false;
      }
      return timeline[selectedSliceIndex + 1] && timeline[selectedSliceIndex + 1].batchId > 0;
    },
    sliceSelection() {
      if (this.bracketSelectedSlices.length) {
        return this.bracketSelectedSlices;
      }
      return [...Object.values(this.clickSelectedSlices)].sort(
        (a, b) => new Date(a.sliceStartTmISO) - new Date(b.sliceStartTmISO),
      );
    },
  },
});

export default useShiftviewSelectionStore;
