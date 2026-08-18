import { shallowMount } from '@vue/test-utils';

import CheckCardChips from './index.vue';

import { checkTypes } from '@/constants/checklistsConstants';

const defaultProps = {
  itemType: checkTypes.YES_NO,
  isMultipleSelection: false,
  modelValue: [true],
  disabled: false,
  notApplicableSelected: false,
  dense: false,
  limit: 0,
};

describe('CheckCardChips', () => {
  it('renders correctly with yes/no single selection', () => {
    const wrapper = shallowMount(CheckCardChips, {
      props: { ...defaultProps },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with yes/no multiple selection', () => {
    const wrapper = shallowMount(CheckCardChips, {
      props: { ...defaultProps, isMultipleSelection: true },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with check type', () => {
    const wrapper = shallowMount(CheckCardChips, {
      props: { ...defaultProps, itemType: checkTypes.CHECK },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  describe('singleChipGroupModelValue for CHECK type', () => {
    it('passes modelValue through directly for CHECK type', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, itemType: checkTypes.CHECK, modelValue: true },
      });

      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBe(true);
    });

    it('passes null through for CHECK type when modelValue is null', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, itemType: checkTypes.CHECK, modelValue: null },
      });

      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBeNull();
    });
  });

  describe('single-select YES_NO modelValue unwrapping', () => {
    it('passes null to chip-group when modelValue is an empty array', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [] },
      });

      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBeNull();
    });

    it('passes true to chip-group when modelValue is [true]', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [true] },
      });

      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBe(true);
    });

    it('passes false to chip-group when modelValue is [false]', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [false] },
      });

      // false is not nullish, so ?? null should not replace it with null
      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBe(false);
    });

    it('does not crash and passes null to chip-group when modelValue is null', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: null },
      });

      expect(wrapper.findComponent({ name: 'VChipGroup' }).props('modelValue')).toBeNull();
    });
  });

  describe('single-select YES_NO update:model-value emit', () => {
    it('emits [true] when chip-group selects true', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [] },
      });

      await wrapper.findComponent({ name: 'VChipGroup' }).vm.$emit('update:model-value', true);

      expect(wrapper.emitted('update:model-value')).toEqual([[[true]]]);
    });

    it('emits [false] when chip-group selects false', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [] },
      });

      await wrapper.findComponent({ name: 'VChipGroup' }).vm.$emit('update:model-value', false);

      expect(wrapper.emitted('update:model-value')).toEqual([[[false]]]);
    });

    it('emits [] when chip-group deselects (emits undefined)', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, modelValue: [true] },
      });

      await wrapper.findComponent({ name: 'VChipGroup' }).vm.$emit('update:model-value', undefined);

      expect(wrapper.emitted('update:model-value')).toEqual([[[]]]);
    });
  });

  describe('single-select CHECK update:model-value emit', () => {
    it('emits true directly when chip-group selects true', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, itemType: checkTypes.CHECK, modelValue: null },
      });

      await wrapper.findComponent({ name: 'VChipGroup' }).vm.$emit('update:model-value', true);

      expect(wrapper.emitted('update:model-value')).toEqual([[true]]);
    });

    it('emits undefined directly when chip-group deselects', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, itemType: checkTypes.CHECK, modelValue: true },
      });

      await wrapper.findComponent({ name: 'VChipGroup' }).vm.$emit('update:model-value', undefined);

      expect(wrapper.emitted('update:model-value')).toEqual([[undefined]]);
    });
  });

  describe('multi-select YES_NO update:model-value emit', () => {
    it('emits modelValue with true appended when Yes chip is clicked', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [false] },
      });

      await wrapper.findAllComponents({ name: 'EvoconVChip' })[0].vm.$emit('click', { stopPropagation: () => {} });

      expect(wrapper.emitted('update:model-value')).toEqual([[[false, true]]]);
    });

    it('emits modelValue with false appended when No chip is clicked', async () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [true] },
      });

      await wrapper.findAllComponents({ name: 'EvoconVChip' })[1].vm.$emit('click', { stopPropagation: () => {} });

      expect(wrapper.emitted('update:model-value')).toEqual([[[true, false]]]);
    });
  });

  describe('isLimitReached', () => {
    it('returns false when limit is 0', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [true, false], limit: 0 },
      });

      expect(wrapper.vm.isLimitReached).toBe(false);
    });

    it('returns false when modelValue length is below limit', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [true], limit: 3 },
      });

      expect(wrapper.vm.isLimitReached).toBe(false);
    });

    it('returns true when modelValue length reaches limit', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [true, false, true], limit: 3 },
      });

      expect(wrapper.vm.isLimitReached).toBe(true);
    });

    it('returns true when modelValue length exceeds limit', () => {
      const wrapper = shallowMount(CheckCardChips, {
        props: { ...defaultProps, isMultipleSelection: true, modelValue: [true, false, true, false], limit: 3 },
      });

      expect(wrapper.vm.isLimitReached).toBe(true);
    });
  });
});
