<template>
  <shift-view-extra-small-header v-if="isMobileView" :status="status" />
  <shift-view-extra-large-header v-else-if="isXXLView" :status="status" />
  <shift-view-large-header v-else-if="$vuetify.display.mdAndUp" :status="status" />
  <shift-view-small-header v-else :status="status" />
</template>
<script>
import { mapState } from 'pinia';

import { useDeviceStore } from '@/stores/index';
import ShiftViewExtraSmallHeader from '@/components/organisms/shiftview/ShiftViewExtraSmallHeader/index.vue';
import ShiftViewSmallHeader from '@/components/organisms/shiftview/ShiftViewSmallHeader/index.vue';
import ShiftViewLargeHeader from '@/components/organisms/shiftview/ShiftViewLargeHeader/index.vue';
import ShiftViewExtraLargeHeader from '@/components/organisms/shiftview/ShiftViewExtraLargeHeader/index.vue';

export default {
  name: 'HeaderLayout',
  components: {
    ShiftViewExtraSmallHeader,
    ShiftViewSmallHeader,
    ShiftViewLargeHeader,
    ShiftViewExtraLargeHeader,
  },
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(useDeviceStore, ['isXXLView', 'isMobileView']),
  },
};
</script>
