<template>
  <div class="chart-component">
    <v-row class="header-row rounded">
      <v-col class="first-col flex-shrink-1 flex-grow-0 fill-height">
        <slot name="group-name" />
      </v-col>
      <v-col ref="axis-container" class="flex-grow-1 flex-shrink-0 fill-height axis-container">
        <slot name="axis" />
      </v-col>
      <v-col class="last-col fill-height">
        <slot name="measure-name" />
      </v-col>
    </v-row>
    <draggable
      ref="drag-container"
      :model-value="items"
      :group="`factory-group-${id}`"
      ghost-class="ghost"
      handle=".handle"
      item-key="id"
      @end="$emit('drag-end', $event)"
      @update:model-value="$emit('update:items', $event)"
    >
      <template #item="{ element: item }">
        <v-row class="chart-row flex-nowrap chart-table-row rounded">
          <v-col class="first-col flex-shrink-1 flex-grow-0 fill-height">
            <slot name="station-name" :item="item" :drag-disabled="items.length === 1" />
          </v-col>
          <v-col class="flex-grow-1 flex-shrink-0">
            <render-in-viewport :drag-parent="$refs['drag-container']?.$el">
              <slot name="timeline-chart" :item="item" />
            </render-in-viewport>
          </v-col>

          <v-col
            v-if="$slots.stats"
            class="text-body-medium last-col flex-shrink-1 flex-grow-0 fill-height px-4"
          >
            <slot name="stats" :item="item" />
          </v-col>
        </v-row>
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

import RenderInViewport from '@/components/molecules/RenderInViewport/index.vue';

export default {
  name: 'FactoriesOverviewTimelinesChart',
  components: {
    draggable,
    RenderInViewport,
  },
  props: {
    items: { type: Array, default: () => [] },
    id: { type: [Number, String], required: true },
  },
  emits: ['update:items', 'drag-end'],
};
</script>

<style lang="less" scoped>
.chart-component {
  position: relative;

  &:deep(.x.axis) {
    .domain {
      stroke: transparent;
    }
    .tick {
      line {
        stroke: transparent !important;
      }
      text {
        opacity: 0.75;
      }
    }
  }
  &:deep(.hours-separators) {
    opacity: 0.3;
    &:nth-child(even) {
      opacity: 0;
    }
  }
}
.first-col {
  min-width: 258px;
}
.last-col {
  min-width: 100px;
  width: 100px;
  max-width: 100px;
}
.chart-row {
  height: 56px;
  margin-top: 1px;
  margin-bottom: 1px;
}
.header-row {
  height: 40px;
  .axis-container {
    position: relative;
    &:before {
      content: "";
      position: absolute;
      display: block;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #212121 0%,
        rgba(255,255,255,0) 50px,
        rgba(255,255,255,0) calc(100% - 50px),
        #212121 100%
      );
    }
  }
  &:hover {
    background: rgb(var(--v-theme-lw-gray));
    .axis-container {
      &:before {
        background: linear-gradient(
          90deg,
          rgb(var(--v-theme-lw-gray)) 0%,
          rgba(255,255,255,0) 50px,
          rgba(255,255,255,0) calc(100% - 50px),
          rgb(var(--v-theme-lw-gray)) 100%
        );
      }
    }
  }
}
.chart-table-row {
  background: rgb(var(--v-theme-black));
  &:hover {
    background: rgb(var(--v-theme-lw-gray));
  }
}
</style>
