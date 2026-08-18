<template>
  <v-list theme="dark">
    <v-list-item v-if="isUserInfoVisible" class="px-4">
      <v-list-item-title
        id="profile-menu-user-name"
        class="text-white"
      >
        {{ fullName }}
      </v-list-item-title>
      <v-list-item-subtitle
        id="profile-menu-user-email"
        class="text-white"
      >
        {{ email }}
      </v-list-item-subtitle>
    </v-list-item>
    <v-list-item
      v-else
      id="profile-menu-back-btn"
      class="nav-drawer-item"
      :class="{ 'px-2': isMobileView }"
      @click="$emit('close-additional-mobile-menu')"
    >
      <v-list-item-title :class="{ 'text-body-medium': isMobileView }" class="d-flex align-center">
        <v-icon :size="isMobileView ? 16 : 24" :class="{ 'ml-3 mr-5': isMobileView, 'mr-8': !isMobileView && $vuetify.display.smAndDown }">
          {{ mdiChevronLeft }}
        </v-icon>
        {{ $t('Back') }}
      </v-list-item-title>
    </v-list-item>
    <v-list-item
      v-for="(item, i) in visibleMenuItems"
      :key="`profile-menu-item${i}`"
      class="profile-menu-item nav-drawer-item pr-8"
      :class="{ 'profile-menu-item--extra-small': isMobileView }"
      @click="item.action()"
    >
      <v-list-item-title :class="{ 'text-body-medium': isMobileView }" class="d-flex align-center font-weight-regular">
        <v-icon :size="isMobileView ? 16 : 20" :class="isMobileView ? 'ml-3 mr-5' : 'mr-5'">
          {{ item.icon }}
        </v-icon>
        {{ item.name }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>
<script>
import {
  mdiLightbulbOutline,
  mdiMessage,
  mdiAccount,
  mdiChevronLeft,
} from '@mdi/js';
import { mapState } from 'pinia';

import openSupportDialog from '@/helpers/support/openSupportDialog';
import { useDeviceStore } from '@/stores/index';

const vectorIcons = {
  mdiLightbulbOutline,
  mdiMessage,
  mdiAccount,
  mdiChevronLeft,
};

export default {
  name: 'MainNavProfileMenu',
  props: {
    canEditProfile: {
      type: Boolean,
    },
    canSuggestFeature: {
      type: Boolean,
    },
    isUserInfoVisible: {
      type: Boolean,
    },
    email: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      default: 'Hello user!',
    },
  },
  emits: ['close-additional-mobile-menu'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    menuItems() {
      return [
        {
          name: this.$t('Suggest a feature'),
          icon: mdiLightbulbOutline,
          action: this.onSupport,
          isVisible: this.canSuggestFeature,
        },
        {
          name: this.$t('Contact support'),
          icon: mdiMessage,
          action: this.onSupport,
          isVisible: true,
        },
        {
          name: this.$t('Edit profile'),
          icon: mdiAccount,
          action: this.onEditProfile,
          isVisible: this.canEditProfile,
        },
      ];
    },
    visibleMenuItems() {
      return this.menuItems.filter((item) => item.isVisible);
    },
  },
  methods: {
    onSupport() {
      openSupportDialog();
      this.$emit('close-additional-mobile-menu');
    },
    onEditProfile() {
      this.$router.push({ name: 'profile' });
      this.$emit('close-additional-mobile-menu');
    },
  },
};
</script>
<style lang="less" scoped>

.profile-menu-item {
  &.profile-menu-item--extra-small {
    min-height: 40px;
    padding-left: 8px;
    padding-right: 8px !important;
  }
}
</style>
