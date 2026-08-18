<template>
  <div>
    <div class="text-headline-large">
      {{ reportName }}
    </div>
    <div class="text-body-medium mt-1">
      {{ reportDescription }}
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia';

import { useReportsConfigStore } from '@/stores';

export default {
  name: 'ReportsHeaderTitle',
  computed: {
    ...mapState(useReportsConfigStore, ['reportName', 'reportDescription']),
  },
};
</script>
