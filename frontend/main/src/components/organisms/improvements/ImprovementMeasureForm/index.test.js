import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementMeasureForm from './index.vue';

import createGlobal from '@/helpers/createGlobal';
import { ACTION, SOLUTION } from '@/constants/improvementsMeasureTypes';

const defaultDialogData = {
  isEdit: false,
  measureType: '',
  users: [{ userId: 1 }, { userId: 2 }],
  saveCB: () => vi.fn(),
  measure: {
    responsibleUsers: [{ userId: 1 }],
  },
};

describe('ImprovementMeasureForm', () => {
  const global = createGlobal({
    piniaOptions: {
      initialState: {
        genericDialog: {
          dialogData: { ...defaultDialogData },
        },
      },
    },
  });

  const createWrapper = (options) => shallowMount(ImprovementMeasureForm, {
    global: { ...global },
    ...options,
  });

  const propsDefault = {};

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly when measure type is ACTION', () => {
    const pinia = createTestingPinia({
      initialState: {
        genericDialog: {
          dialogData: { ...defaultDialogData, measureType: ACTION },
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when measure type is ACTION and is edit view', () => {
    const pinia = createTestingPinia({
      initialState: {
        genericDialog: {
          dialogData: { ...defaultDialogData, isEdit: true, measureType: ACTION },
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when measure type is SOLUTION', () => {
    const pinia = createTestingPinia({
      initialState: {
        genericDialog: {
          dialogData: { ...defaultDialogData, measureType: SOLUTION },
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when measure type is SOLUTION and is edit view', () => {
    const pinia = createTestingPinia({
      initialState: {
        genericDialog: {
          dialogData: { ...defaultDialogData, isEdit: true, measureType: SOLUTION },
        },
      },
    });
    const wrapper = createWrapper({
      props: { ...propsDefault },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('saveMeasure', () => {
    const startDate = '2022-01-01';
    const deadline = '2022-02-02';
    const description = 'description value';

    test('does not set currentMeasure properties when description is empty', async () => {
      const pinia = createTestingPinia({
        initialState: {
          genericDialog: {
            dialogData: { ...defaultDialogData },
          },
        },
      });
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: { plugins: [pinia] },
      });

      await wrapper.vm.saveMeasure();

      expect(wrapper.vm.currentMeasure).toEqual({
        startDate: null,
        description: '',
        deadline: null,
        responsibleUsers: [{ userId: 1 }],
      });
    });

    test('sets description, projectId, startDate when dialogData isEdit is false and measureType is not Action', async () => {
      const $route = { params: { id: 1 } };
      const pinia = createTestingPinia({
        initialState: {
          genericDialog: {
            dialogData: { ...defaultDialogData },
          },
        },
      });
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: { plugins: [pinia], mocks: { $route } },
        data() {
          return {
            currentMeasure: { description, startDate, deadline },
          };
        },
      });

      await wrapper.vm.saveMeasure();

      expect(wrapper.vm.currentMeasure).toEqual({ description, projectId: 1, startDate });
    });

    test('sets description, projectId, ordering, responsibleUsers, deadline when dialogData isEdit is false and measureType is Action', async () => {
      const $route = { params: { id: 1 } };
      const pinia = createTestingPinia({
        initialState: {
          genericDialog: {
            dialogData: { ...defaultDialogData, measureType: ACTION },
          },
        },
      });
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: { plugins: [pinia], mocks: { $route } },
        data() {
          return {
            currentMeasure: { description, startDate, deadline },
          };
        },
      });

      await wrapper.vm.saveMeasure();

      expect(wrapper.vm.currentMeasure).toEqual({
        description,
        projectId: 1,
        ordering: null,
        responsibleUsers: [{ userId: 1 }],
        deadline,
      });
    });

    test('sets responsibleUsers when dialogData isEdit is true and measureType is Action', async () => {
      const $route = { params: { id: 1 } };
      const pinia = createTestingPinia({
        initialState: {
          genericDialog: {
            dialogData: { ...defaultDialogData, measureType: ACTION, isEdit: true },
          },
        },
      });
      const wrapper = createWrapper({
        props: { ...propsDefault },
        global: { plugins: [pinia], mocks: { $route } },
        data() {
          return {
            currentMeasure: { description, startDate, deadline },
          };
        },
      });

      await wrapper.vm.saveMeasure();

      expect(wrapper.vm.currentMeasure).toEqual({
        description,
        startDate,
        deadline,
        responsibleUsers: [{ userId: 1 }],
      });
    });
  });
});
