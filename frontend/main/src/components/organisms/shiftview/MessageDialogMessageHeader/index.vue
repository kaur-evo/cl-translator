<template>
  <v-row :class="{ 'pl-4': !isMobileView }">
    <v-col cols="12">
      <evocon-v-input
        v-if="message.new"
        :model-value="message.newSubject"
        :placeholder="$t('Subject')"
        :error-messages="subjectError"
        :density="isMobileView ? 'compact' : 'default'"
        max-length="100"
        :hint="$t('Subject')"
        class="mb-2"
        @update:model-value="$emit('subject-change', $event)"
      />
      <div
        v-else
        class="pr-0 d-flex align-center max-width-100 overflow-hidden"
        :class="{ 'pl-0': isMobileView }"
      >
        <v-avatar
          :size="isMobileView ? 36 : 40"
          color="grey"
          class="mr-2 my-0 justify-center"
        >
          <span class="text-white font-weight-medium">{{ getInitial(message) }}</span>
        </v-avatar>
        <span
          class="font-weight-medium white-space-nowrap flex-grow-0 flex-shrink-1 overflow-hidden text-overflow-ellipsis"
          :class="isMobileView ? 'text-body-medium' : 'text-body-large'"
        >
          {{ getSubjectDisplayName(message.subject) || $t('New message') }}
        </span>
        <v-spacer />
        <template v-if="message.archived">
          <div class="ml-2">
            <evocon-v-button
              :color="isMobileView ? '' : 'quaternary-dark'"
              :icon="isMobileView ? mdiInbox : ''"
              :text="isMobileView ? '' : $t('Restore')"
              @click="$emit('on-toggle-archive')"
            />
          </div>
          <div class="ml-2">
            <evocon-v-button
              color="error"
              variant="text"
              :icon="isMobileView ? mdiDelete : ''"
              :text="isMobileView ? '' : $t('Delete')"
              @click="deleteMessage"
            />
          </div>
        </template>
        <evocon-v-button
          v-else
          class="ml-2"
          :color="isMobileView ? '' : 'quaternary-dark'"
          :icon="mdiPackageDown"
          :text="isMobileView ? '' : $t('Archive')"
          @click="$emit('on-toggle-archive')"
        />
      </div>
    </v-col>
    <v-col cols="12">
      <selection-input
        v-if="message.new"
        :model-value="participants"
        :items="emails"
        :placeholder="$t('Recipients')"
        :hint="$t('Recipients')"
        :dark="false"
        item-value="name"
        hide-search
        required
        @update:model-value="$emit('participant-change', $event)"
      />
      <template v-else>
        <evocon-v-chip
          v-if="participants.length"
          :label="participants[0]"
          :size="isMobileView ? 'small' : 'default'"
          class="message-email-chip my-4"
          :value="participants[0]"
          disabled
          :dark="false"
        />
        <v-tooltip
          v-if="participants.length > 1"
          location="bottom"
        >
          <template #activator="{ props }">
            <span
              class="ml-2 text-body-medium"
              v-bind="props"
            >
              + {{ participants.length - 1 }} {{ $t('more') }}
            </span>
          </template>
          <div class="text-body-medium">
            {{ participants.slice(1).join(', ') }}
          </div>
        </v-tooltip>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'pinia';
import { mdiPackageDown, mdiInbox, mdiDelete } from '@mdi/js';

import { useStationStore, useDeviceStore } from '@/stores/index';
import getDisplayName from '@/helpers/getDisplayName';
import messageApi from '@/api/messageApi';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';
import EvoconVInput from '@/components/atoms/EvoconVInput/index.vue';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const icons = { mdiPackageDown, mdiInbox, mdiDelete };

export default {
  name: 'MessageHeader',
  components: {
    SelectionInput,
    EvoconVChip,
    EvoconVInput,
    EvoconVButton,
  },
  props: {
    message: { type: Object, default: () => {} },
    subjectError: { type: String, default: '' },
  },
  emits: ['subject-change', 'participant-change', 'on-toggle-archive', 'on-message-deleted'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useStationStore, ['lineviewStation']),
    ...mapState(useDeviceStore, ['isMobileView']),
    emails() {
      return this.lineviewStation.notificationEmails.split(',').map((email) => ({ name: email }));
    },
    participants() {
      return this.message.participants || [];
    },
  },
  methods: {
    getSubjectDisplayName(name) {
      return getDisplayName(name);
    },
    getInitial(thread) {
      return thread.participants[0].substring(0, 1).toUpperCase();
    },
    async deleteMessage() {
      await messageApi.deleteMessage(this.lineviewStation.id, this.message.id);
      this.$emit('on-message-deleted');
    },
  },
};
</script>
