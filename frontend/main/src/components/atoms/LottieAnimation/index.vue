<template>
  <div
    v-if="style"
    ref="lavContainer"
    :style="style"
  />
</template>

<script>
import axios from 'axios';

/* copied from https://github.com/SuperbuffNL/lottie-vuejs
* for usage with lottie light and free customization
*/
let lottie = null;
let anim = null;
export default {
  name: 'LottieAnimation',
  props: {
    path: {
      type: String,
      required: true,
    },
    speed: {
      type: Number,
      required: false,
      default: 1,
    },
    width: {
      type: Number,
      required: false,
      default: -1,
    },
    height: {
      type: Number,
      required: false,
      default: -1,
    },
    loop: {
      type: Boolean,
      required: false,
      default: true,
    },
    autoPlay: {
      type: Boolean,
      required: false,
      default: true,
    },
    loopDelayMin: {
      type: Number,
      required: false,
      default: 0,
    },
    triggerAnimate: {
      type: Number,
      default: 0,
    },
  },
  emits: ['anim-control'],
  data: () => ({
    style: null,
  }),
  watch: {
    path() {
      this.init();
    },
    triggerAnimate() {
      if (anim) this.$emit('anim-control', anim);
    },
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.releaseAnimationMemory();
    this.releaseLottieMemory();
  },
  methods: {
    async loadJsonData(path) {
      try {
        const { data } = await axios.get(`/${path}`); // this is great for not including svg/animation data in app package
        return data;
      } catch {
        // pass for tests
        return null;
      }
    },
    async init() {
      this.style = {
        'max-width': (this.width === -1) ? '100%' : `${this.width}px`,
        'max-height': (this.height === -1) ? '100%' : `${this.height}px`,
        overflow: 'hidden',
        margin: '0 auto',
      };
      try {
        this.jsonData = await this.loadJsonData(this.path);
        if (this.jsonData !== null) {
          this.releaseLottieMemory();
          lottie = await import('lottie-web').then((module) => module.default);
          this.loadAnimation();
        }
      } catch {
        // pass for tests
      }
    },
    releaseLottieMemory() {
      if (lottie) {
        if (lottie.destroy) {
          lottie.destroy();
        }
        lottie = null;
      }
    },
    releaseAnimationMemory() {
      if (anim) {
        anim.stop();
        anim.destroy(); // Releases resources. The DOM element will be emptied.
        anim = null;
      }
    },
    async loadAnimation() {
      this.releaseAnimationMemory();

      anim = lottie.loadAnimation({
        container: this.$refs.lavContainer,
        renderer: 'svg',
        loop: this.loop,
        autoplay: this.autoPlay,
        animationData: JSON.parse(JSON.stringify(this.jsonData)), // for some reason this seems to help against lottie memory leaking
        rendererSettings: {
          scaleMode: 'centerCrop',
          clearCanvas: true,
          progressiveLoad: false,
          hideOnTransparent: true,
        },
      });
      this.$emit('anim-control', anim);
      anim.setSpeed(this.speed);
      if (this.loopDelayMin > 0) {
        anim.loop = false;
        anim.autoplay = false;
      }
    },
  },
};
</script>
