<template>
  <div class="flex-column shift-view d-flex">
    <div v-if="isShiftLoading" class="loading-container">
      <v-progress-circular size="66" color="primary" indeterminate />
    </div>
    <div class="flex-shrink-1 flex-grow-0 pa-1 header-container">
      <header-layout :status="deviceStatus" />
      <selection-header />
    </div>
    <v-col
      v-if="shiftExists"
      class="flex-grow-1 flex-shrink-0 pa-0 overflow-container"
    >
      <shift-timeline
        v-if="!isShiftLoading"
        id="shiftview-timeline"
        class="dark-theme-scrollbar"
        :require-operator="shouldRequireOperator"
      />
    </v-col>
    <v-col
      v-else
      class="pa-0"
    >
      <add-custom-shift />
    </v-col>
    <shift-view-footer-menu
      v-if="shiftExists"
      :require-operator="shouldRequireOperator"
      :unread-messages-count="unreadMessagesCount"
    />
    <message-notification
      :new-messages-count="newMessagesCount"
      :description="messagesNotificationText"
      :style="{ 'margin-bottom': getMessageNotificationBottomMargin }"
      @hide-notification="newMessagesCount = 0"
    />
    <checklist-notification
      ref="checklistNotification"
      @toggle-notification="isChecklistNotificationVisible = $event"
    />
    <evocon-v-snackbar
      :model-value="deviceNotificationVisible && offlineDevicesTexts.length > 0"
      :timeout="-1"
      location="bottom center"
      type="error"
      :label="$t('Device(s) offline')"
      :description="offlineDevicesTexts"
      class="mb-14"
      @close="deviceNotificationVisible = false"
    >
      <template #actions>
        <evocon-v-button
          v-if="highestRoleAllows('settings')"
          class="ml-3"
          color="black"
          type="secondary"
          variant="tonal"
          :text="$t('Help')"
          @click="onDeviceAction"
        />
      </template>
    </evocon-v-snackbar>
    <shift-notification />
    <shiftview-selection-popover />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import ShiftTimeline from '@/components/organisms/shiftview/ShiftTimeline/index.vue';
import AddCustomShift from '@/components/organisms/shiftview/AddCustomShift/index.vue';
import HeaderLayout from '@/components/organisms/shiftview/HeaderLayout/index.vue';
import KeyListener from '@/services/keyListener';
import shiftApi from '@/api/shiftApi';
import commentApi from '@/api/commentApi';
import messageApi from '@/api/messageApi';
import ChecklistNotification from '@/components/organisms/shiftview/ChecklistNotification/index.vue';
import MessageNotification from '@/components/organisms/shiftview/MessageNotification/index.vue';
import EvoconVSnackbar from '@/components/atoms/EvoconVSnackbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import ShiftNotification from '@/components/organisms/shiftview/ShiftNotification/index.vue';
import timelineApi from '@/api/timelineApi';
import clientMetricsApi from '@/api/clientMetricsApi';
import SelectionHeader from '@/components/organisms/shiftview/ShiftviewSelectionHeader/index.vue';
import productApi from '@/api/productApi';
import scrapApi from '@/api/scrapReasonApi';
import { OFFICE_USER, LINEVIEW_USER } from '@/constants/userRoles';
import ShiftviewSelectionPopover from '@/components/organisms/shiftview/ShiftviewSelectionPopover/index.vue';
import ShiftViewFooterMenu from '@/components/organisms/shiftview/ShiftViewFooterMenu/index.vue';
import editTeamDialogConfig from '@/constants/shiftviewDialogConfigs/editTeamDialogConfig';
import getDisplayName from '@/helpers/getDisplayName';
import CustomInterval from '@/helpers/interval/CustomInterval';
import logApi from '@/api/logApi';
import formatDuration from '@/helpers/time/formatDuration';
import deviceStatus from '@/constants/deviceStatus';
import shiftviewDialogs from '@/constants/dialogConfigs';
import {
  useShiftViewStore,
  useShiftStore,
  useShiftviewTimelineStore,
  useShiftviewSelectionStore,
  useChecklistTaskStore,
  useUserPreferencesStore,
  useCommentStore,
  useConfigurationStore,
  useProfileStore,
  useStationStore,
  useOperatorStore,
  useDeviceStore,
  useGenericDialogStore,
  useGenericNotificationStore,
} from '@/stores/index';

const selectiveSerialize = (allowedKeys, obj) => {
  const queryStrList = [];
  allowedKeys.forEach((p) => {
    if (p in obj) {
      queryStrList.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  });
  return queryStrList.join('&');
};
export default {
  name: 'ShiftView',
  components: {
    ShiftViewFooterMenu,
    HeaderLayout,
    ShiftTimeline,
    AddCustomShift,
    ChecklistNotification,
    MessageNotification,
    ShiftNotification,
    ShiftviewSelectionPopover,
    SelectionHeader,
    EvoconVSnackbar,
    EvoconVButton,
  },
  async beforeRouteEnter(to, from, next) {
    await useShiftViewStore().changeShift(to.params);
    const stationStore = useStationStore();
    const shiftStore = useShiftStore();
    const stationIdStr = String(stationStore.lineviewStation.id);
    const shiftIdStr = String(shiftStore.shift.id);

    document.title = `${stationStore.lineviewStation.name} - Evocon`;
    if (to.params.stationId !== stationIdStr || to.params.shiftId !== shiftIdStr) {
      const viewParams = ['view', 'orientation', 'type'];
      if (viewParams.some((k) => k in to.query)) {
        const pathBase = `/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}?`;
        return next(pathBase + selectiveSerialize(viewParams, to.query));
      }
      if (viewParams.some((k) => k in from.query)) {
        const pathBase = `/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}?`;
        return next(pathBase + selectiveSerialize(viewParams, from.query));
      }
      return next(`/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}`);
    }
    return next();
  },
  async beforeRouteUpdate(to, from, next) {
    await useShiftViewStore().changeShift(to.params);
    const stationStore = useStationStore();
    const shiftStore = useShiftStore();
    const stationIdStr = String(stationStore.lineviewStation.id);
    const shiftIdStr = String(shiftStore.shift.id);
    document.title = `${stationStore.lineviewStation.name} - Evocon`;
    if (to.params.stationId !== stationIdStr || to.params.shiftId !== shiftIdStr) {
      this.closeDialog();
      const viewParams = ['view', 'orientation', 'type'];
      if (viewParams.some((k) => k in to.query)) {
        const pathBase = `/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}?`;
        return next(pathBase + selectiveSerialize(viewParams, to.query));
      }
      if (viewParams.some((k) => k in from.query)) {
        const pathBase = `/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}?`;
        return next(pathBase + selectiveSerialize(viewParams, from.query));
      }
      return next(`/shiftview/${stationStore.lineviewStation.id}/${shiftStore.shift.id}`);
    }
    return next();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  data() {
    return {
      shiftQueryInterval: null,
      currentStationDevicesState: {},
      offlineDevicesTexts: '',
      deviceNotificationVisible: false,
      offlineDevices: [],
      unreadMessagesCount: 0,
      newMessagesCount: 0,
      messagesNotificationText: '',
      isChecklistNotificationVisible: false,
      keyListener: null,
    };
  },
  computed: {
    ...mapState(useShiftViewStore, ['isShiftLoading']),
    ...mapState(useShiftStore, ['currentShift', 'shift', 'isShiftRunning', 'shiftExists']),
    ...mapState(useShiftviewTimelineStore, ['timeline', 'teamTimeline', 'currentBatch']),
    ...mapState(useCommentStore, ['commentsRealMap']),
    ...mapState(useConfigurationStore, ['checklistStations']),
    ...mapState(useProfileStore, ['isReadOnly', 'shiftviewStationUserRole', 'currentUser', 'highestRoleAllows']),
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useOperatorStore, ['operatorsRealMap']),
    ...mapState(useDeviceStore, ['isBrowserTabActive']),
    shouldRequireOperator() {
      return this.lineviewStation.requireOperator && this.teamTimeline.length === 0 && this.operatorsRealMap.size > 0 && !this.isReadOnly && this.shiftviewStationUserRole === 'LINEVIEW_USER';
    },
    deviceStatus() {
      return this.offlineDevicesTexts ? deviceStatus.OFFLINE : deviceStatus.ONLINE;
    },
    currentStationId() {
      return this.lineviewStation.id;
    },
    currentProductId() {
      return this.currentBatch.productId;
    },
    getMessageNotificationBottomMargin() {
      if (this.isChecklistNotificationVisible) return '92px'; // CL notification height (68px) + default bottom margin (8px) + margin between notifications (16px)
      return '8px';
    },
  },
  watch: {
    shift(newVal, oldVal) {
      if (newVal.id !== oldVal.id) {
        if (oldVal.id) {
          window.centrifugeService.unsubscribe('shiftupdate');
        }
        window.centrifugeService.subscribe('shiftupdate', newVal.id, this.shiftUpdateListener);
      }
      this.loadShifts();
    },
    async lineviewStation(newVal) {
      this.currentStationDevicesState = {};
      this.offlineDevicesTexts = '';
      this.newMessagesCount = 0;
      this.isChecklistNotificationVisible = false;
      this.unreadMessagesCount = await messageApi.getUnread(this.lineviewStation.id);
      window.centrifugeService.subscribe('station', newVal.id, this.shiftStartListener);
      window.centrifugeService.subscribe('heartbeat', newVal.id, this.heartbeatListener);
      window.centrifugeService.subscribe('newmessage', newVal.id, this.onNewMessage);
      if (this.checklistStations.includes(newVal.id)) {
        window.centrifugeService.subscribe('checklists', newVal.id, this.checklistListener);
      } else {
        window.centrifugeService.unsubscribe('checklists');
      }
      this.loadShifts();
    },
    isBrowserTabActive(newVal, oldVal) {
      if (newVal && newVal !== oldVal && this.isShiftRunning) this.continueUpdateFaking();
      else if (!newVal && newVal !== oldVal) (this.stopUpdateFaking());
    },
    isShiftRunning(newVal) {
      if (newVal) {
        this.stopCurrentShiftQueryInterval();
      } else {
        this.startShiftQueryInterval();
      }
    },
    async currentStationId(val, prevVal) {
      if (val !== prevVal) {
        this.fetchCurrentRoute();
      }
    },
    async currentProductId(val, prevVal) {
      if (val !== prevVal) {
        this.fetchCurrentRoute();
      }
    },
  },
  async mounted() {
    window.centrifugeService.subscribe('station', this.$route.params.stationId, this.shiftStartListener);
    window.centrifugeService.subscribe('shiftupdate', this.$route.params.shiftId, this.shiftUpdateListener);
    window.centrifugeService.subscribe('heartbeat', this.$route.params.stationId, this.heartbeatListener);
    window.centrifugeService.subscribe('newmessage', this.$route.params.stationId, this.onNewMessage);
    const stationId = parseInt(this.$route.params.stationId, 10);
    if (this.checklistStations.includes(stationId)) {
      window.centrifugeService.subscribe('checklists', stationId, this.checklistListener);
    }
    if (!this.isReadOnly) {
      this.keyListener = new KeyListener(
        this.applyBarCodeComment, this.applyBarCodeSignalQty, this.postClientMetrics, this.applyBarCodeChangeover, this.applyBarCodeScrap, this.applyBarcodeScrapReason,
      );
      this.keyListener.registerKeyListener();
    }
    document.addEventListener('keyup', this.keyUpListener);
    this.fetchUserPreferences();
    this.loadShifts();
    if (!this.isShiftRunning) this.startShiftQueryInterval();
    if (this.shiftExists) this.fetchCurrentRoute();
    this.unreadMessagesCount = await messageApi.getUnread(this.lineviewStation.id);
  },
  beforeUnmount() {
    window.centrifugeService.unsubscribe('station');
    window.centrifugeService.unsubscribe('heartbeat');
    window.centrifugeService.unsubscribe('shiftupdate');
    window.centrifugeService.unsubscribe('checklists');
    window.centrifugeService.unsubscribe('newmessage');
    if (this.keyListener) this.keyListener.removeEventListener();
    document.removeEventListener('keyup', this.keyUpListener);
    this.stopUpdateFaking();
    this.stopCurrentShiftQueryInterval();
    this.deviceNotificationVisible = false;
  },
  methods: {
    ...mapActions(useShiftViewStore, ['stopUpdateFaking', 'continueUpdateFaking']),
    ...mapActions(useChecklistTaskStore, ['fetchChecklistTasks']),
    ...mapActions(useGenericDialogStore, ['openDialog', 'closeDialog']),
    ...mapActions(useGenericNotificationStore, ['notifyInformation', 'notifySuccess', 'notifySaved', 'notifyError']),
    ...mapActions(useUserPreferencesStore, ['fetchUserPreferences']),
    ...mapActions(useShiftStore, ['fetchShifts', 'fetchCurrentShift', 'setCurrentShift']),
    ...mapActions(useShiftviewTimelineStore, ['fetchCurrentRoute']),
    ...mapActions(useShiftviewSelectionStore, ['selectSlice']),
    loadShifts() {
      if ([OFFICE_USER, LINEVIEW_USER].includes(this.shiftviewStationUserRole) && this.currentUser.lineviewTimeRestrictionType === 'SHIFTS' && this.currentUser.lineviewTimeRestrictionValue > 0) {
        this.fetchShifts({ stationId: this.lineviewStation.id, nrLastShifts: this.currentUser.lineviewTimeRestrictionValue });
      }
    },
    async shiftStartListener(data) {
      const { shiftId } = data;
      if (this.shift.id === this.currentShift.id || this.shiftviewStationUserRole === 'LINEVIEW_USER') {
        this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId } }).catch((e) => {
          logApi.postConsoleError([{ type: 'redirect error - message', message: JSON.stringify(e) }]);
        });
      }
      const currentShift = await shiftApi.getShift(shiftId);
      this.setCurrentShift(currentShift);
    },
    shiftUpdateListener(timeline) {
      useShiftViewStore().updateTimeline(timeline);
    },
    async checklistListener() {
      await this.fetchChecklistTasks();
      this.$refs.checklistNotification.showNotification();
    },
    async applyBarCodeComment(commentId) {
      if (this.shouldRequireOperator) {
        this.openDialog(editTeamDialogConfig);
        this.notifyInformation(this.$t('Please select team first'));
        return;
      }
      const parsedCommentId = parseInt(commentId, 10);
      const comment = this.commentsRealMap.get(parsedCommentId);
      let lastUncommented;
      let lastStoppage;
      for (let i = this.timeline.length - 1; i >= 0; i -= 1) {
        if (this.timeline[i].type !== 'PRODUCT') {
          if (!lastStoppage) lastStoppage = this.timeline[i];
          if (this.timeline[i].commentId === 0) {
            lastUncommented = this.timeline[i];
            break;
          }
        }
      }
      const stoppageToComment = lastUncommented || lastStoppage;
      const noteRequired = comment?.noteRequired && (!comment.noteRequiredDuration || comment.noteRequiredDuration <= stoppageToComment.duration);
      if (noteRequired || comment?.requirePosition) {
        this.selectSlice(stoppageToComment);
        this.openDialog({ ...shiftviewDialogs.COMMENT_DOWNTIME, data: { commentId: parsedCommentId } });
        return;
      }
      if (stoppageToComment) {
        const slice = [{
          startTimeISO: stoppageToComment.sliceStartTmISO,
          commentId: parsedCommentId,
        }];
        this.saveComment(slice, comment);
      }
    },
    async saveComment(slice, comment) {
      const commentResponse = await commentApi.saveComment(this.lineviewStation.id, this.shift.id, slice);
      if (commentResponse.success) {
        this.notifySaved(comment.name);
      } else {
        this.notifyError(this.$t(commentResponse.message));
      }
    },
    async applyBarCodeSignalQty(qty, productId) {
      const slice = [{
        signalQty: parseFloat(qty, Number),
      }];
      const signalResponse = await timelineApi.addProductionSignal(this.lineviewStation.id, slice);
      if (signalResponse.success) {
        this.notifySuccess(this.$t('Production signal added'));
      } else {
        this.notifyError(this.$t(signalResponse.message));
      }
      if (productId && Number(productId) !== this.currentBatch.productId) {
        this.applyBarCodeChangeover(productId, signalResponse.message);
      }
    },
    async postClientMetrics(data) {
      try {
        await clientMetricsApi.postClientMetrics([{
          ...data,
          stationId: this.lineviewStation.id,
          eventTimeISO: DateTime.local().setZone('UTC').toISO(),
        }]);
        this.notifySuccess(this.$t('Success'));
      } catch {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      }
    },
    async applyBarCodeChangeover(productId, time) {
      const now = DateTime.local().setZone(this.lineviewStation.zoneId);
      const eventTime = time ? new DateTime(time) : now;
      const eventTimeISO = eventTime.minus({ seconds: 1 }).toISO();

      productApi.changeProduct(this.lineviewStation.id, {
        productId,
        eventTimeISO,
      });
    },
    async applyBarCodeScrap(data) {
      if (data.scrapQty > this.currentBatch.producedQty - this.currentBatch.scrapQty) {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
        return;
      }
      const shiftStart = DateTime.fromISO(this.shift.startTimeISO, { zone: this.lineviewStation.zoneId });
      const shiftEnd = DateTime.fromISO(this.shift.endTimeISO, { zone: this.lineviewStation.zoneId });

      const batchStart = DateTime.fromISO(this.currentBatch.startTimeISO, { zone: this.lineviewStation.zoneId });
      const batchEnd = this.currentBatch.endTimeISO
        ? DateTime.fromISO(this.currentBatch.endTimeISO, { zone: this.lineviewStation.zoneId })
        : DateTime.local().setZone(this.lineviewStation.zoneId);

      const startTime = shiftStart > batchStart ? shiftStart : batchStart;
      const endTime = shiftEnd < batchEnd ? shiftEnd : batchEnd;

      const requestBody = {
        ...data,
        qtyType: 'delta',
        overwrite: false,
        shiftId: this.shift.id,
        scrapRanges: [{
          startTimeISO: startTime.toISO(),
          endTimeISO: endTime.toISO(),
        }],
      };
      const scrapResult = await scrapApi.saveScrap(this.lineviewStation.id, requestBody);
      if (scrapResult.every((res) => res.body.success)) {
        this.notifySuccess(this.$t('Scrap saved'));
      } else {
        this.notifyError(this.$t(scrapResult.message || 'We are sorry! There is a problem with your request'));
      }
    },
    async applyBarcodeScrapReason({ scrapReasonId, scrapNotes }) {
      try {
        const lastScrapSliceWithoutReason = [...this.timeline].reverse().find((t) => t.scrapQty > 0 && t.scrapReasonId === 0);
        if (!lastScrapSliceWithoutReason) return;
        await scrapApi.saveScrap(this.lineviewStation.id, {
          qtyType: 'delta',
          overwrite: true,
          shiftId: this.shift.id,
          scrapRanges: [{
            startTimeISO: lastScrapSliceWithoutReason.sliceStartTmISO,
            endTimeISO: lastScrapSliceWithoutReason.sliceEndTmISO,
          }],
          scrapReasonId,
          scrapNotes,
          scrapQty: 0,
        });
        this.notifySuccess(this.$t('Scrap saved'));
      } catch {
        this.notifyError(this.$t('We are sorry! There is a problem with your request'));
      }
    },
    keyUpListener(event) {
      if (event.key === 'Escape') this.closeDialog();
    },
    startShiftQueryInterval() {
      if (this.shiftQueryInterval) return;
      if (this.shift.id !== this.currentShift.id) return; // don't query in older shifts
      this.shiftQueryInterval = CustomInterval.createInterval(this.checkCurrentShift, 5 * 60 * 1000); // every 5 minutes
    },
    async checkCurrentShift() {
      await this.fetchCurrentShift({ stationId: this.lineviewStation.id });
      if (this.currentShift.id !== this.shift.id) {
        this.$router.push({ name: 'shiftview', params: { stationId: this.lineviewStation.id, shiftId: this.currentShift.id } });
      }
    },
    stopCurrentShiftQueryInterval() {
      if (this.shiftQueryInterval) this.shiftQueryInterval = this.shiftQueryInterval.clear();
    },
    heartbeatListener(data) {
      const deviceData = JSON.parse(data);
      if (this.currentStationDevicesState[deviceData.stationId]) {
        this.currentStationDevicesState[deviceData.stationId][deviceData.serialNo] = deviceData;
      } else {
        this.currentStationDevicesState[deviceData.stationId] = {
          [deviceData.serialNo]: deviceData,
        };
      }
      this.setOfflineDevices();
      this.offlineDevicesTexts = this.getOfflineDevicesTexts();
      if (this.offlineDevicesTexts) this.deviceNotificationVisible = true;
      else this.deviceNotificationVisible = false;
    },
    setOfflineDevices() {
      const allDevices = this.currentStationDevicesState[this.lineviewStation.id];
      if (!allDevices) return;
      const now = DateTime.local().setZone('UTC');
      const offlineDevices = Object.values(allDevices).reduce((accu, d) => {
        if (!d.lastSeen) return accu; // skip devices without lastSeen, api devices etc.
        const lastSeen = DateTime.fromISO(d.lastSeen);
        const diff = now.diff(lastSeen, 'seconds').toObject().seconds;
        if (diff > d.offlineNotificationInterval) {
          const dCopy = { ...d };
          dCopy.lastSeenDuration = formatDuration(diff);
          accu.push(dCopy);
        }
        return accu;
      }, []);
      this.offlineDevices = offlineDevices;
    },
    getOfflineDevicesTexts() {
      if (this.offlineDevices.length === 0) return '';
      const offlineDevicesTexts = this.offlineDevices.map(
        (d) => `${d.serialNo} (${this.$t('Last online: {variable} ago', { variable: d.lastSeenDuration })})`,
      );
      return offlineDevicesTexts.join(', ');
    },
    onDeviceAction() {
      const routeData = this.$router.resolve({
        name: 'deviceEdit',
        params: { id: this.offlineDevices[0].deviceId },
      });
      window.open(routeData.href, '_blank');
      this.deviceNotificationVisible = false;
    },
    async onNewMessage() {
      this.newMessagesCount += 1;
      this.unreadMessagesCount += 1;
      await this.setMessagesNotificationText();
    },
    async setMessagesNotificationText() {
      if (this.newMessagesCount === 1) {
        const messages = await messageApi.getMessages(this.lineviewStation.id);
        this.messagesNotificationText = getDisplayName(messages[0].subject);
      } else {
        this.messagesNotificationText = this.$t('New messages ({variable})', { variable: this.newMessagesCount });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  width: 100%;
}

.shift-view {
  height: calc(100vh - 48px);
  max-height: calc(100vh - 48px);
  height: calc(var(--app-height) * 1px - 48px);
  max-height: calc(var(--app-height) * 1px - 48px);
  background: rgb(var(--v-theme-primary-dark));
  width: 100%
}

.overflow-container {
  max-height: 100%;
  overflow-y: auto;
}

.grid-column {
  height: calc(100vh - 48px);
  height: calc(var(--app-height) * 1px);
  width: 100%;
  overflow: hidden;
}

.header-container {
  position: relative;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--app-height) * 1px);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
