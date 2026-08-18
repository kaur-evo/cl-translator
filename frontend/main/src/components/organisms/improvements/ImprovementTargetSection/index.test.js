import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ImprovementTargetSection from './index.vue';

const pinia = createTestingPinia();

const defaultPropsData = {
  formData: {
    targetType: '',
    periodType: '',
    excludeNoDataDays: false,
  },
  project: { startDate: '2021-01-01' },
};

describe('ImprovementTargetSection', () => {
  test('that "onTargetTypeChange" emits "form-data-changed" event for target type', async () => {
    const wrapper = shallowMount(ImprovementTargetSection, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    await flushPromises();
    expect(wrapper.vm.formData.targetType).toBe('');
    await wrapper.vm.onTargetTypeChange('REDUCE_STOP_REASON_TO_TIME');
    expect(wrapper.emitted()['form-data-changed']).toBeTruthy();
    expect(wrapper.emitted()['form-data-changed'][3][0].targetType).toBe('REDUCE_STOP_REASON_TO_TIME');
  });

  test('that "onPeriodTypeChange" emits "form-data-changed" event for period type', async () => {
    const wrapper = shallowMount(ImprovementTargetSection, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    await flushPromises();
    expect(wrapper.vm.formData.periodType).toBe('');
    await wrapper.vm.onPeriodTypeChange('PER_STOP');
    expect(wrapper.emitted()['form-data-changed']).toBeTruthy();
    expect(wrapper.emitted()['form-data-changed'][3][0].periodType).toBe('PER_STOP');
  });

  test('that "onExcludeNoDataDaysChange" emits "form-data-changed" event for "excludeNoDataDays" prop', async () => {
    const wrapper = shallowMount(ImprovementTargetSection, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    await flushPromises();
    expect(wrapper.vm.formData.excludeNoDataDays).toBe(false);
    await wrapper.vm.onExcludeNoDataDaysChange(true);
    expect(wrapper.emitted()['form-data-changed']).toBeTruthy();
    expect(wrapper.emitted()['form-data-changed'][3][0].excludeNoDataDays).toBe(true);
  });
});
