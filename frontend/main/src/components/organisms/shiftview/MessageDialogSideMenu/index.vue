<template>
  <div class="mr-1">
    <evocon-v-button
      v-if="!isMobileView"
      :text="$t('New message')"
      :disabled="isReadOnly || !newMessageEnabled"
      color="quaternary-dark"
      class="mb-4"
      type="primary"
      @click="createNewMessage"
    />
    <generic-tabs-row
      :model-value="active"
      :items="tabs"
      :label-key="null"
      :grow="true"
      :disabled-rule-func="(val, i) => i === 1 && messages[1].length === 0"
      :height="isMobileView ? 40 : 56"
      @update:model-value="$emit('tab-changed', $event)"
    />
    <div
      v-if="messages[active].length > 0"
      class="side-menu-list"
      :class="{ 'side-menu-list--mobile': isMobileView, 'side-menu-list--tablet': showFullscreenDialogs && !isMobileView }"
    >
      <v-list class="py-1">
        <v-list-item
          v-for="(message, i) in messages[active]"
          :key="`message${i}`"
          class="px-2 py-3"
          :color="!message.read || isSelected(message) ? 'primary' : ''"
          :active="isSelected(message) || !message.read"
          @click="selectMessage(message)"
        >
          <template #prepend>
            <v-avatar
              size="40"
              :color="!message.read || isSelected(message) ? 'primary' : 'grey'"
              class="justify-center mr-2"
            >
              <span class="text-white font-weight-medium">{{ message.new ? '?' : getInitial(message) }}</span>
            </v-avatar>
            <v-icon
              v-if="!message.read"
              color="lw-orange"
              size="10"
              class="ml-8 mt-n6 position-absolute"
            >
              {{ mdiCircle }}
            </v-icon>
          </template>
          <v-list-item-title>
            <span
              :class="{ 'font-weight-medium': isSelected(message), 'text-body-medium': isMobileView }"
            >
              {{ message.new ? $t('New message') : getSubjectDisplayName(message.subject) }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle
            v-if="!message.new"
            class="text-secondary-text"
            :class="{ 'text-body-small': isMobileView }"
          >
            {{ message.participants.join(',') }}
          </v-list-item-subtitle>
          <template #append>
            <v-list-item-action v-if="!message.new">
              <div class="action-text text-secondary-text ml-4" :class="{ 'action-text--small': isMobileView }">
                {{ getDisplayTime(message) }}
              </div>
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { mdiPlus, mdiCircle } from '@mdi/js';
import { isToday } from 'date-fns';

import { useProfileStore, useDeviceStore } from '@/stores/index';
import getDisplayName from '@/helpers/getDisplayName';
import GenericTabsRow from '@/components/molecules/GenericTabsRow/index.vue';
import { formatDate } from '@/helpers/date/formatDate';
import { formatTime } from '@/helpers/time/formatTime';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiPlus, mdiCircle };
export default {
  name: 'MessagesSideMenu',
  components: {
    GenericTabsRow,
    EvoconVButton,
  },
  props: {
    active: { type: Number, default: 0 },
    messages: { type: Object, default: () => {} },
    selectedMessage: { type: Object, default: () => {} },
    loading: { type: Boolean },
  },
  emits: ['tab-changed', 'select-message', 'create-message'],
  data() {
    return {
      ...vectorIcons,
      tabs: [this.$t('Inbox'), this.$t('Archived')],
    };
  },
  computed: {
    ...mapState(useProfileStore, ['isReadOnly']),
    ...mapState(useDeviceStore, ['isMobileView', 'showFullscreenDialogs']),
    newMessageEnabled() {
      if (this.active === 1) return false;
      if (this.loading) return false;
      return !this.messages[0].some((message) => message.new);
    },
  },
  methods: {
    selectMessage(msg) {
      this.$emit('select-message', msg);
    },
    isSelected(message) {
      return message.id === this.selectedMessage.id;
    },
    createNewMessage() {
      this.$emit('create-message');
    },
    getInitial(thread) {
      return thread.participants[0].substring(0, 1).toUpperCase();
    },
    getSubjectDisplayName(name) {
      return getDisplayName(name);
    },
    getDisplayTime(message) {
      if (!message.lastMessageTime) return '';
      const date = new Date(message.lastMessageTime);
      if (isToday(date)) {
        return formatTime(message.lastMessageTime);
      }
      return formatDate(date, 'long');
    },
  },
};
</script>
<style lang="scss" scoped>
.action-text {
  font-size: 12px;
  &--small {
    font-size: 10px;
  }
}

.side-menu-list {
  max-height: calc(var(--app-height) * 0.9px - 64px - 16px - 52px - 56px - 68px); // 100% - toolbar - padding - button - tabs - actions
  overflow-y: auto;

  &--mobile {
    max-height: calc(var(--app-height) * 1px - 64px - 8px - 40px - 60px); //100% - toolbar - padding - tabs - actions
  }

  &--tablet{
    min-height: calc(var(--app-height) * 1px - 56px - 16px - 52px - 56px - 68px);
    max-height: calc(var(--app-height) * 1px - 56px - 16px - 52px - 56px - 68px);
  }
}

</style>
