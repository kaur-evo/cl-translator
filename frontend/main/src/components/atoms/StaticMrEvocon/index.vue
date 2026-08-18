<template>
  <img
    :src="imagePath"
    :style="{ 'max-width': maxWidth, 'max-height': maxHeight }"
    alt="mr-evocon"
  >
</template>

<script>
export default {
  name: 'StaticMrEvocon',
  props: {
    state: {
      type: String,
      default: 'positive',
    },
    maxWidth: {
      type: [String],
      default: '150px',
    },
    maxHeight: {
      type: [String],
      default: '150px',
    },
    imgFolder: {
      type: String,
      default: 'regular',
    },
  },
  data() {
    return {
      imagePath: '',
    };
  },
  watch: {
    imgFolder() {
      this.setImagePath();
    },
    state() {
      this.setImagePath();
    },
  },
  created() {
    this.setImagePath();
  },
  methods: {
    async setImagePath() {
      const paths = {
        regular: {
          neutral: () => import('./regular/mr-evocon_neutral.svg'),
          positive: () => import('./regular/mr-evocon_happy.svg'),
          negative: () => import('./regular/mr-evocon_sad.svg'),
          noshift: () => import('./regular/mr-evocon_noshift.svg'),
          rollEyes: () => import('./regular/mr-evocon_rolleyes.svg'),
        },
        special: {
          neutral: () => import('./special/neutral.svg'),
          positive: () => import('./special/happy.svg'),
          negative: () => import('./special/sad.svg'),
          noshift: () => import('./special/meditating.svg'),
          rollEyes: () => import('./special/neutral.svg'),
        },
      };
      if (paths[this.imgFolder] && paths[this.imgFolder][this.state]) {
        this.imagePath = (await paths[this.imgFolder][this.state]()).default;
      } else {
        this.imagePath = (await paths.regular.positive()).default;
      }
    },
  },
};
</script>
