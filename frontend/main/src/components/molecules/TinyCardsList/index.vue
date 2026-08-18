<template>
  <v-slide-y-transition
    v-if="items && !!items.length"
    group
    tag="div"
    class="row"
  >
    <v-col
      v-for="(item, i) in items"
      :key="i"
      cols="12"
      class="ma-0 pa-0 pb-2"
    >
      <slot
        v-if="useSlot"
        name="card"
        :item="item"
        :index="i"
      />
      <list-card
        v-else
        :title="titleTextKey ? item[titleTextKey] : titleFunction(item)"
        :icon="getIcon(item)"
        :flag-icon-code="item[flagIconKey]"
        :subtitle-key-value-pairs="getSubtitlePairs(item)"
        :card-buttons="cardButtons"
        :button-params="{ item, index: i }"
      >
        <template #title-append>
          <slot name="title-append" :item="item" />
        </template>
      </list-card>
    </v-col>
  </v-slide-y-transition>
</template>
<script>
import ListCard from '@/components/molecules/ListCard/index.vue';

export default {
  name: 'TinyCardsList',
  components: { ListCard },
  props: {
    items: {
      type: Array,
      required: true,
    },
    titleTextKey: {
      type: String,
      default: '',
    },
    titleFunction: {
      type: Function,
      default: () => '',
    },
    listItemIcon: {
      type: [String, Function],
      default: '',
    },
    flagIconKey: {
      type: String,
      default: '',
    },
    subtitleKeyValuePairs: {
      type: [Array, Function],
      default: () => [],
    },
    useSlot: {
      type: Boolean,
    },
    cardButtons: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getIcon(item) {
      if (typeof this.listItemIcon === 'function') {
        return this.listItemIcon(item);
      }
      return this.listItemIcon;
    },
    getSubtitlePairs(item) {
      if (typeof this.subtitleKeyValuePairs === 'function') return this.subtitleKeyValuePairs(item);
      return this.subtitleKeyValuePairs;
    },
  },
};
</script>
