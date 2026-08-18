<template>
  <div class="d-flex flex-column fill-height">
    <div
      v-if="active"
      class="active-slot"
    >
      <div
        class="frame-title"
        @click="active = null"
      >
        {{ getViewName(active) }}
      </div>
      <iframe
        :title="'slot-active'"
        class="frame active"
        :src="pathBase + active"
      />
    </div>
    <v-row
      v-for="(row, rowIndex) in views"
      v-else
      :key="`row${rowIndex}`"
    >
      <v-col
        v-for="(col, colIndex) in row"
        :key="`slot-${rowIndex}${colIndex}`"
      >
        <div
          v-if="hasTitles"
          class="frame-title"
          @click="setActive(views[rowIndex][colIndex])"
        >
          {{ getViewName(views[rowIndex][colIndex]) }}
        </div>
        <iframe
          :title="`slot-${rowIndex}${colIndex}`"
          class="frame"
          :class="{ 'frame--with-title': hasTitles }"
          :src="`${pathBase + views[rowIndex][colIndex]}`"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import useStationStore from '@/stores/station';

export default {
  name: 'SplitView',
  data() {
    return {
      active: null,
    };
  },
  computed: {
    ...mapState(useStationStore, ['stationsMap']),
    views() {
      return JSON.parse(this.$route.query.views);
    },
    hasTitles() {
      if (!this.$route.query.titles) return false;
      return JSON.parse(this.$route.query.titles);
    },
    pathBase() {
      return `${import.meta.env.VITE_VUE_APP_BASE_URL}#/`;
    },
  },
  methods: {
    setActive(id) {
      this.active = id;
    },
    getViewName(path) {
      if (!path) return '';
      if (path.includes('shiftview')) {
        // eslint-disable-next-line sonarjs/duplicates-in-character-class
        return this.stationsMap[path.split(/[//?]/)[1]]?.name;
      }
      if (path.includes('factory-view')) return this.$t('Factory view');
      if (path.includes('dashboard')) return this.$t('Dashboard');
      return this.$t('Report');
    },
  },
};
</script>

<style lang="less" scoped>
.frame {
  width: 100%;
  height: 100%;

  &--with-title {
    height: calc(100% - 30px);
  }

  &.active {
    width: 100vw;
    height: calc(100vh - 30px);
  }
}
.frame-title {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
