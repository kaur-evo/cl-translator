<template>
  <div :class="{ 'full-height': showFullscreenDialogs }">
    <dialog-toolbar
      :title-icon="mdiEmail"
      :title="$t('Messages')"
    />
    <v-card-text
      class="d-flex flex-column pb-0 flex-grow-1"
      :class="{ 'message-dialog-card--mobile': isMobileView }"
    >
      <v-row v-if="lineviewStation.notificationEmails">
        <v-col
          v-if="!isMobileView || (!selectedMessage.id && !selectedMessage.new)"
          :cols="isMobileView ? 12 : 3"
        >
          <message-dialog-side-menu
            :active="active"
            :messages="messages"
            :selected-message="selectedMessage"
            :loading="loading"
            @select-message="selectMessage"
            @tab-changed="setActiveTab"
            @create-message="createNewMessage"
          />
        </v-col>
        <v-divider
          v-if="!isMobileView"
          vertical
        />
        <v-col :cols="isMobileView ? 12 : 9">
          <div
            v-if="(!messages[active] || !messages[active].length) && !loading"
            class="empty-state"
          >
            <empty-view
              id="no-messages-empty-view"
              :header="$t('Inbox is empty ({value})', { value: lineviewStation.name })"
              :description="$t('You can send messages to e-mails defined in station settings.')"
              img-url="no-messages"
              img-width="340px"
            />
          </div>
          <div
            v-else-if="loading || (!selectedMessage.id && !selectedMessage.new && !selectedMessage.fake && !isMobileView)"
            class="text-center"
          >
            <v-progress-circular
              color="primary"
              indeterminate
            />
          </div>
          <message-dialog-message-template
            v-else-if="selectedMessage.id || selectedMessage.new || selectedMessage.fake"
            ref="message"
            :message="selectedMessage"
            :thread-messages="currentThreadMessages"
            @message-sent="setNewMessage"
            @archive-message="toggleMessage('archived')"
            @mark-as-read="toggleMessage('read')"
            @subject-change="selectedMessage.newSubject = $event"
            @participant-change="selectedMessage.participants = $event"
            @on-message-deleted="onMessageDeleted"
          />
        </v-col>
      </v-row>
      <empty-view
        v-else
        id="messaging-disabled-empty-state"
        :header="$t('No messages')"
        :description-rows="settingsAllowed
          ? [$t('Messaging is disabled for this station.'), $t('To activate, please go to station settings and define email recipients.')]
          : [$t('Messaging is disabled for this station.')]"
        :primary-btn="settingsAllowed ? $t('Go to settings') : ''"
        :secondary-btn="settingsAllowed ? $t('Learn more') : ''"
        img-url="messages-disabled"
        :img-width="isMobileView ? '240px' : '340px'"
        :small="isMobileView"
        @button-clicked="goToStationSettings"
        @secondary-btn-clicked="onLearnMore"
      />
    </v-card-text>
    <v-row class="justify-end flex-shrink-1 flex-grow-0">
      <v-col cols="9">
        <v-card-actions :class="{ 'fullscreen-card-actions': showFullscreenDialogs }">
          <evocon-v-button
            v-if="selectedMessage.new"
            id="delete-button"
            color="error"
            :text="$t('Delete')"
            type="secondary"
            @click="deleteMessageDraft"
          />
          <evocon-v-button
            v-else-if="isMobileView && !selectedMessage.id && lineviewStation.notificationEmails"
            size="small"
            :text="$t('New message')"
            type="primary-light"
            @click="createNewMessage"
          />
          <evocon-v-button
            v-else-if="isMobileView && lineviewStation.notificationEmails"
            size="small"
            :icon="mdiArrowLeft"
            :text="$t('Back')"
            @click="onBackClick"
          />
          <v-spacer />
          <evocon-v-button
            type="secondary"
            :text="$t('Close')"
            @click="close"
          />
        </v-card-actions>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mdiEmail, mdiArrowLeft } from '@mdi/js';
import { mapState, mapActions } from 'pinia';
import { DateTime } from 'luxon';

import { useStationStore, useProfileStore, useDeviceStore, useGenericDialogStore } from '@/stores/index';
import messageApi from '@/api/messageApi';
import EmptyView from '@/components/atoms/EmptyView/index.vue';
import MessageDialogSideMenu from '@/components/organisms/shiftview/MessageDialogSideMenu/index.vue';
import MessageDialogMessageTemplate from '@/components/organisms/shiftview/MessageDialogMessageTemplate/index.vue';
import DialogToolbar from '@/components/atoms/DialogToolbar/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiEmail, mdiArrowLeft };
export default {
  name: 'ShiftviewMessageDialog',
  components: {
    EmptyView,
    MessageDialogSideMenu,
    MessageDialogMessageTemplate,
    DialogToolbar,
    EvoconVButton,
  },
  data() {
    return {
      ...icons,
      active: 0,
      messages: { 0: [], 1: [] },
      selectedMessage: {},
      loading: false,
      currentThreadMessages: [],
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    ...mapState(useDeviceStore, ['showFullscreenDialogs', 'isMobileView']),
    settingsAllowed() {
      return this.highestRoleAllows('settings');
    },
    newMessage() {
      return this.messages[this.active].find((message) => message.new === true);
    },
  },
  async mounted() {
    await this.fetchMessages(0);
    await this.fetchMessages(1);
    const firstMessage = this.messages[0][0];
    if (firstMessage && !this.isMobileView) this.selectMessage(this.messages[0][0]);
  },
  methods: {
    ...mapActions(useGenericDialogStore, ['closeDialog']),
    close() {
      this.closeDialog();
    },
    goToStationSettings() {
      const url = `${window.location.origin}/#/settings/stations/${this.lineviewStation.id}/edit`;
      window.open(url, '_blank');
    },
    onLearnMore() {
      window.open('https://support.evocon.com/Managing-station-settings-88fd2a25fc8449c3abbac2416ec85234', '_blank');
    },
    async setActiveTab(tab) {
      if (this.active !== tab) {
        this.active = tab;
        await this.fetchMessages(tab);
        if (this.messages[this.active] && this.messages[this.active].length && !this.isMobileView) {
          this.selectMessage(this.messages[this.active][0]);
        }
      }
    },
    async selectMessage(msg) {
      if (this.selectedMessage || !this.isMobileView) {
        if (this.selectedMessage.id && !this.selectedMessage.read) await this.toggleMessage('read');
        if (this.selectedMessage.id !== msg.id) {
          this.getCurrentThreadMsg(msg);
        }
      }
      this.selectedMessage = msg;
    },
    async fetchMessages(tab) {
      this.loading = true;
      const messageFunction = tab === 0 ? messageApi.getMessages : messageApi.getArchivedMessages;
      const messages = await messageFunction(this.lineviewStation.id);
      this.messages[tab] = messages;
      this.loading = false;
    },
    async getCurrentThreadMsg(msg) {
      this.currentThreadMessages = msg.id ? await messageApi.getMessageByThreadId(this.lineviewStation.id, msg.id) : [];
    },
    async setNewMessage(message, body) {
      if (this.selectedMessage.new) {
        const newThread = {
          subject: this.selectedMessage.newSubject,
          participants: this.selectedMessage.participants,
          new: false,
          read: true,
          fake: true,
        };
        this.messages[this.active][0] = newThread;
        this.selectMessage(newThread);
      }
      const newMessage = {
        sender: this.lineviewStation.name,
        body,
        received: DateTime.now().setZone(this.lineviewStation.zoneId).toISO(),
      };
      this.currentThreadMessages.unshift(newMessage);
      this.selectedMessage.read = true;
    },
    async toggleMessage(action) {
      if (action === 'archived') this.selectedMessage.archived = !this.selectedMessage.archived;
      else this.selectedMessage.read = !this.selectedMessage.read;
      const body = {
        id: this.selectedMessage.id,
        archived: this.selectedMessage.archived,
        read: this.selectedMessage.read,
      };
      await messageApi.toggleMessage(this.lineviewStation.id, body);
      await this.fetchMessages(0);
      await this.fetchMessages(1);
      if (this.active === 1 && this.messages[this.active].length === 0) {
        this.setActiveTab(0);
      } else {
        this.selectMessage(this.messages[this.active][0]);
      }
    },
    createNewMessage() {
      let { newMessage } = this;
      if (!newMessage) {
        newMessage = {
          new: true,
          subject: '',
          read: false,
          archived: false,
          newSubject: '',
          participants: this.lineviewStation.notificationEmails.split(','),
        };
        this.messages[this.active].unshift(newMessage);
      }
      this.selectMessage(newMessage);
    },
    async onMessageDeleted() {
      await this.fetchMessages(this.active);
      const currentTabMessages = this.messages[this.active];
      if (currentTabMessages.length === 0) {
        this.setActiveTab(0);
      } else {
        this.selectMessage(this.messages[this.active][0]);
      }
    },
    deleteMessageDraft() {
      this.messages[0].splice(0, 1);
      this.selectMessage(this.messages[this.active][0]);
    },
    onBackClick() {
      this.selectedMessage = {};
    },
  },
};
</script>

<style scoped lang="less">
.full-height {
  height: calc(var(--app-height) * 1px);
}

.message-dialog-card--mobile {
  min-height: calc(var(--app-height) * 1px - 116px);
  max-height: calc(var(--app-height) * 1px - 116px);
  overflow-y: auto;
}
.v-divider {
  margin-right: -1px;
}
</style>
