<template>
  <div class="chart-component">
    <v-row class="header-row rounded">
      <v-col class="fill-height">
        <slot name="group-name" />
      </v-col>
    </v-row>
    <v-row
      v-for="item in items"
      :key="item.id"
      class="my-2 chart-table-row rounded"
    >
      <v-col cols="6" class="pa-2">
        <slot name="station-name" :item="item" />
      </v-col>
      <v-col
        cols="6"
        class="text-body-medium pa-2"
      >
        <slot name="stats" :item="item" />
      </v-col>
      <v-col ref="axis-container" cols="12" class="py-0 px-3 line-height-0 axis-container">
        <slot name="axis" />
      </v-col>

      <v-col cols="12" class="py-0 px-3">
        <render-in-viewport>
          <slot name="timeline-chart" :item="item" />
        </render-in-viewport>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import RenderInViewport from '@/components/molecules/RenderInViewport/index.vue';

export default {
  name: 'FactoriesOverviewTimelinesChart',
  components: {
    RenderInViewport,
  },
  props: {
    items: { type: Array, default: () => [] },
  },
};
</script>

<style lang="less" scoped>
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
        rgb(var(--v-theme-black)) 0%,
        rgba(255,255,255,0) 50px,
        rgba(255,255,255,0) calc(100% - 50px),
        rgb(var(--v-theme-black)) 100%
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
        rgb(var(--v-theme-black)) 0%,
        rgba(255,255,255,0) 50px,
        rgba(255,255,255,0) calc(100% - 50px),
        rgb(var(--v-theme-black)) 100%
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
.line-height-0 {
  line-height: 0;
}
</style>
