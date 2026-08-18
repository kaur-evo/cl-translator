<template>
  <dashboard-tabs>
    <template #tab-content="tab">
      <grid
        :key="`dashboard-grid-${tab.id}`"
        class="fill-height"
        :active="true"
      />
    </template>
  </dashboard-tabs>
  <dashboard-sharing-notification />
</template>
<script>
import DashboardSharingNotification from '@/components/organisms/dashboard/DashboardSharingNotification/index.vue';
import DashboardTabs from '@/components/organisms/dashboard/DashboardTabs/index.vue';
import Grid from '@/components/organisms/dashboard/DashboardGrid/index.vue';

export default {
  name: 'DasboardComponent',
  components: {
    DashboardSharingNotification,
    DashboardTabs,
    Grid,
  },
};
</script>
