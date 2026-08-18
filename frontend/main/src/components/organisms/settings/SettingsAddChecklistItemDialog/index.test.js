import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsAddChecklistItemDialog from './index.vue';

import { checkTypes } from '@/constants/checklistsConstants';
import useDeviceStore from '@/stores/device';

const createPinia = (dialogData = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: { genericDialog: { dialogData } },
  });
  useDeviceStore(pinia).isMobileView = false;
  useDeviceStore(pinia).showFullscreenDialogs = false;
  return pinia;
};

describe('SettingsAddChecklistItemDialog', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, if type is MEASUREMENT', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: { type: 'MEASUREMENT', name: 'measurement task', unit: 'unit', minVal: 10, maxVal: 100, description: 'do x, y and z' } })], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, if type is YES_NO', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: { type: 'YES_NO', name: 'yes/no task' } })], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, if type is YES_NO with warningMessage', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: { type: 'YES_NO', name: 'yes/no task with message', warningMessage: 'Contact supervisor when No is selected' } })], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, if type is TEXT', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: { type: 'TEXT', name: 'text task' } })], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, if type is CHECK', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: { type: 'CHECK', name: 'check task', description: 'do a, b and c' } })], mocks: {}, stubs: { 'form-dialog-template': false } },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is SELECTION and multipleSelection is false', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: {
        plugins: [createPinia({ itemData: { type: 'SELECTION', multipleSelection: false, name: 'selection task', selectionOptions: [{ value: 'selection 1' }, { value: 'selection 2' }] } })],
        mocks: {},
        stubs: { 'form-dialog-template': false, 'draggable-list': false, draggable: false },
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is SELECTION and multipleSelection is true', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: {
        plugins: [createPinia({ itemData: { type: 'SELECTION', multipleSelection: true, name: 'multi selection task', selectionOptions: [{ value: 'selection 1' }, { value: 'selection 2' }] } })],
        mocks: {},
        stubs: { 'form-dialog-template': false, 'draggable-list': false, draggable: false },
      },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('types computed value has six options - MEASUREMENT, YES_NO, TEXT, CHECK and SINGLE_SELECT, MULTI_SELECT', () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.types.length).toBe(6);
    expect(wrapper.vm.types[0].id).toBe(checkTypes.MEASUREMENT);
    expect(wrapper.vm.types[1].id).toBe(checkTypes.YES_NO);
    expect(wrapper.vm.types[2].id).toBe(checkTypes.TEXT);
    expect(wrapper.vm.types[3].id).toBe(checkTypes.CHECK);
    expect(wrapper.vm.types[4].id).toBe(checkTypes.SINGLE_SELECT);
    expect(wrapper.vm.types[5].id).toBe(checkTypes.MULTI_SELECT);
  });

  it('calls save method when save button is clicked', async () => {
    const wrapper = mount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()], mocks: {} },
    });
    const spy = vi.spyOn(wrapper.vm, 'onSaveClick');
    await wrapper.find('#save-button').trigger('click', spy);
    expect(wrapper.vm.onSaveClick).toHaveBeenCalledTimes(1);
  });

  it('calls close dialog method when cancel button is clicked', async () => {
    const wrapper = mount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()], mocks: {} },
    });
    const spy = vi.spyOn(wrapper.vm, 'closeDialog');
    await wrapper.find('#cancel-button').trigger('click', spy);
    expect(wrapper.vm.closeDialog).toHaveBeenCalledTimes(1);
  });

  it('calls copy method when copy button is clicked', async () => {
    const wrapper = mount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: {}, duplicate: vi.fn() })], mocks: {} },
    });
    const spy = vi.spyOn(wrapper.vm, 'onCopyClick');
    await wrapper.find('#copy-button').trigger('click', spy);
    expect(wrapper.vm.onCopyClick).toHaveBeenCalledTimes(1);
  });

  it('calls delete method when delete button is clicked', async () => {
    const wrapper = mount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia({ itemData: {}, delete: vi.fn() })], mocks: {} },
    });
    const spy = vi.spyOn(wrapper.vm, 'onDeleteClick');
    await wrapper.find('#delete-button').trigger('click', spy);
    expect(wrapper.vm.onDeleteClick).toHaveBeenCalledTimes(1);
  });

  test('that resetFormValues resets measurement specific fields if type is not MEASUREMENT', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    wrapper.vm.formData = {
      name: 'name', type: checkTypes.MEASUREMENT, unit: 'unit', minVal: 10, maxVal: 100,
      warningMessage: 'warning message', multipleSelection: true, requiredSampleCount: 5,
    };
    wrapper.vm.internalType = checkTypes.YES_NO;
    wrapper.vm.resetFormValues(checkTypes.YES_NO);
    expect(wrapper.vm.formData.unit).toBe('');
    expect(wrapper.vm.formData.minVal).toBe(null);
    expect(wrapper.vm.formData.maxVal).toBe(null);
    expect(wrapper.vm.formData.multipleSelection).toBe(true);
    expect(wrapper.vm.formData.requiredSampleCount).toBe(5);
    expect(wrapper.vm.formData.warningMessage).toBe('warning message');
  });

  test('that resetFormValues resets selectionOptions if type is not SELECTION', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    wrapper.vm.formData = { name: 'name', type: checkTypes.SELECTION, selectionOptions: [{ value: 'selection 1' }, { value: 'selection 2' }] };
    wrapper.vm.resetFormValues(checkTypes.YES_NO);
    expect(wrapper.vm.formData.selectionOptions).toEqual([]);
  });

  test('that resetFormValues resets multipleSelection, requiredSampleCount and warningMessage if type is not MEASUREMENT or YES_NO', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    wrapper.vm.formData = {
      name: 'name', type: checkTypes.YES_NO, multipleSelection: true,
      requiredSampleCount: 5, warningMessage: 'Contact supervisor immediately',
    };
    wrapper.vm.internalType = checkTypes.TEXT;
    wrapper.vm.resetFormValues(checkTypes.TEXT);
    expect(wrapper.vm.formData.multipleSelection).toBe(false);
    expect(wrapper.vm.formData.requiredSampleCount).toBe(null);
    expect(wrapper.vm.formData.warningMessage).toBe('');
  });

  test('that resetFormValues preserves multipleSelection, requiredSampleCount and warningMessage if type is YES_NO', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    await wrapper.setData({
      internalType: checkTypes.YES_NO,
      formData: { name: 'name', type: checkTypes.YES_NO, multipleSelection: true, requiredSampleCount: 5, warningMessage: 'Contact supervisor immediately' },
    });
    wrapper.vm.resetFormValues(checkTypes.YES_NO);
    expect(wrapper.vm.formData.multipleSelection).toBe(true);
    expect(wrapper.vm.formData.requiredSampleCount).toBe(5);
    expect(wrapper.vm.formData.warningMessage).toBe('Contact supervisor immediately');
  });

  test('that resetFormValues preserves multipleSelection, requiredSampleCount and warningMessage if type is MEASUREMENT', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    await wrapper.setData({
      internalType: checkTypes.MEASUREMENT,
      formData: { name: 'name', type: checkTypes.MEASUREMENT, multipleSelection: true, requiredSampleCount: 5, warningMessage: 'Check calibration' },
    });
    wrapper.vm.resetFormValues(checkTypes.MEASUREMENT);
    expect(wrapper.vm.formData.multipleSelection).toBe(true);
    expect(wrapper.vm.formData.requiredSampleCount).toBe(5);
    expect(wrapper.vm.formData.warningMessage).toBe('Check calibration');
  });

  test('that resetFormValues preserves multipleSelection if type is SELECTION', async () => {
    const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
      global: { plugins: [createPinia()] },
    });
    await wrapper.setData({
      internalType: checkTypes.MULTI_SELECT,
      formData: { name: 'name', type: checkTypes.SELECTION, multipleSelection: true },
    });
    wrapper.vm.resetFormValues(checkTypes.SELECTION);
    expect(wrapper.vm.formData.multipleSelection).toBe(true);
  });

  describe('onTypeChange', () => {
    it('sets internalType accordingly', () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.onTypeChange([checkTypes.MEASUREMENT]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.MEASUREMENT);
      wrapper.vm.onTypeChange([checkTypes.YES_NO]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.YES_NO);
      wrapper.vm.onTypeChange([checkTypes.TEXT]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.TEXT);
      wrapper.vm.onTypeChange([checkTypes.CHECK]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.CHECK);
      wrapper.vm.onTypeChange([checkTypes.SINGLE_SELECT]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.SINGLE_SELECT);
      wrapper.vm.onTypeChange([checkTypes.MULTI_SELECT]);
      expect(wrapper.vm.internalType).toEqual(checkTypes.MULTI_SELECT);
    });

    it('sets the type correctly and calls resetFormValues', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      const spy = vi.spyOn(wrapper.vm, 'resetFormValues');
      wrapper.vm.onTypeChange([checkTypes.MEASUREMENT]);
      expect(wrapper.vm.formData.type).toBe(checkTypes.MEASUREMENT);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('sets the first default selectionOption if type is SINGLE_SELECT', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.formData.selectionOptions = [];
      wrapper.vm.onTypeChange([checkTypes.SINGLE_SELECT]);
      expect(wrapper.vm.formData.selectionOptions).toEqual([{ value: '' }]);
    });

    it('sets the first default selectionOption if type is MULTI_SELECT', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.formData.selectionOptions = [];
      wrapper.vm.onTypeChange([checkTypes.MULTI_SELECT]);
      expect(wrapper.vm.formData.selectionOptions).toEqual([{ value: '' }]);
    });

    it('does not reset selectionOptions if type is changed from MULTI_SELECT to SINGLE SELECT', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.onTypeChange([checkTypes.MULTI_SELECT]);
      wrapper.vm.formData.selectionOptions = [{ value: 'option 1' }, { value: 'option 2' }];
      wrapper.vm.onTypeChange([checkTypes.SINGLE_SELECT]);
      expect(wrapper.vm.formData.selectionOptions).toEqual([{ value: 'option 1' }, { value: 'option 2' }]);
    });

    it('does not reset selectionOptions if type is changed from SINGLE_SELECT to MULTI SELECT', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.onTypeChange([checkTypes.SINGLE_SELECT]);
      wrapper.vm.formData.selectionOptions = [{ value: 'option 1' }, { value: 'option 2' }];
      wrapper.vm.onTypeChange([checkTypes.MULTI_SELECT]);
      expect(wrapper.vm.formData.selectionOptions).toEqual([{ value: 'option 1' }, { value: 'option 2' }]);
    });

    it('sets isDescriptionVisible to false if description is not set', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.isDescriptionVisible = true;
      wrapper.vm.formData.description = '';
      wrapper.vm.onTypeChange([checkTypes.YES_NO]);
      expect(wrapper.vm.isDescriptionVisible).toBe(false);
    });

    it('sets isDescriptionVisible to true if description is set', async () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      wrapper.vm.isDescriptionVisible = true;
      wrapper.vm.formData.description = 'description';
      wrapper.vm.onTypeChange([checkTypes.YES_NO]);
      expect(wrapper.vm.isDescriptionVisible).toBe(true);
    });
  });

  describe('onSaveClick', () => {
    it('clears requiredSampleCount in the payload when type is YES_NO and multipleSelection is false', async () => {
      const action = vi.fn();
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia({ action, itemData: {} })] },
      });
      vi.spyOn(wrapper.vm, 'validate').mockResolvedValue();
      await wrapper.setData({
        valid: true,
        formData: { type: checkTypes.YES_NO, name: 'yes/no task', multipleSelection: false, requiredSampleCount: 5 },
      });
      await wrapper.vm.onSaveClick();
      expect(action).toHaveBeenCalledWith(expect.objectContaining({
        type: checkTypes.YES_NO, multipleSelection: false, requiredSampleCount: null,
      }));
    });

    it('preserves requiredSampleCount in the payload when type is YES_NO and multipleSelection is true', async () => {
      const action = vi.fn();
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia({ action, itemData: {} })] },
      });
      vi.spyOn(wrapper.vm, 'validate').mockResolvedValue();
      await wrapper.setData({
        valid: true,
        formData: { type: checkTypes.YES_NO, name: 'yes/no task', multipleSelection: true, requiredSampleCount: 5 },
      });
      await wrapper.vm.onSaveClick();
      expect(action).toHaveBeenCalledWith(expect.objectContaining({
        type: checkTypes.YES_NO, multipleSelection: true, requiredSampleCount: 5,
      }));
    });

    it('clears requiredSampleCount in the payload when type is MEASUREMENT and multipleSelection is false', async () => {
      const action = vi.fn();
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia({ action, itemData: {} })] },
      });
      vi.spyOn(wrapper.vm, 'validate').mockResolvedValue();
      await wrapper.setData({
        valid: true,
        formData: { type: checkTypes.MEASUREMENT, name: 'measurement task', unit: 'kg', minVal: 0, maxVal: 100, multipleSelection: false, requiredSampleCount: 3 },
      });
      await wrapper.vm.onSaveClick();
      expect(action).toHaveBeenCalledWith(expect.objectContaining({
        type: checkTypes.MEASUREMENT, multipleSelection: false, requiredSampleCount: null,
      }));
    });
  });

  describe('setData', () => {
    it('sets data correctly if type is SELECTION and multipleSelection is true', () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      const data = { type: checkTypes.SELECTION, multipleSelection: true, selectionOptions: [{ value: 'option 1' }, { value: 'option 2' }] };
      wrapper.vm.setData(data);
      expect(wrapper.vm.formData.type).toBe(checkTypes.SELECTION);
      expect(wrapper.vm.formData.multipleSelection).toBe(true);
      expect(wrapper.vm.formData.selectionOptions).toEqual(data.selectionOptions);
      expect(wrapper.vm.internalType).toEqual(checkTypes.MULTI_SELECT);
    });

    it('sets data correctly if type is SELECTION and multipleSelection is false', () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      const data = { type: checkTypes.SELECTION, multipleSelection: false, selectionOptions: [{ value: 'option 1' }, { value: 'option 2' }] };
      wrapper.vm.setData(data);
      expect(wrapper.vm.formData.type).toBe(checkTypes.SELECTION);
      expect(wrapper.vm.formData.multipleSelection).toBe(false);
      expect(wrapper.vm.formData.selectionOptions).toEqual(data.selectionOptions);
      expect(wrapper.vm.internalType).toEqual(checkTypes.SINGLE_SELECT);
    });

    it('sets data correctly if type is not SELECTION', () => {
      const wrapper = shallowMount(SettingsAddChecklistItemDialog, {
        global: { plugins: [createPinia()] },
      });
      const data = { type: checkTypes.MEASUREMENT, name: 'measurement task', unit: 'unit', minVal: 10, maxVal: 100, description: 'do x, y and z' };
      wrapper.vm.setData(data);
      expect(wrapper.vm.formData.type).toBe(checkTypes.MEASUREMENT);
      expect(wrapper.vm.formData.name).toBe(data.name);
      expect(wrapper.vm.formData.unit).toBe(data.unit);
      expect(wrapper.vm.formData.minVal).toBe(data.minVal);
      expect(wrapper.vm.formData.maxVal).toBe(data.maxVal);
      expect(wrapper.vm.formData.description).toBe(data.description);
      expect(wrapper.vm.internalType).toEqual(checkTypes.MEASUREMENT);
    });
  });
});
