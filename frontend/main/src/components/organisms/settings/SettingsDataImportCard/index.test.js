import { shallowMount } from '@vue/test-utils';

import SettingsDataImportCard from './index.vue';

describe('SettingsDataImportCard', () => {
  it('prop values are empty by default', () => {
    const wrapper = shallowMount(SettingsDataImportCard, {});
    expect(wrapper.vm.title).toEqual('');
    expect(wrapper.vm.orderNumber).toEqual('');
    expect(wrapper.vm.description).toEqual('');
  });

  describe('card title', () => {
    it('order number is visible if present', () => {
      const wrapper = shallowMount(SettingsDataImportCard, {
        props: { orderNumber: '1' },
      });
      expect(wrapper.find('.data-import-card-title .order-number').isVisible()).toBe(true);
      expect(wrapper.find('.data-import-card-title .order-number').text()).toEqual('1');
    });

    it('title is visible if present', () => {
      const wrapper = shallowMount(SettingsDataImportCard, {
        props: { title: 'Data import' },
      });
      expect(wrapper.find('.data-import-card-title span').isVisible()).toBe(true);
      expect(wrapper.find('.data-import-card-title span').text()).toEqual('Data import');
    });

    it('card title is hidden if order number and title is not present', () => {
      const wrapper = shallowMount(SettingsDataImportCard, {});
      expect(wrapper.find('#data-import-card-title').exists()).toBe(false);
    });
  });

  describe('card text', () => {
    it('card text is visible if description present', () => {
      const wrapper = shallowMount(SettingsDataImportCard, {
        props: { description: 'Data import' },
      });
      expect(wrapper.find('.data-import-card-text').isVisible()).toBe(true);
      expect(wrapper.find('.data-import-card-text').text()).toContain('Data import');
    });

    it('card text is invisible if description not present', () => {
      const wrapper = shallowMount(SettingsDataImportCard, {

      });
      expect(wrapper.find('#data-import-card-text').exists()).toBe(false);
    });
  });
});
