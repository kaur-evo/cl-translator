import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiInformationOutline } from '@mdi/js';

import FormPageTemplate from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const defaultPropsData = {
  primarySegmentTitle: 'Primary title',
};

describe('FormPageTemplate', () => {
  it('renders', () => {
    const wrapper = shallowMount(FormPageTemplate, {
      props: { ...defaultPropsData },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(FormPageTemplate, {
      props: { ...defaultPropsData },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;
    deviceStore.screenWidth = 600;

    const wrapper = shallowMount(FormPageTemplate, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with secondary segment', () => {
    const wrapper = shallowMount(FormPageTemplate, {
      props: {
        ...defaultPropsData,
        secondarySegmentTitle: 'secondary title',
        secondarySegmentSubtitle: 'secondary subtitle',
        secondarySegmentIcon: mdiInformationOutline,
      },
      global: { plugins: [createPinia()] },
      slots: { 'secondary-segment': '<div>secondary</div>' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with tertiary segment', () => {
    const wrapper = shallowMount(FormPageTemplate, {
      props: {
        ...defaultPropsData,
        tertiarySegmentTitle: 'tertiary title',
        tertiarySegmentSubtitle: 'tertiary subtitle',
        tertiarySegmentIcon: mdiInformationOutline,
      },
      global: { plugins: [createPinia()] },
      slots: { 'tertiary-segment': '<div>tertiary</div>' },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
