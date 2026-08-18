<template>
  <v-textarea
    v-bind="$attrs"
    :maxlength="maxLength"
    :counter="maxLength"
    color="primary"
    persistent-hint
    persistent-counter
    variant="filled"
    auto-grow
  >
    <template
      v-for="slot in Object.keys($slots)"
      #[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-textarea>
</template>
<script>
export default {
  name: 'EvoconVTextarea',
  props: {
    maxLength: {
      type: String,
      default: undefined,
    },
  },
};
</script>
