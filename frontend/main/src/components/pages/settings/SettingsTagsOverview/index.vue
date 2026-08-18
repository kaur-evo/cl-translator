<template>
  <settings-entities-overview
    entity-name="tags"
    :overview-header="$t('Tags')"
    :primary-btn-text="$t('Tag')"
    :table-headers="createTableHeadersConf()"
    :items="tags"
    :loading="isLoading"
    :primary-btn-action="onAdd"
    :row-click-action="onEdit"
  />
</template>
<script>
import { mapActions, mapState } from 'pinia';
import { defineAsyncComponent } from 'vue';

import useGenericDialogStore from '@/stores/genericDialog';
import SettingsEntitiesOverview from '@/components/pages/settings/SettingsEntitiesOverview/index.vue';
import { useTagStore } from '@/stores/index';
import { createTableHeadersConf } from '@/components/organisms/settings/SettingsEntitiesTable/TableConfigs/tagsTableHeadersConf';

export default {
  name: 'PositionsOverviewComponent',
  components: {
    SettingsEntitiesOverview,
  },
  computed: {
    ...mapState(useTagStore, ['tags', 'isLoading']),
  },
  mounted() {
    this.fetchTags();
  },
  methods: {
    ...mapActions(useTagStore, ['fetchTags']),
    ...mapActions(useGenericDialogStore, ['openDialog']),
    createTableHeadersConf,
    onAdd() {
      this.onEdit({});
    },
    onEdit(item) {
      const dialogConfig = {
        component: defineAsyncComponent(() => import('../../../organisms/settings/SettingsTagEditForm/index.vue')),
        allowFullscreen: true,
        componentModule: 'organisms/settings',
        data: { tag: item },
      };
      this.openDialog(dialogConfig);
    },
  },
};
</script>
