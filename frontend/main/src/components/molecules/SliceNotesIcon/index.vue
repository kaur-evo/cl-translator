<template>
  <v-icon
    class="notes-icon"
    :class="notesIconClass"
    :size="isMobileView ? 12 : 16"
  >
    {{ mdiMessageReply }}
  </v-icon>
</template>
<script>
import { mapState } from 'pinia';
import { mdiMessageReply } from '@mdi/js';

import { useDeviceStore } from '@/stores/index';

const icons = { mdiMessageReply };

export default {
  name: 'SliceNotesIcon',
  props: {
    sliceWidth: { type: Number, default: null },
  },
  data() {
    return {
      ...icons,
    };
  },
  computed: {
    ...mapState(useDeviceStore, ['isMobileView']),
    notesIconClass() {
      /* eslint-disable no-magic-numbers */
      return {
        'ml-3': this.isMobileView && this.sliceWidth > 24,
        'ml-4': !this.isMobileView && this.sliceWidth > 32,
      };
      /* eslint-enable no-magic-numbers */
    },
  },
};
</script>
<style lang="scss" scoped>
.notes-icon {
  position: absolute !important;
  top: 0;
  margin-top: -4px;
}
</style>
