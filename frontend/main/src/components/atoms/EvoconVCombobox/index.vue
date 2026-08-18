<template>
  <v-combobox
    v-bind="$attrs"
    :ref="'evoconCombobox'"
    :append-icon="appendIcon"
    :model-value="internalModel"
    persistent-hint
    color="primary"
    :maxlength="maxLength"
    :counter="maxLength"
    :items="items"
    variant="filled"
    clearable
    persistent-counter
    :menu-props="{
      top: positionTop,
      'offset-y': true,
      theme: 'light',
      'max-width': maxMenuWidth,
    }"
    @update:search="onSearchUpdate"
    @update:model-value="onModelValueUpdate"
    @focus="setMaxMenuWidth"
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
      :key="slot"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </v-combobox>
</template>

<script>

export default {
  name: 'EvoconVCombobox',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    maxLength: {
      type: String,
      default: undefined,
    },
    positionTop: {
      type: Boolean,
    },
    items: {
      type: Array,
      default: () => [],
    },
    appendIcon: {
      type: String,
      default: '',
    },
  },
  emits: ['update:model-value', 'update:search'],
  data() {
    return {
      maxMenuWidth: '0px',
      internalModel: null,
    };
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) return;
        this.internalModel = val;
      },
    },
  },
  methods: {
    setMaxMenuWidth() {
      this.maxMenuWidth = `${this.$refs.evoconCombobox.$el.getBoundingClientRect().width}px`;
    },
    onSearchUpdate(val) {
      this.$emit('update:search', val ? val.trim() : '');
    },
    onModelValueUpdate(val) {
      this.internalModel = val;
      this.$emit('update:model-value', val);
    },
  },
};
</script>
