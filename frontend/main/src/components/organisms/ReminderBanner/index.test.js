import { shallowMount } from '@vue/test-utils';
import { mdiAlert } from '@mdi/js';
import { useDisplay } from 'vuetify';
import { ref } from 'vue';

import ReminderBanner from './index.vue';

vi.mock('vuetify', () => ({
  useDisplay: vi.fn(),
}));

const defaultProps = {
  icon: mdiAlert,
  iconColor: 'secondary',
  bannerColor: 'snackbar-yellow',
  text: 'This is a reminder banner.',
  clickable: false,
};

describe('ReminderBanner', () => {
  beforeEach(() => {
    useDisplay.mockReturnValue({
      smAndDown: ref(false),
    });
  });

  it('renders correctly when visible', () => {
    const wrapper = shallowMount(ReminderBanner, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when clickable', () => {
    const wrapper = shallowMount(ReminderBanner, {
      props: { ...defaultProps, clickable: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('height', () => {
    it('returns 40 for default screens', () => {
      const wrapper = shallowMount(ReminderBanner, {
        props: { ...defaultProps },
      });

      expect(wrapper.vm.height).toBe(40);
    });

    it('returns 64 for small screens', () => {
      useDisplay.mockReturnValue({
        smAndDown: ref(true),
      });

      const wrapper = shallowMount(ReminderBanner, {
        props: { ...defaultProps },
      });

      expect(wrapper.vm.height).toBe(64);
    });
  });
});
