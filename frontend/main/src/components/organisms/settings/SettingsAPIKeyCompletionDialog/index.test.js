import { shallowMount } from '@vue/test-utils';

import SettingsAPIKeyCompletionDialog from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal({
  piniaOptions: {
    stubActions: false,
    initialState: {
      genericDialog: {
        dialogData: {
          APIKey: { keyId: 'asd123', secret: '123asd' },
        },
      },
      APIKeys: {
        APIKeys: [{ keyId: 'asd123', secret: '123asd' }],
      },
    },
  },
});

const createWrapper = (options) => shallowMount(SettingsAPIKeyCompletionDialog, {
  global: { ...global, stubs: { 'form-dialog-template': false } },
  ...options,
});

describe('SettingsAPIKeyCompletionDialog', () => {
  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });
});
