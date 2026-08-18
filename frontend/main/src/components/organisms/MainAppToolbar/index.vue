<template>
  <v-app-bar
    id="main-app-toolbar"
    theme="dark"
    class="pl-1 pr-2 app-bar"
    :class="{ 'ml-16': isBreakpointMdAndUp }"
  >
    <!-- logo drawer button in small tablets and mobiles -->
    <v-app-bar-nav-icon
      v-if="isBreakpointSmAndDown"
      id="app-toolbar-logo"
      @click="setMainNavDrawer(!mainNavDrawerOpen)"
    >
      <div class="toolbar-logo pa-3" />
    </v-app-bar-nav-icon>
    <!-- back button  -->
    <evocon-v-button
      v-if="canGoBack"
      id="app-toolbar-back"
      :icon="mdiChevronLeft"
      class="mr-2"
      color="white"
      @click="onGoBackClick"
    />
    <!-- title  -->
    <v-toolbar-title :class="{ 'font-weight-medium': $slots['toolbar-selection'] || useToolbarSelector }">
      <slot v-if="$slots['toolbar-selection']" name="toolbar-selection" />
      <selection-input
        v-else-if="useToolbarSelector"
        :model-value="modelValue"
        :items="items"
        :filled="false"
        is-single-select
        hide-search
        width="256"
        density="compact"
        :item-value="selectionItemValue"
        required
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template #selection-input-activator="{ props }">
          <div
            v-bind="props"
            class="d-flex align-center text-truncate"
          >
            <span class="pr-1 text-truncate">{{ selectedToolbarItemText }}</span>
            <v-icon size="24">
              {{ mdiMenuDown }}
            </v-icon>
          </div>
        </template>
      </selection-input>
      <span v-else id="app-toolbar-title">{{ routeTitle }}</span>
    </v-toolbar-title>
    <slot v-if="$slots['toolbar-action']" class="mr-2" name="toolbar-action" />
  </v-app-bar>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { mdiChevronLeft, mdiDownload, mdiMenuDown } from '@mdi/js';

import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';
import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import { useMainNavDrawerConfigStore } from '@/stores/index';

const vectorIcons = { mdiChevronLeft, mdiDownload, mdiMenuDown };

export default {
  name: 'MainAppToolbar',
  components: {
    EvoconVButton,
    SelectionInput,
  },
  props: {
    hasBackButton: { type: Boolean },
    selectionItemValue: { type: String, default: 'id' },
    modelValue: { type: Array, default: () => [] },
    items: { type: Array, default: () => [] },
  },
  emits: ['update:model-value'],
  data() {
    return {
      ...vectorIcons,
    };
  },
  computed: {
    ...mapState(useMainNavDrawerConfigStore, { mainNavDrawerOpen: 'drawerOpen' }),
    routeTitle() {
      return this.$route.meta?.title?.();
    },
    canGoBack() {
      return this.$route.matched && this.$route.matched.length > 1 && this.hasBackButton;
    },
    isBreakpointMdAndUp() {
      return !!this.$vuetify.display.mdAndUp;
    },
    isBreakpointSmAndDown() {
      return !!this.$vuetify.display.smAndDown;
    },
    isGroupEdit() {
      return this.$route.query.isGroupEdit === 'true';
    },
    useToolbarSelector() {
      return this.items.length > 0;
    },
    selectedToolbarItemText() {
      return this.items.find((item) => item[this.selectionItemValue] === this.modelValue[0])?.name;
    },
  },
  methods: {
    ...mapActions(useMainNavDrawerConfigStore, ['setMainNavDrawer']),
    onGoBackClick() {
      if (this.canGoBack) {
        if (this.isGroupEdit && this.$router.options.history.state.back) { // avoid navigating away from evocon
          this.$router.go(-1);
          return;
        }
        const route = this.$route.matched[this.$route.matched.length - 2];
        if (route.meta.useRoutePathAsReturnPath) {
          this.$router.push({ path: route.path, query: { ...this.$route.query } });
          return;
        }
        if (this.$route.params.returnParams) {
          this.$router.push({ name: route.name, params: { ...this.$route.params }, query: { ...this.$route.params.returnParams } });
        } else {
          const query = { ...this.$route.query, groupId: this.$route.params.groupId };
          this.$router.push({ name: route.name, query, params: { id: this.$route.params.id } });
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
#main-app-toolbar {
  z-index: 9;
}
.toolbar-logo {
  background: url("@/assets/icons/ic_evocon_menu_24px.svg") no-repeat;
  height: 24px;
  width: 24px;
}

.app-bar {
  left: 0 !important;
  width: 100vw !important;
}
</style>
