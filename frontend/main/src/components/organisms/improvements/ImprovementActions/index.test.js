import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementsActions from './index.vue';

import improvementsActionsTemplateApi from '@/api/improvementsActionsTemplateApi';

vi.mock('@/api/improvementsActionsTemplateApi');
improvementsActionsTemplateApi.listActionTemplates = () => ([{ id: 1 }]);

const defaultInitialState = {
  improvementsActions: {
    actions: [],
  },
};

describe('ImprovementsActions', () => {
  it('renders empty state correctly for user who can edit', async () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementsActions, {

      global: { plugins: [pinia] },

      props: {
        canEdit: true,
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders empty state correctly for user who cannot edit', async () => {
    const pinia = createTestingPinia({ initialState: { ...defaultInitialState } });
    const wrapper = shallowMount(ImprovementsActions, {
      global: { plugins: [pinia] },
      props: {
        canEdit: false,
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });
});
