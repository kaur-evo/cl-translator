<template>
  <div class="secondary-nav-drawer-item">
    <evocon-v-tooltip-wrap
      :disabled="!collapsed"
      position="end"
      :text="getLabel(item)"
    >
      <template #activator="{ props }">
        <v-list-item
          background-color="transparent"
          class="nav-drawer-item rounded"
          :href="item.url"
          density="compact"
          :disabled="item[loadingKey]"
          v-bind="props"
          @click="onListItemClick(item, $event)"
        >
          <list-item-contents
            :input-value="isActive(item)"
            :primary-text="getLabel(item)"
            :icon-color="isActive(item) ? getActiveColor(item) : undefined"
            color="primary"
            dense
            icon-size="default"
            additional-icon-classes="ml-1"
            :loading="item[loadingKey]"
            :icon="getIcon(item)"
          >
            <template #text-append>
              <new-indicator v-if="item.newIndicatorShownUntil && !item.isSmallNewIndicator" class="ml-2" :shown-until="item.newIndicatorShownUntil" />
            </template>
            <template v-if="collapsed || item.isSmallNewIndicator" #icon-append>
              <new-indicator
                v-if="item.newIndicatorShownUntil"
                small
                class="collapsed-new-indicator"
                :shown-until="item.newIndicatorShownUntil"
              />
            </template>
            <template #append>
              <v-icon v-if="item.subItems?.length > 0">
                {{ openedDrawerItems.includes(item.id) ? mdiChevronUp : mdiChevronDown }}
              </v-icon>
            </template>
          </list-item-contents>
        </v-list-item>
        <v-expand-transition v-if="item.subItems?.length > 0">
          <div v-show="!collapsed && openedDrawerItems.includes(item.id)">
            <v-list-item
              v-for="subItem in item.subItems"
              :key="subItem.id"
              :href="subItem.url"
              class="nav-drawer-item rounded sub-item"
              density="compact"
              @click="onSubItemClick(subItem.id)"
            >
              <v-list-item-title :class="{ 'font-weight-medium': activeSubItemValue === subItem.id }">
                {{ subItem.name }}
              </v-list-item-title>
            </v-list-item>
          </div>
        </v-expand-transition>
      </template>
    </evocon-v-tooltip-wrap>
  </div>
</template>
<script>
import { mapState } from 'pinia';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';

import { useDeviceStore } from '@/stores/index';
import logApi from '@/api/logApi';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import EvoconVTooltipWrap from '@/components/atoms/EvoconVTooltipWrap/index.vue';
import NewIndicator from '@/components/atoms/NewIndicator/index.vue';


const icons = { mdiChevronDown, mdiChevronUp };

export default {
  name: 'SecondaryNavDrawerItem',
  components: { ListItemContents, EvoconVTooltipWrap, NewIndicator },
  props: {
    item: {
      type: Object,
      required: true,
    },
    collapsed: {
      type: Boolean,
    },
    activeKey: {
      type: String,
      default: '',
    },
    activeValue: {
      type: [String, Number],
      default: '',
    },
    activeSubItemValue: {
      type: String,
      default: '',
    },
    labelKey: {
      type: String,
      default: '',
    },
    iconKey: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    activeColorKey: {
      type: String,
      default: '',
    },
    loadingKey: {
      type: String,
      default: 'isLoading',
    },
    openedDrawerItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['click', 'update:collapsed', 'update:opened-drawer-items'],
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    isBreakpointMdAndDown() {
      return this.$vuetify.display.mdAndDown;
    },
  },
  methods: {
    isActive(item) {
      if (this.activeValue && this.activeKey && this.activeKey in item) {
        return String(item[this.activeKey]) === String(this.activeValue);
      }
      return item.url && item.url.endsWith(this.$route.fullPath);
    },
    getActiveColor(item) {
      return this.activeColorKey ? item[this.activeColorKey] : 'primary';
    },
    getLabel(item) {
      return this.labelKey ? item[this.labelKey] : item;
    },
    getIcon(item) {
      return this.iconKey ? item[this.iconKey] : this.icon;
    },
    onListItemClick(item, event) {
      const hasSubItems = item.subItems?.length > 0;
      const isItemInactive = this.activeValue !== item.id;
      const isLargeScreen = !this.isBreakpointMdAndDown;

      if (!hasSubItems) {
        this.$emit('click', item);
        return;
      }

      if (this.isMobileView) event.stopPropagation();

      if (isItemInactive && isLargeScreen) {
        this.$router.push(item.defaultComponent);
        if (!this.openedDrawerItems.includes(item.id)) this.$emit('update:opened-drawer-items', item.id);
        this.$emit('update:collapsed', false);
      } else {
        this.$emit('update:opened-drawer-items', item.id);
      }
    },
    onSubItemClick(subItemId) {
      if (this.isBreakpointMdAndDown) this.$emit('update:collapsed', true);
      if (this.activeValue === 'activitylogs') {
        logApi.logEvent([{
          type: 'activity log side menu selection',
          message: `Selected from side menu: ${subItemId}`,
        }]);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.secondary-nav-drawer-item {
  min-width: 60px;
}

.nav-drawer-item {
  height: 40px;

  &.sub-item {
    padding-left: 56px;
  }
}

.collapsed-new-indicator {
  position: absolute;
  left: 44px;
}
</style>
