<template>
  <v-select
    v-bind="$attrs"
    :model-value="modelValue"
    :menu-props="{
      'offset-y': true,
      maxHeight: 500,
      theme: light ? 'light' : 'dark',
      maxWidth: menuWidth,
    }"
    :item-title="itemText"
    :item-value="itemValue"
    :variant="isFilled && 'filled'"
    hide-details="auto"
    :no-data-text="$t('No data available')"
    persistent-hint
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
    <template #chip="{ internalItem, index }">
      <evocon-v-chip
        v-if="$attrs.chips"
        :label="internalItem.title"
        type="primary"
        active
        allow-grow
        @click:close="onRemoveChip(index)"
      />
      <span v-else> {{ internalItem.title }}</span>
    </template>
    <template v-if="showSelectAll" #prepend-item>
      <v-list-item
        :title="$t('Select all')"
        :active="modelValue.length"
        @click="toggleAll"
      >
        <template #prepend>
          <v-checkbox-btn
            :color="modelValue.length ? 'primary' : undefined"
            :indeterminate="modelValue.length && modelValue.length < $attrs.items.length"
            :model-value="modelValue.length === $attrs.items.length"
            :class="{ 'v-checkbox-btn--active': modelValue.length }"
          />
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </v-select>
</template>

<script>
import EvoconVChip from '@/components/atoms/EvoconVChip/index.vue';

export default {
  name: 'EvoconVSelect',
  components: {
    EvoconVChip,
  },
  props: {
    modelValue: {
      type: [String, Number, Array],
      default: null,
    },
    itemText: {
      type: [String, Function],
      default: 'name',
    },
    itemValue: {
      type: String,
      default: 'id',
    },
    light: {
      type: Boolean,
      default: true,
    },
    isFilled: {
      type: Boolean,
      default: true,
    },
    showSelectAll: {
      type: Boolean,
    },
  },
  emits: ['update:model-value'],
  data() {
    return {
      menuWidth: 330,
    };
  },
  mounted() {
    const timeout = 500;
    window.setTimeout(() => {
      this.menuWidth = this.$el?.clientWidth;
    }, timeout);
  },
  methods: {
    toggleAll() {
      if (this.modelValue.length === this.$attrs.items.length) {
        this.$emit('update:model-value', []);
      } else {
        this.$emit('update:model-value', this.$attrs.items.map((item) => item[this.itemValue]));
      }
    },
    onRemoveChip(index) {
      const newValue = [...this.modelValue];
      newValue.splice(index, 1);
      this.$emit('update:model-value', newValue);
    },
  },
};
</script>
