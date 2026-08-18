<template>
  <settings-security-wrapper
    v-if="$route.name === 'securityOverview'"
    :sections="securitySettingsSections"
    title-class=""
    show-divider
  >
    <template #items=" { items }">
      <v-list>
        <v-list-item
          v-for="(item, itemIndex) in items"
          :key="item.key"
          :href="item.url"
          :class="{ 'mb-2': itemIndex < items.length - 1}"
          @click="onListItemClick(item)"
        >
          <list-item-contents
            :primary-text="item.primaryText"
            :secondary-text="item.secondaryText"
            :icon="item.icon"
          >
            <template #append>
              <v-icon>{{ mdiChevronRight }}</v-icon>
            </template>
          </list-item-contents>
        </v-list-item>
      </v-list>
    </template>
  </settings-security-wrapper>
  <router-view v-else />
</template>
<script setup name="SettingsSecurityOverview">
import { mdiChevronRight } from '@mdi/js';
import { computed } from 'vue';

import useConfirmDialogStore from '@/stores/confirmDialog';
import { getSecuritySettingsSections } from '@/constants/securitySettingsConstants';
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import SettingsSecurityWrapper from '@/components/templates/SettingsSecurityWrapper/index.vue';

const confirmDialogStore = useConfirmDialogStore();

const securitySettingsSections = computed(() => getSecuritySettingsSections());

const onListItemClick = (item) => {
  if (item.dialogConfig) {
    confirmDialogStore.openConfirmDialog(item.dialogConfig);
  }
};
</script>
