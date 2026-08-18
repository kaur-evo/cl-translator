<template>
  <div
    ref="icon-layer"
    class="timeline-icons-layer"
    @mounted="changeYValue"
  >
    <div
      v-for="(shiftHour, j) in shiftHours"
      :key="`icons-hour-${j}`"
      class="shift-hour-row"
    >
      <svg
        v-for="(icons, timeStamp) in groupedIcons[shiftHour.dateTime]"
        :key="`icon-${timeStamp}`"
        class="timeline-icon"
        :class="timelineIconClass(icons)"
        :style="{ left: getTimeXPosition(timeStamp), 'z-index': hoveredPinTimeStamp === timeStamp ? 2 : 1 }"
        @click.stop="clickIcon($event, icons)"
        @mouseenter="onPinHover($event, icons, timeStamp)"
        @mouseleave="onPinHover(null)"
      >
        <svg
          width="100%"
          :height="yValue"
        >
          <path
            :d="getPinPath()"
            :fill="getIconColor(icons)"
            stroke="white"
            stroke-width="2"
          />
          <path
            v-if="hoveredPinTimeStamp === timeStamp"
            :d="getPinPath()"
            stroke="white"
            stroke-width="2"
            fill="black"
            fill-opacity="0.28"
          />
          <path
            v-if="icons.length === 1"
            :d="getIcon(icons[0])"
            fill="white"
            class="pin-icon"
          />
          <text
            v-else
            fill="white"
            :x="icons.length < 10 ? 10 : 4"
            y="19"
            :class="`pin-text pin-text-${icons.length < 10 ? '1' : '2'}`"
            font-family="Open Sans, sans-serif"
          >
            {{ icons.length }}
          </text>
          <template v-if="appendIcon = getAppendIcon(icons)">
            <svg
              v-if="appendIcon"
              class="pin-append"
              :width="appendSize"
              :height="appendSize"
              viewBox="0 0 22 22"
            >
              <rect
                x="1"
                y="1"
                :width="18"
                :height="18"
                :fill="getIconColor(icons)"
                stroke="white"
                stroke-width="2"
                rx="3"
                ry="3"
              />
              <path
                :d="appendIcon"
                class="pin-append__icon"
                fill="white"
              />
            </svg>
          </template>
          <svg class="pin-leg-parts">
            <path
              d="M11 32.5C11 27 6 23 4 21L11 23V32.5Z"
              fill="white"
              class="pin-leg"
            />
            <path
              d="M13 32.5C13 27 18 23 20 21L13 23V32.5Z"
              fill="white"
              class="pin-leg"
            />
            <line
              :x1="pinRadius + 1"
              :y1="pinRadius * 2 + 2"
              :x2="pinRadius + 1"
              :y2="yValue"
              stroke="white"
              stroke-width="2"
            />
          </svg>
        </svg>
      </svg>
    </div>
    <shiftview-pin-popover
      v-if="selectedPinItems.length"
      id="pin-popover"
      :items="selectedPinItems"
      :target-el="popoverTarget"
      @close="onPopoverClose"
    />
    <v-tooltip
      :key="`icon-${hoveredPinTimeStamp}-tooltip`"
      v-model="tooltipVisible"
      location="top"
      :disabled="isSelectionActive"
      color="black"
      :target="[x, y]"
      location-strategy="connected"
    >
      <evocon-v-tooltip
        v-if="hoveredIcons.length > 1"
        :type="formatTimeInZone(hoveredIcons[0].time, lineviewStation.zoneId)"
        :title="`${$t('Multiple events')} (${hoveredIcons.length})`"
        :icon-color="getIconColor(hoveredIcons)"
      />
      <shiftview-pin-tooltip v-else :item="hoveredIcons[0]" />
    </v-tooltip>
  </div>
</template>
<script>
/* eslint-disable no-magic-numbers */
import { mapState, mapActions } from 'pinia';
import {
  mdiPlaylistCheck, mdiAutorenew, mdiAccount, mdiFlagCheckered, mdiImageOutline,
} from '@mdi/js';
import { DateTime } from 'luxon';

import {
  useProfileStore, useShiftStore, useShiftviewTimelineStore, useShiftviewSelectionStore,
  useChecklistTaskStore, useStationStore, useDeviceStore, useUserPreferencesStore,
  useGenericDialogStore, useGenericNotificationStore,
} from '@/stores/index';
import shiftviewDialogs from '@/constants/dialogConfigs';
import checklistEditDialogConfig from '@/constants/shiftviewDialogConfigs/checklistEditDialogConfig';
import EvoconVTooltip from '@/components/atoms/EvoconVTooltip/index.vue';
import ShiftviewPinTooltip from '@/components/organisms/shiftview/PinTooltip/index.vue';
import { checklistStatuses } from '@/constants/checklistsConstants';
import colorConstants from '@/constants/colorConstants';
import ShiftviewPinPopover from '@/components/organisms/shiftview/ShiftviewPinPopover/index.vue';
import { pinTypes } from '@/constants/shiftviewPinConstants';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import { getSecondsFromHourStart } from '@/helpers/timelineUtils';
import { getThrottleToFrame } from '@/helpers/throttle';
import { eventBus } from '@/eventBus';
import filterVisibleChecklists from '@/helpers/checklist/filterVisibleChecklists';
import i18n from '@/services/i18n';

export default {
  name: 'TimelineIconsLayer',
  components: {
    EvoconVTooltip,
    ShiftviewPinPopover,
    ShiftviewPinTooltip,
  },
  props: {
    shiftHours: { type: Array, default: () => [] },
    changeovers: { type: Array, default: () => [] },
    requireOperator: { type: Boolean },
    hourLineHeight: { type: Number, default: 0 },
  },
  data() {
    return {
      yValue: 0,
      popoverTarget: null,
      hoveredPinTimeStamp: null,
      isMounted: false,
      tooltipVisible: false,
      x: 0,
      y: 0,
      hoveredIcons: [],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useShiftStore, ['shift']),
    ...mapState(useShiftviewTimelineStore, ['teamTimeline', 'batchTargetFlags']),
    ...mapState(useShiftviewSelectionStore, ['isSelectionActive', 'selectedPinItems']),
    ...mapState(useChecklistTaskStore, ['checklistTasks']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useDeviceStore, ['screenWidth']),
    ...mapState(useUserPreferencesStore, ['viewSettings']),
    minIconDistance() {
      return this.$vuetify.display.mdAndUp ? 9 : 30;
    },
    allIcons() {
      const iconsArray = [...this.getChangeOverIcons(), ...this.getTeamIcons(), ...this.batchTargetFlags];
      if (!this.viewSettings.hideChecklists) iconsArray.push(...this.getChecklistIcons());
      return iconsArray.sort((a, b) => (a.time > b.time ? 1 : -1));
    },
    groupedIcons() {
      if (!this.isMounted) return {};
      let lastTimeStamp;
      let isLastChangeover = false;
      const result = this.allIcons.reduce((acc, icon) => {
        const iconTime = DateTime.fromISO(icon.time, { zone: this.lineviewStation.zoneId });
        const hour = iconTime.startOf('hour').toISO();
        const lastTimeStampTime = DateTime.fromISO(lastTimeStamp, { zone: this.lineviewStation.zoneId });
        const hourValues = acc[hour];
        if (!hourValues) { // first item of hour
          lastTimeStamp = icon.time;
          acc[hour] = { [icon.time]: [icon] };
          isLastChangeover = icon.type === pinTypes.CHANGEOVER;
        } else if (lastTimeStamp && lastTimeStampTime.hour === iconTime.hour && this.getDistanceInPx(lastTimeStampTime, iconTime) <= this.minIconDistance) {
          // icons are too close to each other
          if (icon.type === pinTypes.CHANGEOVER && !isLastChangeover) { // stack items to changeover
            const prevItems = acc[hour][lastTimeStamp];
            delete acc[hour][lastTimeStamp];
            acc[hour][icon.time] = [...prevItems, icon];
            lastTimeStamp = icon.time;
            isLastChangeover = true;
          } else { // stack to the first item
            acc[hour][lastTimeStamp].push(icon);
          }
        } else {
          lastTimeStamp = icon.time;
          acc[hour][icon.time] = [icon];
          isLastChangeover = icon.type === pinTypes.CHANGEOVER;
        }
        return acc;
      }, {});
      return result;
    },
    pinRadius() {
      if (this.$vuetify.display.xs) return 10;
      if (this.screenWidth >= 3840) return 16;
      return 13;
    },
    appendSize() {
      if (this.$vuetify.display.xs) return 9;
      if (this.screenWidth >= 3840) return 14;
      return 12;
    },
  },
  watch: {
    shift() {
      this.changeYValue();
      this.clearPinSelection();
    },
    shiftHours() {
      this.changeYValue();
    },
    batchTargetFlags(val, prevVal) {
      if (val.length > prevVal.length) eventBus.$emit('batch-target-reached');
    },
  },
  created() {
    this.throttleToFrame = getThrottleToFrame();
  },
  mounted() {
    this.isMounted = true;
    globalThis.addEventListener('resize', this.changeYValue);
    this.changeYValue();
  },
  unmounted() {
    globalThis.removeEventListener('resize', this.changeYValue);
    this.popoverTarget = null;
  },
  updated() {
    if (this.popoverTarget && !document.body.contains(this.popoverTarget)) {
      this.onPopoverClose();
    }
  },
  methods: {
    formatTimeInZone,
    ...mapActions(useGenericDialogStore, ['openDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyError', 'notifyWarning']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice', 'clearSliceSelection', 'selectPin', 'clearPinSelection']),
    requestOperator() {
      this.openDialog(editTeamDialogConfig);
      this.notifyWarning({ text: i18n.global.t('Please select team first') });
    },
    onPopoverClose() {
      this.popoverTarget = null;
      this.clearPinSelection();
    },
    changeYValue() {
      this.yValue = document.getElementsByClassName('delay-row')[0] ? document.getElementsByClassName('delay-row')[0].getBoundingClientRect().height : 0;
    },
    clickChangeover(changeover) {
      this.selectSlice({ ...changeover, isPin: true });
      this.openDialog(shiftviewDialogs.CHANGEOVER);
    },
    clickIcon(event, iconArray) {
      if (this.isReadOnly && iconArray.every((icon) => icon.type !== pinTypes.CHECK)) {
        this.notifyError(this.$t('You are in read-only mode'));
        return;
      }
      if (this.requireOperator) {
        this.requestOperator();
        return;
      }
      this.clearSliceSelection();
      if (iconArray.length > 1) {
        this.popoverTarget = event.target.closest('.timeline-icon');
        this.selectPin(iconArray);
      } else {
        const icon = iconArray[0];
        switch (icon.type) {
          case pinTypes.CHANGEOVER:
            this.clickChangeover(icon.slice);
            break;
          case pinTypes.TEAM:
            this.openDialog({ ...editTeamDialogConfig, data: icon.team });
            break;
          case pinTypes.CHECK:
            this.openDialog({ ...checklistEditDialogConfig, data: { item: icon.check } });
            break;
          default:
            break;
        }
      }
    },
    getDistanceInPx(time1, time2) {
      const layerWidth = this.$refs['icon-layer']?.getBoundingClientRect().width || 0;
      const widthOfSec = layerWidth / 3600;
      const diff = Math.abs(time2.diff(time1, 'seconds').toObject().seconds);
      return widthOfSec * diff;
    },
    getTimeXPosition(timeString) {
      return `${getSecondsFromHourStart(timeString, this.lineviewStation.zoneId) / 36}%`;
    },
    getIconColor(icons) {
      if (icons.every((pin) => pin.type === pinTypes.TEAM || (pin.type === pinTypes.CHECK && pin.check.status === checklistStatuses.SUCCESSFUL))) return colorConstants.dark.primary;
      if (icons.every((pin) => pin.type === pinTypes.CHECK && pin.check.status === checklistStatuses.NEW)) return colorConstants.dark['lw-gray'];
      if (icons.every((pin) => pin.type === pinTypes.CHECK && pin.check.status === checklistStatuses.UNSUCCESSFUL)) return colorConstants.dark['lw-orange'];
      if (icons.every((pin) => pin.type === pinTypes.CHANGEOVER || pin.type === pinTypes.BATCH_TARGET_REACHED)) return colorConstants.dark['lw-blue'];
      if (icons.some((pin) => pin.type === pinTypes.CHECK && pin.check.status === checklistStatuses.MISSED)) return colorConstants.dark['lw-red'];
      return colorConstants.dark['lw-purple'];
    },
    getChangeOverIcons() {
      const ret = this.changeovers.reduce((changeovers, changeover) => {
        let time = DateTime.fromISO(changeover.sliceStartTmISO, { zone: this.lineviewStation.zoneId });
        if (changeover.duration >= 20) {
          time = time.plus({ seconds: 10 });
        }
        changeovers.push({
          type: pinTypes.CHANGEOVER,
          slice: changeover,
          time: time.toISO(),
        });
        return changeovers;
      }, []);
      return ret;
    },
    getTeamIcons() {
      return this.teamTimeline.reduce((teams, team, i) => {
        teams.push({ type: pinTypes.TEAM, team: { ...team, order: i }, time: team.startTimeISO });
        return teams;
      }, []);
    },
    getChecklistIcons() {
      if (!this.checklistTasks) return [];
      if (!this.lineviewStation?.id) return [];

      try {
        const filteredTasks = filterVisibleChecklists(
          this.checklistTasks,
          this.viewSettings.visibleChecklistIdsByStation,
          this.lineviewStation.id,
        );
        return filteredTasks.reduce((checklists, checklist) => {
          let checkTime = DateTime.fromISO(checklist.dateTimeISO, { zone: this.lineviewStation.zoneId });
          const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });
          if (checkTime.diff(shiftEnd, 'seconds').toObject().seconds === 0) checkTime = checkTime.minus({ seconds: 1 });
          checklists.push({
            type: pinTypes.CHECK,
            check: {
              ...checklist,
              dateTimeISO: checkTime.toISO(),
            },
            time: checkTime.toISO(),
          });
          return checklists;
        }, []);
      } catch (error) {
        console.error('Error building checklist icons:', error);
        return [];
      }
    },
    getIcon(pin) {
      if (pin.type === pinTypes.CHECK) return mdiPlaylistCheck;
      if (pin.type === pinTypes.CHANGEOVER) return mdiAutorenew;
      if (pin.type === pinTypes.TEAM) return mdiAccount;
      if (pin.type === pinTypes.BATCH_TARGET_REACHED) return mdiFlagCheckered;
      return '';
    },
    getPinPath() {
      const radius = this.pinRadius;
      return `M ${radius + 1}, ${radius + 3} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${2 * radius},0 a ${radius},${radius} 0 1,0 -${2 * radius},0`;
    },
    onPinHover(event, pins, timestamp) {
      this.throttleToFrame(() => {
        if (event) {
          this.x = event.clientX;
          this.y = event.clientY;
          this.tooltipVisible = true;
          this.hoveredPinTimeStamp = timestamp;
          this.hoveredIcons = pins;
          if (pins.length === 1 && pins[0].type === pinTypes.CHANGEOVER) {
            eventBus.$emit('changeover-hover', pins[0].slice.batchId);
          }
        } else {
          this.hoveredPinTimeStamp = null;
          this.x = 0;
          this.y = 0;
          this.tooltipVisible = false;
          this.hoveredIcons = [];
          eventBus.$emit('changeover-hover', null);
        }
      });
    },
    timelineIconClass(pins) {
      const classNames = [];
      if (this.$vuetify.display.xs) classNames.push('timeline-icon--small');
      if (this.screenWidth >= 3840) classNames.push('timeline-icon--large');
      if (this.hourLineHeight < 40) classNames.push('timeline-icon--without-leg');
      if (this.isPinClickDisabled(pins)) classNames.push('click-disabled');
      return classNames.concat(' ');
    },
    isPinClickDisabled(pins) {
      if (pins.length !== 1) return false;
      return pins[0].type === pinTypes.BATCH_TARGET_REACHED;
    },
    getAppendIcon(icons) {
      const hasImg = icons.some((icon) => icon.type === pinTypes.CHECK && icon.check.fileCount > 0);
      if (hasImg) return mdiImageOutline;
      return '';
    },
  },
};
</script>
<style lang="less" scoped>
.timeline-icons-layer {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .shift-hour-row {
    flex: 1;
    position: relative;
  }
}

.timeline-icon {
  &:not(.click-disabled) {
    cursor: pointer;
  }
  pointer-events: all;
  position: absolute;
  width: 32px;
  height: 90%;
  transform: translateX(-14px);
  z-index: 1;

  .pin-text {
    font-size: 14px;
    transform: translate(0px, 2px);
  }

  .pin-text-2 {
    transform: translate(2px, 2px);
  }

  .pin-leg {
    transform: translate(2px, 6px);
  }

  .pin-icon {
    transform: translate(2px, 4px);
  }

  .pin-append {
    transform: translate(20px, 2px);
  }

  .pin-append__icon {
    transform: translate(-2px, -2px);
  }

  &--without-leg {
    top: calc(5% + 4px);

    .pin-leg-parts {
      display: none;
    }
  }

  &--small {
    width: 24px;
    transform: translateX(-12px);

    .pin-leg {
      transform: translate(-1px, 0px);
    }

    .pin-icon {
      transform: scale(0.7) translate(4px, 7px);
    }

    .pin-text {
      font-size: 12px;
    }

    .pin-text-1 {
      transform: translate(-3px, -2px);
    }

    .pin-text-2 {
      transform: translate(0px, -2px);
    }

    .pin-append {
      transform: translate(15px, 2px);
    }
  }

  &--large {
    width: 38px;
    transform: translateX(-18px);

    .pin-leg {
      transform: translate(5px, 13px);
    }

    .pin-text {
      font-size: 16px;
    }

    .pin-text-1 {
      transform: translate(3px, 5px);
    }

    .pin-text-2 {
      transform: translate(3px, 5px);
    }

    .pin-icon {
      transform: translate(6px, 7px);
    }

    .pin-append {
      transform: translate(24px, 2px);
    }
  }
}
</style>
