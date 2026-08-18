<template>
  <v-list-item
    v-bind="dynamicProps"
    class="nav-drawer-item list-item--flex mb-0 py-0"
    :class="{ 'nav-drawer-item--mobile': isMobileView, 'mx-1': !isMobileView, 'mx-2': isMobileView }"
    :density="isMobileView ? 'compact' : 'default'"
    :inactive="isItemInactive"
    :disabled="disabled"
    @click="openExternalUrl"
    @click.ctrl="openInNewTab"
  >
    <template #prepend>
      <v-icon
        :size="isMobileView ? 16 : 20"
        class="mx-2"
        :class="{ 'prepend-icon': !isMobileView }"
        :color="active ? 'primary' : 'white'"
        @click.stop="openExternalUrl"
        @click.stop.ctrl="openInNewTab"
      >
        {{ icon }}
      </v-icon>
      <v-icon
        v-if="menuItemHasDot"
        :color="dotColor"
        size="9"
        class="ml-8 mt-n3 position-absolute"
      >
        {{ mdiCircle }}
      </v-icon>
      <new-indicator
        v-if="newIndicatorShownUntil && !mainNavDrawerOpen"
        class="ml-n1 mt-n3"
        small
        :shown-until="newIndicatorShownUntil"
      />
    </template>
    <v-list-item-title
      v-if="menuItemTitleHasDot"
      v-show="mainNavDrawerOpen"
      id="menu-item-title-dot"
      class="nav-drawer-item-title text-subtitle pl-3 d-flex"
      :class="[{ 'text-body-medium': isMobileView, 'text-body-large': !isMobileView, 'text-primary': active }]"
    >
      {{ text }}
      <v-icon
        v-if="menuItemTitleHasDot"
        :color="dotColor"
        size="9"
        class="ml-1"
      >
        {{ mdiCircle }}
      </v-icon>
    </v-list-item-title>
    <v-list-item-title
      v-else
      v-show="mainNavDrawerOpen"
      id="menu-item-chip"
      class="nav-drawer-item-title text-subtitle pl-3 font-weight-regular d-flex align-center"
      :class="[{ 'text-body-medium': isMobileView, 'text-body-large': !isMobileView, 'text-primary': active }]"
    >
      {{ text }}
      <new-indicator
        v-if="newIndicatorShownUntil"
        :small="!mainNavDrawerOpen"
        :shown-until="newIndicatorShownUntil"
        class="ml-2"
      />
    </v-list-item-title>
  </v-list-item>
</template>
<script>
import { mapState } from 'pinia';
import { mdiCircle } from '@mdi/js';

import { useDeviceStore, useMainNavDrawerConfigStore } from '@/stores/index';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';

const icons = { mdiCircle };

export default {
  name: 'ShrinkableListItem',
  components: { NewIndicator },
  props: {
    text: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    href: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    isItemInactive: {
      type: Boolean,
    },
    to: {
      type: [Object, String],
      default: '',
    },
    menuItemHasDot: {
      type: Boolean,
    },
    menuItemTitleHasDot: {
      type: Boolean,
    },
    dotColor: {
      type: String,
      default: '',
    },
    externalUrl: {
      type: String,
      default: '',
    },
    newIndicatorShownUntil: {
      type: String,
      default: '',
    },
  },
  emits: ['click'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    ...mapState(useMainNavDrawerConfigStore, { mainNavDrawerOpen: 'drawerOpen' }),
    dynamicProps() {
      if (this.externalUrl) {
        return {
          href: this.externalUrl,
        };
      }
      return {
        to: this.to,
      };
    },
  },
  methods: {
    openExternalUrl($event) {
      if ($event.ctrlKey) return;
      this.$emit('click');
      if (this.externalUrl) {
        window.location.assign(this.externalUrl);
      }
    },
    openInNewTab() {
      if (this.externalUrl) {
        window.open(this.externalUrl, '_blank');
        return;
      }
      if (this.href) {
        window.open(this.href, '_blank');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.prepend-icon {
  margin-left: 10px !important;
  margin-right: 10px !important;
}
</style>
