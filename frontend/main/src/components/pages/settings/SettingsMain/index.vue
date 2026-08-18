<template>
  <v-row
    v-if="$route.name === 'settings'"
    class="fill-height bg-quaternary-dark d-flex flex-column align-center"
  >
    <v-row
      class="settings-cards-wrapper mx-sm-9 my-4"
      :class="{ 'full-width': isMobileView }"
    >
      <v-col
        v-for="(n, i) in modules"
        :key="`col${i}`"
        class="pa-2"
        cols="12"
        :sm="modules.length === 1 ? 12 : 6"
        :lg="modules.length === 1 ? 12 : 4"
      >
        <settings-intro-card
          :card-title="n.header || n.name"
          :intro-text="n.description"
          :route-to="n.id"
          :new-indicator-shown-until="n.newIndicatorShownUntil"
          :is-small-new-indicator="n.isSmallNewIndicator"
          :img-id="getCardImg(n.id)"
        />
      </v-col>
    </v-row>
    <div
      v-if="highestRoleAllows('support')"
      class="d-flex flex-column mx-auto pt-4 pb-10 text-center"
    >
      <span class="text-body-medium mb-2">{{ $t('If you have any problems or ideas please contact our customer service') }}</span>
      <evocon-v-button
        id="support-chat-button"
        color="quaternary-dark"
        class="mx-auto"
        :text="$t('Contact support')"
        @click="openSupportDialog"
      />
    </div>
  </v-row>
  <router-view v-else />
</template>

<script>
import { mapState } from 'pinia';

import SettingIntroTexts from './settingsTexts';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SettingsIntroCard from '@/components/organisms/settings/SettingsIntroCard/index.vue';
import openSupportDialog from '@/helpers/support/openSupportDialog';
import useDeviceStore from '@/stores/device';
import useProfileStore from '@/stores/profile';

export default {
  name: 'SettingsIntroComponent',
  components: {
    EvoconVButton,
    SettingsIntroCard,
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useProfileStore, ['currentUser', 'highestRoleAllows']),
    modules() {
      const modules = SettingIntroTexts(this.currentUser, this.highestRoleAllows('settings'), this.highestRoleAllows('securitySettings'));
      return modules.flat().filter((module) => module.visible) || [];
    },
  },
  methods: {
    openSupportDialog,
    getCardImg(module) {
      if (module === 'profile') return this.currentUser.avatar || 'profile-img-1';
      return module;
    },
  },
};
</script>

<style lang="less" scoped>
.settings-cards-wrapper {
  padding: 8px;
  max-width: 1053px;
  flex: 0 1 auto;
}

@media only screen and (min-width: 1265px) {
  .settings-cards-wrapper {
    max-width: 1248px;
  }
}
</style>
