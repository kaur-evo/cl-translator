import { shallowMount } from '@vue/test-utils';

import SettingsPasscodeGenerationDialog from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    initialState: {
      genericDialog: {
        dialogData: {
          passcode: '1234',
        },
      },
    },
  },
});

const createWrapper = (options) => shallowMount(SettingsPasscodeGenerationDialog, {
  global: {
    ...global,
    stubs: { 'form-dialog-template': false },
  },
  ...options,
});

describe('SettingsPasscodeGenerationDialog', () => {
  it('renders', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.element).toMatchSnapshot();
  });
});
