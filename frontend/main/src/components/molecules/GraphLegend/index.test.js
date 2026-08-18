import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  modelValue: [],
  data: [],
};

describe('GraphLegend', () => {
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

  it('renders correctly with data', () => {
    const wrapper = createWrapper({
      props: {
        ...propsDefault,
        modelValue: [
          'uncommentedStop',
          'unplannedStop',
          'plannedStopIncludedInOee',
          'plannedStopNotIncludedInOee',
          'slow',
          'good',
        ],
        data: [
          {
            text: 'Kommenteerimata',
            color: '#E01C21',
            value: 'uncommentedStop',
          },
          {
            text: 'Planeerimata seisakud',
            color: '#851114',
            value: 'unplannedStop',
          },
          {
            text: 'Planeeritud seisakud (k.a OEE)',
            color: '#707070',
            value: 'plannedStopIncludedInOee',
          },
          {
            text: 'Planeeritud seisakud (v.a OEE)',
            color: '#303030',
            value: 'plannedStopNotIncludedInOee',
          },
          {
            text: 'Kiiruse kadu',
            color: '#FDD505',
            value: 'slow',
          },
          {
            text: 'Normaalkiirus',
            color: '#0AAC00',
            value: 'good',
          },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getItemIcon', () => {
    it('returns custom icon if item has icon defined', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });
      expect(wrapper.vm.getItemIcon({ icon: 'this icon is custom' })).toMatchSnapshot();
    });
    it('returns selected state icon if item is selected', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, modelValue: ['testValue'] },
      });
      expect(wrapper.vm.getItemIcon({ modelValue: 'testValue' })).toMatchSnapshot();
    });
    it('returns deselected state icon if item is deselected', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, modelValue: [] },
      });
      expect(wrapper.vm.getItemIcon({ modelValue: 'testValue' })).toMatchSnapshot();
    });
    it('returns selected state icon if item is not selectable', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, modelValue: [] },
      });
      expect(wrapper.vm.getItemIcon({})).toMatchSnapshot();
    });
  });
  describe('toggleItem', () => {
    it('emits Array with item value added if it was not part of it before', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, modelValue: [] },
      });
      wrapper.vm.toggleItem({ value: 'testValue' });
      await nextTick();
      expect(wrapper.emitted('update:model-value').length).toBe(1);
      expect(wrapper.emitted('update:model-value')[0][0]).toStrictEqual(['testValue']);
    });
    it('emits Array with item value removed if it was part of it before', async () => {
      const wrapper = createWrapper({
        props: { ...propsDefault, modelValue: ['testValue'] },
      });
      wrapper.vm.toggleItem({ value: 'testValue' });
      await nextTick();
      expect(wrapper.emitted('update:model-value').length).toBe(1);
      expect(wrapper.emitted('update:model-value')[0][0]).toStrictEqual([]);
    });
  });
});
