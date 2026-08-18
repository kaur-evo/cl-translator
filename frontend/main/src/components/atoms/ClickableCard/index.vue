<template>
  <v-card class="d-flex flex-column fill-height" @click="$emit('click')">
    <v-card-title class="d-flex justify-center text-body-large pb-2">
      {{ title }}
    </v-card-title>
    <v-card-text class="d-flex flex-column align-center text-center flex-grow-1">
      <template v-for="(line, index) in content" :key="index">
        <span>{{ line }}</span>
      </template>
    </v-card-text>
    <v-card-actions class="pt-0 justify-center">
      <evocon-v-button
        :text="btnText"
        color="primary"
        @click.stop="$emit('click')"
      />
    </v-card-actions>
  </v-card>
</template>
<script setup name="ClickableCard">
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: Array,
    required: true,
  },
  btnText: {
    type: String,
    required: true,
  },
});

defineEmits(['click']);
</script>
