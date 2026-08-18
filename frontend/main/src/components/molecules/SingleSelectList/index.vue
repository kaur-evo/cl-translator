<template>
  <v-list>
    <v-list-item
      v-for="(item, index) in items"
      :key="`filter-item-${index}`"
      :density="dense ? 'compact' : 'default'"
      @click="$emit('select', item)"
    >
      <list-item-contents
        :primary-text="itemText ? item[itemText] : item"
        :icon="leaf(item, iconKey)"
        :dense="dense"
      />
    </v-list-item>
  </v-list>
</template>

<script>
import ListItemContents from '@/components/molecules/ListItemContents/index.vue';
import leaf from '@/helpers/object/leaf';

export default {
  name: 'SingleSelectList',
  components: {
    ListItemContents,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    itemText: {
      type: String,
      default: 'name',
    },
    iconKey: {
      type: String,
      default: '',
    },
    dense: { type: Boolean },
  },
  emits: ['select'],
  methods: {
    leaf,
  },
};
</script>
