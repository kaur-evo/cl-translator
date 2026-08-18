import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiInformationOutline } from '@mdi/js';

import FormDialogTemplate from './index.vue';

import { useDeviceStore } from '@/stores/index';

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    genericDialog: { allowFullscreen: false },
    ...overrides,
  },
});

const propsDefault = {
  primarySegmentTitle: 'string',
  primarySegmentSubtitle: 'string',
};

describe('FormDialogTemplate', () => {
  it('renders', () => {
    const wrapper = shallowMount(FormDialogTemplate, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(FormDialogTemplate, {
      props: { ...propsDefault },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const pinia = createPinia({ genericDialog: { allowFullscreen: true } });
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;
    deviceStore.showFullscreenDialogs = true;

    const wrapper = shallowMount(FormDialogTemplate, {
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with secondary segment', () => {
    const wrapper = shallowMount(FormDialogTemplate, {
      props: {
        ...propsDefault,
        secondarySegmentTitle: 'secondary title',
        secondarySegmentSubtitle: 'secondary subtitle',
        secondarySegmentSubtitleIcon: mdiInformationOutline,
      },
      global: { plugins: [createPinia()] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
});
