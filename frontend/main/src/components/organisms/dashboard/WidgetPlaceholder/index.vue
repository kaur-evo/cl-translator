<template>
  <div class="fill-height d-block pos-relative">
    <v-hover
      v-slot="hover"
      class="d-print-none"
    >
      <v-row
        v-bind="hover?.props"
        class="fill-height d-print-none"
        :class="hover?.isHovering ? 'bg-lw-background' : 'bg-primary-dark'"
        @click="onClick"
        @mousedown="start"
        @mouseleave="stop"
      >
        <v-col class="widget-placeholder fill-height">
          <v-row class="fill-height justify-center align-center">
            <div class="text-center">
              <evocon-v-button
                :icon="mdiPlus"
                type="primary-light"
                :text="$t('Add widget')"
                color="primary"
              />
            </div>
            <div
              :class="interval && count > 2 ? 'animate' : ''"
              class="widget-mr-evocon-container"
            >
              <img
                src="../../../../assets/images/WidgetMrEvocon.svg"
                alt="Mr Evocon"
              >
            </div>
          </v-row>
        </v-col>
      </v-row>
    </v-hover>
  </div>
</template>
<script>

import { mdiPlus } from '@mdi/js';

import CustomInterval from '@/helpers/interval/CustomInterval';
import EvoconVButton from '@/components/atoms/EvoconVButton/index.vue';

const vectorIcons = { mdiPlus };
export default {
  name: 'WidgetPlaceholder',
  components: { EvoconVButton },
  emits: ['click'],
  data() {
    return {
      ...vectorIcons,
      interval: null,
      count: 0,
    };
  },
  methods: {
    onClick() {
      this.$emit('click');
    },
    increaseCount() {
      this.count += 1;
    },
    start() {
      if (!this.interval) {
        this.interval = new CustomInterval(this.increaseCount, 1000).set();
      }
    },
    stop() {
      if (this.interval) {
        this.interval = this.interval.clear();
        this.count = 0;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.widget-placeholder {
  cursor: pointer;
  border: 2px dashed #000000;
  border-radius: 4px;

  .v-btn:before {
    opacity: 0.04;
  }
}
.widget-mr-evocon-container {
  position: absolute !important;
  bottom: -4px;
  right: 0;
}
.animate {
  animation: linear infinite reverse;
  animation-name: run;
  animation-duration: 5s;
}
@keyframes run {
  0% {
    right: 0;
    transform: scaleX(1);
  }
  49% {
    transform: scaleX(1);
  }
  50% {
    right: calc(100% - 102px);
    transform: scaleX(-1);
  }
  100% {
    right: 0;
    transform: scaleX(-1);
  }
}
.pos-relative {
  position: relative !important;
}
</style>
