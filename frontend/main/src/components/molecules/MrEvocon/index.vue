<template>
  <lottie-animation
    :path="path"
    :loop="false"
    :auto-play="false"
    :height="size"
    :width="size"
    :trigger-animate="triggerAnimate"
    @anim-control="setAnimationControl"
  />
</template>

<script>
/* eslint-disable no-magic-numbers */
import LottieAnimation from '@/components/atoms/LottieAnimation/index.vue';

const framesPerSecond = 25;

const animationSecondsMap = {
  entrance: {
    to: [0, 8.84],
    type: 'positive',
  },
  lookAround: {
    to: [9.56, 13.28],
    type: 'positive',
  },
  wave: {
    to: [13.28, 19.16],
    type: 'positive',
  },
  wink: {
    to: [19.16, 20.80],
    type: 'positive',
  },
  meditate: {
    to: [21.23, 24.32],
    loopSeconds: [24.32, 31.92],
    outro: [31.92, 35.64],
    type: 'positive',
  },
  positive: {
    to: [36.50, 35.36],
    type: 'positive',
    from: [35.36, 36.50],
  },
  neutral: {
    type: 'neutral',
  },
  negative: {
    to: [51.73, 50.50],
    from: [50.50, 51.73],
    type: 'negative',
  },
  shakeHead: {
    to: [36.40, 41.00],
    from: [41.00, 36.40],
    type: 'negative',
  },
  loopyRollEyes: {
    to: [40.96, 45.04],
    loopSeconds: [41.60, 44.28],
    loopTimeout: 14,
    from: [44.28, 45.04],
    type: 'negative',
  },
  rollEyes: {
    to: [40.96, 45.04],
    type: 'neutral',
  },
  angry: {
    to: [45.27, 51.00],
    from: [51.00, 51.52],
    type: 'negative',
  },
  thumbsUp: {
    to: [56.00, 64.27],
    type: 'positive',
  },
  worldClassOEE: {
    to: [64.86, 76.36],
    type: 'positive',
  },
};
export default {
  name: 'MrEvocon',
  components: {
    LottieAnimation,
  },
  props: {
    animationName: {
      type: String,
      required: true,
    },
    repeatIntervalSeconds: {
      type: [Number, String],
      default: -1,
    },
    size: {
      type: [Number, String],
      default: -1,
    },
  },
  emits: ['animation-end'],
  data() {
    return {
      path: 'mrEvocon/manyAnimationsNew/data.json',
      animation: null,
      triggerAnimate: 0,
      prevAnimationName: '',
      animationQueue: [],
      playing: false,
      repeatInterval: null,
      loopTimeoutRef: null,
    };
  },
  computed: {
    currAnimation() {
      clearTimeout(this.loopTimeoutRef);
      return animationSecondsMap[this.animationName];
    },
    prevAnimation() {
      return animationSecondsMap[this.prevAnimationName];
    },
    currAnimationLength() {
      const { to, from } = this.currAnimation;
      let currAnimationLength = 0;
      if (to) {
        currAnimationLength += Math.abs(to[0] - to[1]);
      }
      if (from) {
        currAnimationLength += Math.abs(from[0] - from[1]);
      }
      return currAnimationLength;
    },
  },
  watch: {
    animationName(val, prev) {
      if (val && animationSecondsMap[val]) {
        this.initReplayInterval(this.repeatIntervalSeconds);
        if (prev && animationSecondsMap[prev]) {
          this.prevAnimationName = prev;
        }
        this.playAnimation();
      }
    },
    repeatIntervalSeconds(seconds) {
      this.initReplayInterval(seconds);
    },
  },
  created() {
    this.addAnimationToQueue();
  },
  mounted() {
    this.initReplayInterval(this.repeatIntervalSeconds);
  },
  methods: {
    initReplayInterval(intervalSeconds) {
      if (intervalSeconds > -1) {
        const intervalMs = (this.currAnimationLength + intervalSeconds) * 1000;

        const vm = this;
        this.repeatInterval = setTimeout(function repeat() {
          if (vm.repeatIntervalSeconds < 0) {
            clearTimeout(vm.repeatInterval);
          } else {
            if (vm.repeatIntervalSeconds > -1 && vm.currAnimation.from) {
              vm.animationQueue.push(vm.currAnimation.from);
            }
            vm.playAnimation();
            setTimeout(repeat, intervalMs);
          }
        }, intervalMs);
      }
    },
    playAnimation() {
      this.addAnimationToQueue();
      if (!this.playing) {
        this.triggerAnimation();
      }
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    addAnimationToQueue() {
      const animationsToPush = [];
      const { currAnimation, prevAnimation } = this;
      if (prevAnimation && prevAnimation.loopSeconds) {
        if (this.animationQueue.length && this.animationQueue[this.animationQueue.length - 1] === prevAnimation.loopSeconds) {
          this.animationQueue.pop();
        }
        clearTimeout(this.repeatInterval);
        this.playing = false;
      }
      // exception rules
      const positiveToPositive = prevAnimation && prevAnimation.type === 'positive' && this.animationName === 'positive';
      const angryToNegative = currAnimation && currAnimation.type === 'negative' && this.prevAnimationName === 'angry';
      if (prevAnimation && currAnimation) {
        if (prevAnimation.outro) {
          animationsToPush.push(prevAnimation.outro);
        }
        if (prevAnimation.type === 'negative' && !angryToNegative) {
          // all negative animations start and finish at neutral
          animationsToPush.push(prevAnimation.from);
        }
        if (prevAnimation.type === 'positive' && prevAnimation.type !== currAnimation.type) {
          // positive animations end in positive so starting from positive should always move to neutral first
          animationsToPush.push(animationSecondsMap.positive.from);
        }
        // at this point we are certainly in neutral (or positive when pos->pos)
      }
      if (currAnimation && currAnimation.to && !positiveToPositive && !angryToNegative) {
        animationsToPush.push(currAnimation.to);
      } else {
        // already neutral, do nothing
      }

      if (animationsToPush.length) {
        this.animationQueue.push(...animationsToPush);
      }
    },
    triggerAnimation() {
      if (this.animationQueue.length) {
        this.triggerAnimate = new Date().getTime();
      }
    },
    setAnimationControl(ev) {
      const vm = this;

      if (ev) this.animation = ev;
      if (this.animationQueue.length) {
        const [start, end] = this.animationQueue.shift();
        this.animation.playSegments([Math.round(start * framesPerSecond), Math.round(end * framesPerSecond)], true);
        this.playing = true;
      }
      this.animation.addEventListener('complete', () => {
        const {
          loopTimeout,
          loopSeconds,
        } = animationSecondsMap[vm.animationName];
        if (vm.animationQueue.length) {
          vm.triggerAnimation();
        } else if (loopSeconds) {
          this.loopTimeoutRef = setTimeout(() => {
            vm.animationQueue.push(loopSeconds);
            vm.triggerAnimation();
          }, (loopTimeout || 0) * 1000);
        } else {
          vm.playing = false;
          vm.$emit('animation-end');
        }
        vm.animation.removeEventListener();
      });
    },
  },
};
</script>
