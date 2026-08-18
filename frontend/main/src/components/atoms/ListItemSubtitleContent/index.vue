<template>
  <div class="max-width-100" :class="{ 'd-flex overflow-hidden text-overflow-ellipsis white-space-nowrap': !allowMultipleLines }">
    <v-icon
      v-if="icon"
      :size="16"
    >
      {{ icon }}
    </v-icon>
    <span
      v-if="title"
      class="text-label-small text-tertiary-text white-space-nowrap"
    >
      {{ title }}
    </span>
    <span
      class="text-body-small ml-1"
      :class="[primaryValueClass, { 'flex-grow-0 overflow-hidden text-overflow-ellipsis': !allowMultipleLines }]"
    >
      <template v-for="(text, idx) in primaryValueAsArray" :key="'primary-' + idx">
        <text-with-url :text="String(text)" tag="span" />
        <v-divider
          v-if="idx < primaryValueAsArray.length - 1"
          vertical
          thickness="2"
          class="d-inline mx-1"
        />
      </template>
    </span>
    <span
      v-if="secondaryValue"
      class="text-body-small ml-1"
      :class="secondaryValueClass"
    >
      ({{ secondaryValue }})
    </span>
    <span
      v-if="tertiaryValue"
      class="text-body-small ml-1"
      :class="tertiaryValueClass"
    >
      {{ tertiaryValue }}
    </span>
  </div>
</template>
<script>
import TextWithUrl from '@/components/atoms/TextWithUrl/index.vue';

export default {
  name: 'ListItemSubtitleContent',
  components: { TextWithUrl },
  props: {
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    primaryValue: { type: [String, Array], default: '' },
    secondaryValue: { type: String, default: '' },
    tertiaryValue: { type: String, default: '' },
    allowMultipleLines: { type: Boolean },
    primaryValueClass: { type: String, default: '' },
    secondaryValueClass: { type: String, default: '' },
    tertiaryValueClass: { type: String, default: '' },
  },
  computed: {
    primaryValueAsArray() {
      if (Array.isArray(this.primaryValue)) return this.primaryValue;
      return [this.primaryValue];
    },
  },
};
</script>
