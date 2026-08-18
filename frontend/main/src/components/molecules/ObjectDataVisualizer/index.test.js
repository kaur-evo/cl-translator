import { shallowMount } from '@vue/test-utils';

import ObjectDataVisualizer from './index.vue';

describe('ObjectDataVisualizer', () => {
  it('renders', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: {},
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when value is empty', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when value is not empty', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when value has array', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: [{ key: 'subKey1', value: 'subValue1' }, { key: 'subKey2', value: 'subValue2' }] },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if value is unchanged', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [
          { key: 'key1', value: 'value1', unchanged: true },
          { key: 'key2', value: 'value2' },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with key prefix', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [
          {
            key: 'key1', value: 'value1', keyPrefix: 'prefix1', prefixClass: 'class1',
          },
          { key: 'key2', value: 'value2' },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly without key', () => {
    const wrapper = shallowMount(ObjectDataVisualizer, {
      props: {
        value: [
          {
            key: '', value: [{ key: 'subKey1', value: 'subValue1' }, { key: 'subKey2', value: 'subValue2' }],
          },
          { key: 'key2', value: 'value2' },
        ],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('getEntryKey', () => {
    it('returns key with colon if isSubheader is not defined', () => {
      const wrapper = shallowMount(ObjectDataVisualizer, {
        props: {
          value: [
            { key: 'testKey' },
          ],
        },
      });

      expect(wrapper.vm.getEntryKey(wrapper.vm.value[0])).toBe('testKey: ');
    });

    it('returns key with colon for non-subheader entries', () => {
      const wrapper = shallowMount(ObjectDataVisualizer, {
        props: {
          value: [
            { key: 'testKey', isSubheader: false },
          ],
        },
      });

      expect(wrapper.vm.getEntryKey(wrapper.vm.value[0])).toBe('testKey: ');
    });

    it('returns key without colon for subheader entries', () => {
      const wrapper = shallowMount(ObjectDataVisualizer, {
        props: {
          value: [
            { key: 'testKey', isSubheader: true },
          ],
        },
      });

      expect(wrapper.vm.getEntryKey(wrapper.vm.value[0])).toBe('testKey');
    });
  });
});
