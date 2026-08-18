<template>
  <v-list
    id="main-nav-profile"
    class="px-0"
    nav
    theme="dark"
    lines="two"
  >
    <v-list-item
      class="nav-drawer-item px-3"
      :ripple="canEditProfile"
      :inactive="!canEditProfile"
      @click="$emit('toggle-additional-menu')"
    >
      <template #prepend>
        <profile-picture
          id="main-nav-user-photo"
          :img="avatar"
          :size="30"
          :clickable="canEditProfile"
          with-halo
          class-names="ma-1"
          class="mr-4"
        />
      </template>
      <v-list-item-title
        id="main-nav-user-name"
        :class="isMobileView ? 'text-body-medium' : 'text-body-large'"
        class="text-white font-weight-regular"
      >
        {{ fullName }}
      </v-list-item-title>
      <v-list-item-subtitle
        id="main-nav-user-email"
        :class="isMobileView ? 'text-body-small' : 'text-body-medium'"
        class="text-white"
      >
        {{ email }}
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>
<script>
import { mapState } from 'pinia';

import ProfilePicture from '@/components/atoms/ProfilePicture/index.vue';
import { useDeviceStore } from '@/stores/index';

export default {
  name: 'NavDrawerProfileItem',
  components: {
    ProfilePicture,
  },
  props: {
    avatar: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      default: 'Hello user!',
    },
    canEditProfile: {
      type: Boolean,
    },
  },
  emits: ['toggle-additional-menu'],
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
  },
};
</script>
<style lang="less" scoped>
.nav-drawer-item {
  height: 48px;
}
</style>
