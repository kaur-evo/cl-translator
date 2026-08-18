<template>
  <v-navigation-drawer
    :key="!isShiftView && isBreakpointSmAndDown"
    :model-value="(!isShiftView && isBreakpointMdAndUp) || mainNavDrawerOpen"
    :rail="!mainNavDrawerOpen && isBreakpointMdAndUp"
    :rail-width="isBreakpointMdAndUp && !isShiftView ? 64 : 0"
    :permanent="isBreakpointMdAndUp"
    width="300"
    theme="dark"
    touchless
    location="left"
    color="primary-dark"
    class="d-print-none evocon-navigation-drawer"
    :class="{ 'menu-hidden': isShiftView && !mainNavDrawerOpen, 'pb-10': isBreakpointSmAndDown }"
    :temporary="(isBreakpointSmAndDown || !hasMouseSupport) && mainNavDrawerOpen"
    :disable-resize-watcher="true"
    mobile-breakpoint="0"
  >
    <v-row
      v-if="isAdditionalMenuOpen && isBreakpointSmAndDown"
      class="fill-height flex-column flex-nowrap justify-start"
    >
      <main-nav-profile-menu
        id="main-nav-profile-menu"
        :can-edit-profile="canEditProfile"
        :can-suggest-feature="canSuggestFeature"
        :full-name="fullName"
        :email="email"
        :is-user-info-visible="isBreakpointMdAndUp"
        @close-additional-mobile-menu="isAdditionalMenuOpen = false"
      />
    </v-row>
    <v-row
      v-else
      class="fill-height flex-column flex-nowrap justify-start"
      @mouseenter="isHoverDisabled ? '' : setMainNavDrawerWithDelay(true)"
      @mouseleave="isHoverDisabled ? '' : setMainNavDrawerWithDelay(false)"
    >
      <div class="pa-3">
        <div
          id="app-close-menu"
          class="pa-3"
          :class="{ hidden: !mainNavDrawerOpen }"
          @click="setMainNavDrawer(false)"
        />
        <evocon-logo
          id="evocon-logo"
          :class="{ hidden: mainNavDrawerOpen || isShiftView }"
          @logo-clicked="setMainNavDrawer(true)"
        />
      </div>
      <v-list
        v-for="[menuGroupName, menuGroupItems] in menuItemsList"
        :id="menuGroupName"
        :key="menuGroupName"
        nav
        theme="dark"
        class="px-0"
        :class="{ 'mt-auto': menuGroupName === 'group_bottom' }"
      >
        <shrinkable-list-item
          v-for="item in menuGroupItems"
          :id="`nav-item-${item.name}`"
          :key="item.name"
          :icon="item.meta.icon"
          :text="item.meta.title()"
          :active="isActive(item)"
          :disabled="item.disabled"
          :is-item-inactive="hasMouseSupport && !mainNavDrawerOpen"
          :external-url="item.meta.externalUrl"
          :to="{ name: item.name }"
          :menu-item-has-dot="isMenuItemHavingDot(item)"
          :menu-item-title-has-dot="item.name === 'releasesUpdate' && !lastRelease.opened"
          :new-indicator-shown-until="item.meta.newIndicatorShownUntil"
          :dot-color="item.meta.specialLabelColor ? item.meta.specialLabelColor : 'error'"
          @click="setMainNavDrawer(false)"
        />
      </v-list>
      <v-menu
        v-if="isBreakpointMdAndUp && highestRoleAllows('editProfile')"
        v-model="isProfileMenuOpen"
        min-width="300"
        location="end bottom"
        origin="auto"
        offset="8px"
      >
        <template #activator="{ props }">
          <nav-drawer-profile-item
            :can-edit-profile="canEditProfile"
            :avatar="avatar"
            :full-name="fullName"
            :email="email"
            v-bind="props"
          />
        </template>
        <main-nav-profile-menu
          id="main-nav-profile-menu"
          :can-edit-profile="canEditProfile"
          :can-suggest-feature="canSuggestFeature"
          :full-name="fullName"
          :email="email"
          :is-user-info-visible="isBreakpointMdAndUp"
        />
      </v-menu>
      <nav-drawer-profile-item
        v-else
        :can-edit-profile="canEditProfile"
        :avatar="avatar"
        :full-name="fullName"
        :email="email"
        @toggle-additional-menu="onToggleAdditionalMenu"
      />
    </v-row>
  </v-navigation-drawer>
</template>

<script>
import { mdiArrowLeft, mdiArrowRight, mdiPencil } from '@mdi/js';
import { mapState, mapActions } from 'pinia';

import EvoconLogo from '@/components/atoms/EvoconLogo/index.vue';
import NavDrawerProfileItem from '@/components/organisms/NavDrawerProfileItem/index.vue';
import ShrinkableListItem from '@/components/molecules/ShrinkableListItem/index.vue';
import MainNavProfileMenu from '@/components/organisms/MainNavProfileMenu/index.vue';
import { useReleasesInfoStore, useMainNavDrawerConfigStore, useProfileStore } from '@/stores/index';

const vectorIcons = { mdiArrowLeft, mdiArrowRight, mdiPencil };

export default {
  name: 'NavigationDrawerTemplate',
  components: {
    EvoconLogo,
    ShrinkableListItem,
    MainNavProfileMenu,
    NavDrawerProfileItem,
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
    canSuggestFeature: {
      type: Boolean,
    },
    menuItems: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      ...vectorIcons,
      windowHeight: 0,
      isProfileMenuOpen: false,
      isMenuHoverDisabled: false,
      isAdditionalMenuOpen: false,
      hasMouseSupport: false,
    };
  },
  computed: {
    ...mapState(useReleasesInfoStore, ['lastRelease']),
    ...mapState(useMainNavDrawerConfigStore, { mainNavDrawerOpen: 'drawerOpen' }),
    ...mapState(useProfileStore, ['highestRoleAllows']),
    isShiftView() {
      return this.$route.name === 'shiftview';
    },
    isBreakpointMdAndUp() {
      return !!this.$vuetify.display.mdAndUp;
    },
    isBreakpointSmAndDown() {
      return !!this.$vuetify.display.smAndDown;
    },
    isHoverDisabled() {
      // is touch device || is profile menu open || is screen size small and smaller
      return !this.hasMouseSupport || this.isMenuHoverDisabled || this.isBreakpointSmAndDown;
    },
    menuItemsList() {
      if (!this.menuItems) return [];
      return Object.entries(this.menuItems);
    },
  },
  watch: {
    isProfileMenuOpen(val) {
      if (val) {
        this.isMenuHoverDisabled = true;
      } else {
        this.isMenuHoverDisabled = false;
        this.setMainNavDrawer(false);
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  created() {
    window.addEventListener('click', (e) => {
      if (e.target.className === 'v-overlay__scrim') {
        this.setMainNavDrawer(false);
        this.isAdditionalMenuOpen = false;
      }
    });
    document.addEventListener('pointermove', this.onPointerMove);
  },
  methods: {
    ...mapActions(useMainNavDrawerConfigStore, ['setMainNavDrawer', 'setMainNavDrawerWithDelay']),
    isActive(route) {
      if (
        route.name === 'allfactories'
        && (this.$route.name === 'realtime' || this.$route.name === 'timeline')
      ) {
        return true;
      }
      if (route.name === this.$route.name) return true;
      return this.$route.matched?.findIndex((el) => el.name === route.name) > -1;
    },
    isMenuItemHavingDot(item) {
      if (item.name === 'releasesUpdate' && !this.mainNavDrawerOpen) {
        return !this.lastRelease.opened;
      }
      return false;
    },
    onResize() {
      this.windowHeight = window.innerHeight;
    },
    onPointerMove(event) {
      this.hasMouseSupport = event.pointerType === 'mouse';
      document.removeEventListener('pointermove', this.onPointerMove);
    },
    onToggleAdditionalMenu() {
      if (this.isBreakpointSmAndDown) {
        this.isAdditionalMenuOpen = true;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "./style.less";

.evocon-navigation-drawer {
  transition: all 0.3s ease-in-out;
  z-index: 9;
}

.v-menu__content {
  margin-left: 16px !important;
}

.menu-hidden {
  visibility: hidden;
}

#evocon-logo {
  left: 2px;
  transition: all 0.3s ease-in-out;
  width: 48px;

  &.hidden {
    opacity: 0;
    left: 250px;
    pointer-events: none;
  }
}

#app-close-menu {
  background: url("@/assets/icons/ic_evocon_menu_close_24px.svg") no-repeat;
  width: 24px;
  height: 24px;
  position: absolute;
  border-radius: 50%;
  left: 250px;
  transition: all 0.3s ease-in-out;
  margin: 12px;
  cursor: pointer;

  &.hidden {
    opacity: 0;
    left: 0px;
  }

  &:after {
    border-radius: inherit;
    color: inherit;
    content: "";
    position: absolute;
    top: 15px;
    left: 15px;
    height: 0px;
    opacity: 0.12;
    width: 0px;
    background: rgb(255, 255, 255);
    border-radius: 50%;
  }

  &:hover {
    &:after {
      height: 36px;
      width: 36px;
      top: -6px;
      left: -6px;
    }
  }
}
</style>
