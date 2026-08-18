<template>
  <div class="d-flex flex-column justify-space-between">
    <div>
      <message-dialog-message-header
        :message="message"
        :subject-error="subjectError"
        @subject-change="$emit('subject-change', $event)"
        @participant-change="$emit('participant-change', $event)"
        @on-toggle-archive="$emit('archive-message')"
        @on-message-deleted="$emit('on-message-deleted')"
      />
      <div
        class="thread-messages"
        :class="{ new: message.new, 'thread-messages--mobile': isMobileView, 'thread-messages--tablet': showFullscreenDialogs && !isMobileView }"
      >
        <div
          v-for="(msg, i) in threadMessages"
          :key="`msg${i}`"
          :class="{ 'mx-4': !isMobileView }"
        >
          <v-divider class="mb-2" />
          <div class="d-flex full-width">
            <v-avatar
              :size="isMobileView ? 36 : 40"
              color="grey"
              class="mr-4"
            >
              <span class="text-white font-weight-medium">{{ getInitials(msg.sender) }}</span>
            </v-avatar>
            <div class="full-width">
              <div class="d-flex">
                <span
                  class="font-weight-medium"
                  :class="{ 'text-body-medium': isMobileView }"
                >
                  {{ msg.sender }}
                </span>
                <v-spacer />
                <span class="text-body-small text-tertiary-dark">{{ calculateTime(msg.received) }}</span>
              </div>
              <p
                v-for="(paragraph, j) in getTextParagraphs(msg.body)"
                :key="`paragraph${j}`"
                class="mb-3"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <evocon-v-textarea
      v-if="!message.archived"
      v-model="newMessageBody"
      :class="isMobileView ? 'mt-2' : 'ml-4 mt-2'"
      :disabled="isReadOnly || isLoading"
      :loading="isLoading"
      :rows="isMobileView ? 2 : 8"
      max-length="500"
      :placeholder="$t('Message')"
      :error-messages="emptyMessageError"
    >
      <template #append-inner>
        <v-icon
          :color="newMessageBody.length ? 'primary' : ''"
          @click="submit"
        >
          {{ mdiSend }}
        </v-icon>
      </template>
    </evocon-v-textarea>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { mdiSend } from '@mdi/js';
import { isToday } from 'date-fns';

import { useStationStore, useProfileStore, useDeviceStore, useGenericNotificationStore } from '@/stores/index';
import messageApi from '@/api/messageApi';
import MessageDialogMessageHeader from '@/components/organisms/shiftview/MessageDialogMessageHeader/index.vue';
import { formatDate } from '@/helpers/date/formatDate';
import { formatTime } from '@/helpers/time/formatTime';
import EvoconVTextarea from '@/components/atoms/EvoconVTextarea/index.vue';

const vectorIcons = { mdiSend };

export default {
  name: 'MessageTemplate',
  components: {
    MessageDialogMessageHeader,
    EvoconVTextarea,
  },
  props: {
    message: { type: Object, default: () => {} },
    threadMessages: { type: Array, default: () => [] },
  },
  emits: ['message-sent', 'subject-change', 'participant-change', 'archive-message', 'on-message-deleted'],
  data() {
    return {
      ...vectorIcons,
      isLoading: false,
      newMessageBody: '',
      emptyMessageError: null,
      subjectError: null,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useDeviceStore, ['isMobileView', 'showFullscreenDialogs']),
  },
  watch: {
    newMessageBody(newVal) {
      if (newVal.length) {
        this.emptyMessageError = null;
      }
    },
    message: {
      handler(newVal) {
        if (newVal.newSubject && newVal.newSubject.length > 0) {
          this.subjectError = null;
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(useGenericNotificationStore, ['notifySuccess']),
    async submit() {
      if (this.newMessageBody && (this.message.newSubject || this.message.subject) && this.message.participants.length > 0) {
        this.isLoading = true;
        const body = {
          stationId: this.lineviewStation.id,
          subject: this.message.new ? this.message.newSubject : this.message.subject,
          message: this.newMessageBody,
          recipients: this.message.participants,
        };
        await messageApi.sendMessage(this.lineviewStation.id, body);
        this.notifySuccess(this.$t('Message sent'));
        this.$emit('message-sent', this.message, this.newMessageBody);
        this.newMessageBody = '';
        this.isLoading = false;
      } else {
        if (this.message.new && !this.message.newSubject) {
          this.subjectError = this.$t('Enter subject for your message');
        }
        if (!this.newMessageBody) {
          this.emptyMessageError = this.$t('Describe an issue or share your ideas');
        }
      }
    },
    calculateTime(time) {
      if (!time) return '';
      const date = new Date(time);
      if (isToday(date)) {
        return formatTime(time);
      }
      return formatDate(date, 'long');
    },
    getInitials(name) {
      return name.charAt(0).toUpperCase();
    },
    getTextParagraphs(text) {
      return text.split(/\r?\n/);
    },
  },
};
</script>

<style lang="scss" scoped>
.full-width {
  width: 100%
}

.thread-messages {
  max-height: calc(var(--app-height) * 0.9px - 519px);
  min-height: calc(var(--app-height) * 0.6px - 519px);
  overflow-y: auto;

  &--tablet {
    max-height: calc(var(--app-height) * 1px - 519px);
    height: calc(var(--app-height) * 1px - 519px);
    min-height: 200px;

    &.new {
      max-height: calc(var(--app-height) * 1px - 579px);
      height: calc(var(--app-height) * 1px - 579px);
    }
  }

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 372px);
    height: calc(var(--app-height) * 1px - 372px);
    min-height: 200px;

    &.new {
      max-height: calc(var(--app-height) * 1px - 386px);
      height: calc(var(--app-height) * 1px - 386px);
    }
  }
}
</style>
