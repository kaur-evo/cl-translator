<template>
  <div class="full-width">
    <div
      v-if="!isMobileView"
      id="settings-header"
      class="d-flex align-center justify-space-between mb-4"
      :style="{ 'margin-left': $vuetify.display.mdAndDown ? '64px' : '0px' }"
    >
      <div class="d-flex align-center">
        <span class="text-headline-large"> {{ header }}</span>
        <slot name="header" />
        <slot name="header-append" />
      </div>
      <div>
        <slot name="header-btn" />
        <v-menu
          v-if="menuItems.length > 1"
          location="bottom right"
        >
          <template #activator="{ props }">
            <evocon-v-button
              :icon="mdiDotsVertical"
              class="mr-2"
              v-bind="props"
            />
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="(menuItem, index) in menuItems"
              :key="index"
              @click="menuItem.onClick"
            >
              <list-item-contents
                :primary-text="menuItem.text"
                dense
                :icon="menuItem.icon"
              />
            </v-list-item>
          </v-list>
        </v-menu>
        <icon-with-tooltip
          v-if="menuItems.length === 1"
          :icon="menuItems[0].icon"
          :tooltip-text="menuItems[0].text"
          additional-classes="mr-2"
          button-size="default"
          :icon-clicked-fn="menuItems[0].onClick"
        />
        <evocon-v-button
          v-if="secondaryBtnText"
          type="primary-light"
          :icon="mdiPlus"
          :text="secondaryBtnText"
          @click="$emit('secondary-btn-clicked')"
        />
        <evocon-v-button
          v-if="btnText"
          class="ml-2"
          type="primary"
          color="primary"
          :icon="mdiPlus"
          :text="btnText"
          :disabled="primaryBtnDisabled"
          @click="$emit('btn-clicked')"
        />
      </div>
    </div>
    <v-card
      v-show="filterConfiguration.size > 0"
      class="px-2 py-1 mb-4"
    >
      <settings-filter-bar
        :filter-configuration="filterConfiguration"
        :toggle-btn-value="toggleBtnValue"
        :toggle-btn-items="toggleBtnItems"
        :hide-reset-btn="hideResetBtn"
        @update:toggle-btn-value="$emit('update:toggle-btn-value', $event)"
      >
        <template #notification>
          <slot name="notification" />
        </template>
      </settings-filter-bar>
    </v-card>
    <slot name="data" />
  </div>
</template>
<script>
import { mapState } from 'pinia';
import { mdiPlus, mdiDotsVertical } from '@mdi/js';

import { useDeviceStore } from '@/stores/index';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SettingsFilterBar from '@/components/organisms/settings/SettingsFilterBar/index.vue';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import IconWithTooltip from '@/components/atoms/IconWithTooltip/index.vue';
import settingsBuiltInViewTypes from '@/components/pages/settings/SettingsEntitiesOverview/settingsBuiltInViewTypes';
const vectorIcons = { mdiPlus, mdiDotsVertical };

export default {
  name: 'SettingsOverviewWrapper',
  components: {
    EvoconVButton,
    SettingsFilterBar,
    ListItemContents,
    IconWithTooltip,
  },
  props: {
    header: {
      type: String,
      default: '',
    },
    secondaryBtnText: {
      type: String,
      default: '',
    },
    btnText: {
      type: String,
      default: '',
    },
    filterConfiguration: {
      type: Map,
      default: new Map(),
    },
    toggleBtnItems: { type: Array, default: () => [] },
    toggleBtnValue: { type: [Number, String], default: settingsBuiltInViewTypes.LIST },
    primaryBtnDisabled: { type: Boolean },
    menuItems: { type: Array, default: () => [] },
    hideResetBtn: { type: Boolean },
  },
  emits: ['update:toggle-btn-value', 'secondary-btn-clicked', 'btn-clicked'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
  },
};
</script>
