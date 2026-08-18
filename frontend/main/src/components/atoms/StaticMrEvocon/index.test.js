import { shallowMount } from '@vue/test-utils';
import { it } from 'vitest';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  state: 'positive',
  maxWidth: '150px',
  maxHeight: '150px',
  imgFolder: 'regular',
};

describe('StaticMrEvocon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('setImagePath', () => {
    it('sets imagePath correctly for regular positive state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'positive' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_happy.svg');
    });

    it('sets imagePath correctly for regular neutral state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'neutral' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_neutral.svg');
    });

    it('sets imagePath correctly for regular negative state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'negative' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_sad.svg');
    });

    it('sets imagePath correctly for regular noshift state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'noshift' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_noshift.svg');
    });

    it('sets imagePath correctly for regular rollEyes state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'rollEyes' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_rolleyes.svg');
    });

    it('sets imagePath correctly for regular random state', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, state: 'random' },
      });

      await wrapper.vm.setImagePath();

      expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_happy.svg');
    });
  });

  it('sets imagePath correctly for special positive state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'positive', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/special/happy.svg');
  });

  it('sets imagePath correctly for special neutral state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'neutral', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/special/neutral.svg');
  });

  it('sets imagePath correctly for special negative state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'negative', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/special/sad.svg');
  });

  it('sets imagePath correctly for special noshift state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'noshift', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/special/meditating.svg');
  });

  it('sets imagePath correctly for special rollEyes state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'rollEyes', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/special/neutral.svg');
  });

  it('sets imagePath correctly for special random state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'random', imgFolder: 'special' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_happy.svg');
  });

  it('sets imagePath correctly for random random state', async () => {
    const wrapper = createWrapper({
      props: { ...propsDefault, state: 'random', imgFolder: 'random' },
    });

    await wrapper.vm.setImagePath();

    expect(wrapper.vm.imagePath).toBe('/src/components/atoms/StaticMrEvocon/regular/mr-evocon_happy.svg');
  });
});
