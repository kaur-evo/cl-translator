<template>
  <v-card class="mb-4 pa-4">
    <div v-if="orderNumber || title" class="d-flex align-center data-import-card-title">
      <div
        v-if="orderNumber"
        class="order-number d-flex align-center justify-center mr-2"
      >
        {{ orderNumber }}
      </div>
      <span
        v-if="title"
        class="font-weight-medium"
      >
        {{ title }}
      </span>
    </div>
    <div
      v-if="description"
      class="mt-2 mb-4 text-body-medium data-import-card-text"
    >
      {{ description }}
    </div>
    <div class="d-flex align-center">
      <slot name="action-details" />
      <v-spacer />
      <slot name="action-button" />
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'SettingsDataImportCard',
  props: {
    title: {
      type: String,
      default: '',
    },
    orderNumber: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="less" scoped>

.order-number {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(var(--v-theme-primary-dark));
  border-radius: 50%;
  font-size: 10px;
}
</style>
