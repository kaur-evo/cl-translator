<template>
  <selection-input
    class="pt-0 mt-0 text-body-medium font-weight-medium"
    :model-value="[status]"
    :items="statusItems"
    :items-map="statusItemsMap"
    min-width="120px"
    item-value="value"
    density="compact"
    :filled="false"
    is-single-select
    hide-search
    required
    @update:model-value="onSelectionChange"
  >
    <template #prepend-inner>
      <v-icon size="8" :color="status ? 'primary' : 'grey'" class="status-icon">
        {{ mdiCircle }}
      </v-icon>
    </template>
  </selection-input>
</template>
<script>
import { mdiCircle } from '@mdi/js';

import SelectionInput from '@/components/molecules/SelectionInput/index.vue';
import listToKeyMap from '@/helpers/list/listToKeyMap';

const icons = { mdiCircle };

export default {
  name: 'SettingsStatusDropdown',
  components: { SelectionInput },
  props: {
    status: { type: Boolean },
  },
  emits: ['on-dropdown-select'],
  data() {
    return {
      ...icons,
      statusItems: [
        { value: true, name: this.$t('On') },
        { value: false, name: this.$t('Off') },
      ],
    };
  },
  computed: {
    statusItemsMap() {
      return listToKeyMap(this.statusItems, 'value');
    },
  },
  methods: {
    onSelectionChange(event) {
      if (event[0] === this.status) return;
      this.$emit('on-dropdown-select', event[0]);
      document.activeElement.blur();
    },
  },
};
</script>
<style lang="scss" scoped>
.status-icon {
  opacity: 1;
}
</style>
