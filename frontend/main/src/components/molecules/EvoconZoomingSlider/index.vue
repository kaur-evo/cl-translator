<template>
  <v-slider
    :model-value="zoomValue"
    direction="vertical"
    thumb-size="10"
    track-size="2"
    :step="sliderStep"
    :max="sliderMaxValue"
    :min="sliderMinValue"
    hide-details
    @update:model-value="$emit('update:zoom-value', $event)"
  >
    <template #prepend>
      <evocon-v-button
        :icon="mdiMinus"
        size="small"
        class="mt-n2"
        color="white"
        @mousedown="startChange(-sliderStep)"
        @mouseup="stopChange"
        @mouseleave="stopChange"
        @touchstart.prevent="startChange(-sliderStep)"
        @touchend="stopChange"
        @click="onZoomUpdate(-sliderStep)"
      />
    </template>
    <template #append>
      <evocon-v-button
        :icon="mdiPlus"
        size="small"
        class="mb-n2"
        color="white"
        @mousedown="startChange(sliderStep)"
        @mouseup="stopChange"
        @mouseleave="stopChange"
        @touchstart.prevent="startChange(sliderStep)"
        @touchend="stopChange"
        @click="onZoomUpdate(sliderStep)"
      />
    </template>
  </v-slider>
</template>
<script setup name="EvoconZoomingSlider">
import { ref } from 'vue';
import { mdiPlus, mdiMinus } from '@mdi/js';

import CustomInterval from '@/helpers/interval/CustomInterval';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const props = defineProps({
  zoomValue: { type: Number, default: 0 },
  sliderStep: { type: Number, default: 1 },
  sliderMinValue: { type: Number, default: 0 },
  sliderMaxValue: { type: Number, default: 100 },
});

const emit = defineEmits(['update:zoom-value']);

const interval = ref(null);

const onZoomUpdate = (direction) => {
  let newValue = props.zoomValue + (direction * props.sliderStep);
  newValue = Math.max(props.sliderMinValue, Math.min(props.sliderMaxValue, newValue));
  emit('update:zoom-value', newValue);
};

const startChange = (direction) => {
  if (!interval.value) interval.value = new CustomInterval(() => onZoomUpdate(direction), 100).set();
};

const stopChange = () => {
  if (interval.value) interval.value = interval.value.clear();
};
</script>
