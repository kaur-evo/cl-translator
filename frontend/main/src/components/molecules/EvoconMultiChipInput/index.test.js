import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import EvoconMultiChipInput from './index.vue';

const createPinia = () => createTestingPinia({ createSpy: vi.fn });

const mockValidationFn = (value) => value.length >= 3;

describe('EvoconMultiChipInput', () => {
  it('renders correctly when modelValue is empty', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: [],
        chipValidationFn: mockValidationFn,
        limit: 5,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when modelValue is empty and placeholder is set', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: [],
        placeholder: 'placeholder',
        chipValidationFn: mockValidationFn,
        limit: 5,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when input is not valid', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['ab'],
        chipValidationFn: mockValidationFn,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when two valid chips exist', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['valid1', 'valid2'],
        chipValidationFn: mockValidationFn,
        limit: 5,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly when one chip is invalid', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['valid1', 'ab'],
        chipValidationFn: mockValidationFn,
      },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that addEmptyChip emits new empty value with two existing chips', async () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['chip1', 'chip2'],
        chipValidationFn: mockValidationFn,
      },
    });

    await wrapper.vm.addEmptyChip();
    expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['chip1', 'chip2', '']);
  });

  test('that addEmptyChip does not emit new empty value when one is already existing', async () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['chip1', 'chip2', ''],
        chipValidationFn: mockValidationFn,
      },
    });

    await wrapper.vm.addEmptyChip();
    expect(wrapper.emitted('update:model-value')).toBeFalsy();
  });

  it('calls removeChip with correct index on blur if there are empty values', async () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['chip1', 'chip2', ''],
        chipValidationFn: mockValidationFn,
      },
    });

    const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

    await wrapper.vm.onBlur(1);
    expect(removeChip).toHaveBeenCalledTimes(0);
    await wrapper.vm.onBlur(2);
    expect(removeChip).toHaveBeenCalledTimes(1);
    expect(removeChip).toHaveBeenCalledWith(2);
  });

  it('calls removeChip with correct index and emits result', async () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['chip1', 'chip2', ''],
        chipValidationFn: mockValidationFn,
      },
    });

    await wrapper.vm.removeChip(1);
    expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['chip1', '']);
  });

  test('that onTextChipInput updates chips array on correct index and emits result', () => {
    const wrapper = shallowMount(EvoconMultiChipInput, {
      global: { plugins: [createPinia()] },
      props: {
        modelValue: ['chip1', 'chip2'],
        chipValidationFn: mockValidationFn,
      },
    });

    wrapper.vm.onTextChipInput(1, 'newchip');
    expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['chip1', 'newchip']);

    wrapper.vm.onTextChipInput(1, 'new1, new2');
    expect(wrapper.emitted('update:model-value')[1][0]).toEqual(['chip1', 'new1', 'new2']);
  });

  describe('limit prop', () => {
    describe('isLimitReached', () => {
      it('returns false when limit is 0 (default, unlimited)', () => {
        const wrapper = shallowMount(EvoconMultiChipInput, {
          global: { plugins: [createPinia()] },
          props: {
            modelValue: ['chip1', 'chip2'],
            chipValidationFn: mockValidationFn,
          },
        });

        expect(wrapper.vm.isLimitReached).toBe(false);
      });

      it('returns false when chip count is below limit', () => {
        const wrapper = shallowMount(EvoconMultiChipInput, {
          global: { plugins: [createPinia()] },
          props: {
            modelValue: ['chip1'],
            chipValidationFn: mockValidationFn,
            limit: 3,
          },
        });

        expect(wrapper.vm.isLimitReached).toBe(false);
      });

      it('returns true when chip count equals limit', () => {
        const wrapper = shallowMount(EvoconMultiChipInput, {
          global: { plugins: [createPinia()] },
          props: {
            modelValue: ['chip1', 'chip2', 'chip3'],
            chipValidationFn: mockValidationFn,
            limit: 3,
          },
        });

        expect(wrapper.vm.isLimitReached).toBe(true);
      });

      it('returns true when chip count exceeds limit', () => {
        const wrapper = shallowMount(EvoconMultiChipInput, {
          global: { plugins: [createPinia()] },
          props: {
            modelValue: ['chip1', 'chip2', 'chip3', 'chip4'],
            chipValidationFn: mockValidationFn,
            limit: 3,
          },
        });

        expect(wrapper.vm.isLimitReached).toBe(true);
      });
    });

    it('addEmptyChip does not emit when limit is reached', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
          limit: 2,
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')).toBeFalsy();
    });

    it('addEmptyChip emits when under limit', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
          limit: 3,
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['chip1', '']);
    });

    it('onTextChipInput truncates pasted values to the limit', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
          limit: 3,
        },
      });

      wrapper.vm.onTextChipInput(0, 'a, b, c, d');
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['a', 'b', 'c']);
    });

    it('onTextChipInput does not truncate when no limit is set', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      wrapper.vm.onTextChipInput(0, 'a, b, c, d');
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('isChipEmpty', () => {
    it('returns true for empty string in String chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isChipEmpty('')).toBe(true);
    });

    it('returns false for non-empty string in String chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isChipEmpty('abc')).toBe(false);
    });

    it('returns true for null in Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.isChipEmpty(null)).toBe(true);
    });

    it('returns false for a number value in Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.isChipEmpty(42)).toBe(false);
    });

    it('returns false for zero in Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.isChipEmpty(0)).toBe(false);
    });

    it('considers boolean true a non-empty chip value', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Boolean',
        },
      });

      expect(wrapper.vm.isChipEmpty(true)).toBe(false);
    });

    it('considers boolean false a non-empty chip value', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Boolean',
        },
      });

      expect(wrapper.vm.isChipEmpty(false)).toBe(false);
    });
  });

  describe('hasChipError', () => {
    it('returns false when validate is false', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['ab'],
          chipValidationFn: mockValidationFn,
          validate: false,
        },
      });

      expect(wrapper.vm.hasChipError('ab')).toBe(false);
    });

    it('returns false for empty string chip', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [''],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.hasChipError('')).toBe(false);
    });

    it('returns true for non-empty invalid chip', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['ab'],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.hasChipError('ab')).toBe(true);
    });

    it('returns false for valid chip', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['valid'],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.hasChipError('valid')).toBe(false);
    });

    it('returns false for null chip in Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [null],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.hasChipError(null)).toBe(false);
    });
  });

  describe('hasChipWarning', () => {
    it('returns false for empty string chip', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [''],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.hasChipWarning('')).toBe(false);
    });

    it('returns true for non-empty invalid chip if validate is false', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['ab'],
          chipValidationFn: mockValidationFn,
          validate: false,
        },
      });

      expect(wrapper.vm.hasChipWarning('ab')).toBe(true);
    });

    it('returns false for non-empty invalid chip if validate is true', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['ab'],
          chipValidationFn: mockValidationFn,
          validate: true,
        },
      });

      expect(wrapper.vm.hasChipWarning('ab')).toBe(false);
    });

    it('returns false for valid chip', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['valid'],
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.hasChipWarning('valid')).toBe(false);
    });

    it('returns false for null chip in Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [null],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.hasChipWarning(null)).toBe(false);
    });

    it('returns true for false chip (No) in Boolean chipType with validate false', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [false],
          chipValidationFn: (val) => val !== false,
          chipType: 'Boolean',
          validate: false,
        },
      });

      expect(wrapper.vm.hasChipWarning(false)).toBe(true);
    });

    it('returns false for true chip (Yes) in Boolean chipType with validate false', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [true],
          chipValidationFn: (val) => val !== false,
          chipType: 'Boolean',
          validate: false,
        },
      });

      expect(wrapper.vm.hasChipWarning(true)).toBe(false);
    });
  });

  describe('onUpdateChip', () => {
    it('calls onTextChipInput for String chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const onTextChipInput = vi.spyOn(wrapper.vm, 'onTextChipInput');

      wrapper.vm.onUpdateChip(0, 'newValue');
      expect(onTextChipInput).toHaveBeenCalledWith(0, 'newValue');
    });

    it('calls onValueChipInput for Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [1, 2],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      const onValueChipInput = vi.spyOn(wrapper.vm, 'onValueChipInput');

      wrapper.vm.onUpdateChip(0, 99);
      expect(onValueChipInput).toHaveBeenCalledWith(0, 99);
    });
  });

  describe('onValueChipInput', () => {
    it('updates the value at the given index and emits', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [10, 20, 30],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      wrapper.vm.onValueChipInput(1, 99);
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([10, 99, 30]);
    });
  });

  describe('onBlur', () => {
    it('does nothing when index is beyond modelValue length', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      wrapper.vm.onBlur(5);
      expect(removeChip).not.toHaveBeenCalled();
    });

    it('does not remove chip if it is not empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      wrapper.vm.onBlur(0);
      expect(removeChip).not.toHaveBeenCalled();
    });

    it('does nothing for Boolean chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [true, false],
          chipValidationFn: () => true,
          chipType: 'Boolean',
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      wrapper.vm.onBlur(0);
      expect(removeChip).not.toHaveBeenCalled();
    });

    it('removes empty chip in Number chipType on blur', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [10, null],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      wrapper.vm.onBlur(1);
      expect(removeChip).toHaveBeenCalledWith(1);
    });
  });

  describe('onKeyDown', () => {
    it('calls the correct handler for Enter key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const addEmptyChip = vi.spyOn(wrapper.vm, 'addEmptyChip');
      const event = { key: 'Enter', code: 'Enter', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(0, event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(addEmptyChip).toHaveBeenCalled();
    });

    it('calls the correct handler for Space key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const addEmptyChip = vi.spyOn(wrapper.vm, 'addEmptyChip');
      const event = { key: ' ', code: 'Space', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(0, event);
      expect(addEmptyChip).toHaveBeenCalled();
    });

    it('calls the correct handler for Backspace key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', ''],
          chipValidationFn: mockValidationFn,
        },
      });

      const handleBackspace = vi.spyOn(wrapper.vm, 'handleBackspace');
      const event = { key: 'Backspace', code: 'Backspace', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(1, event);
      expect(handleBackspace).toHaveBeenCalledWith(1, event);
    });

    it('calls the correct handler for Tab key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const handleTab = vi.spyOn(wrapper.vm, 'handleTab');
      const event = { key: 'Tab', code: 'Tab', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(0, event);
      expect(handleTab).toHaveBeenCalledWith(0, event);
    });

    it('calls the correct handler for ArrowRight key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const handleArrowRight = vi.spyOn(wrapper.vm, 'handleArrowRight');
      const event = { key: 'ArrowRight', code: 'ArrowRight', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(0, event);
      expect(handleArrowRight).toHaveBeenCalledWith(0, event);
    });

    it('calls the correct handler for ArrowLeft key', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const handleArrowLeft = vi.spyOn(wrapper.vm, 'handleArrowLeft');
      const event = { key: 'ArrowLeft', code: 'ArrowLeft', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(1, event);
      expect(handleArrowLeft).toHaveBeenCalledWith(1, event);
    });

    it('does nothing for unrecognized keys', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      const event = { key: 'a', code: 'KeyA', preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.onKeyDown(0, event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('handleTab', () => {
    it('calls addEmptyChip when last chip is focused and not empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const addEmptyChip = vi.spyOn(wrapper.vm, 'addEmptyChip');

      wrapper.vm.handleTab(1);
      expect(addEmptyChip).toHaveBeenCalled();
    });

    it('does not call addEmptyChip when non-last chip is focused', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const addEmptyChip = vi.spyOn(wrapper.vm, 'addEmptyChip');

      wrapper.vm.handleTab(0);
      expect(addEmptyChip).not.toHaveBeenCalled();
    });

    it('does not call addEmptyChip when last chip is empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', ''],
          chipValidationFn: mockValidationFn,
        },
      });

      const addEmptyChip = vi.spyOn(wrapper.vm, 'addEmptyChip');

      wrapper.vm.handleTab(1);
      expect(addEmptyChip).not.toHaveBeenCalled();
    });
  });

  describe('handleBackspace', () => {
    it('removes previous chip and focuses it when current chip is empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', ''],
          chipValidationFn: mockValidationFn,
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.handleBackspace(1, event);
      expect(removeChip).toHaveBeenCalledWith(0);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('does nothing when current chip is not empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.handleBackspace(1, event);
      expect(removeChip).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('does nothing when index is 0 and chip is empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [''],
          chipValidationFn: mockValidationFn,
        },
      });

      const removeChip = vi.spyOn(wrapper.vm, 'removeChip');

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.handleBackspace(0, event);
      expect(removeChip).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('handleArrowRight', () => {
    it('does nothing when getChipInputEl returns null', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      vi.spyOn(wrapper.vm, 'getChipInputEl').mockReturnValue(null);

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      // Should not throw
      wrapper.vm.handleArrowRight(0, event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('focuses next input when cursor is at end of value', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const nextInput = { focus: vi.fn(), setSelectionRange: vi.fn() };
      vi.spyOn(wrapper.vm, 'getChipInputEl').mockImplementation((index) => {
        if (index === 0) return { selectionStart: 5 };
        if (index === 1) return nextInput;
        return null;
      });

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
      wrapper.vm.handleArrowRight(0, event);
      expect(nextInput.focus).toHaveBeenCalled();
      expect(nextInput.setSelectionRange).toHaveBeenCalledWith(0, 0);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('does not focus next input when cursor is not at end', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      vi.spyOn(wrapper.vm, 'getChipInputEl').mockImplementation((index) => {
        if (index === 0) return { selectionStart: 2 };
        return null;
      });

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
      wrapper.vm.handleArrowRight(0, event);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
      // No next input interactions since cursor wasn't at end
    });
  });

  describe('handleArrowLeft', () => {
    it('does nothing when getChipInputEl returns null', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
        },
      });

      vi.spyOn(wrapper.vm, 'getChipInputEl').mockReturnValue(null);

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      // Should not throw
      wrapper.vm.handleArrowLeft(0, event);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('focuses previous input when cursor is at position 0', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const prevInput = { focus: vi.fn() };
      vi.spyOn(wrapper.vm, 'getChipInputEl').mockImplementation((index) => {
        if (index === 1) return { selectionStart: 0 };
        if (index === 0) return prevInput;
        return null;
      });

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      wrapper.vm.handleArrowLeft(1, event);
      expect(prevInput.focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('does not focus previous input when cursor is not at position 0', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1', 'chip2'],
          chipValidationFn: mockValidationFn,
        },
      });

      const prevInput = { focus: vi.fn() };
      vi.spyOn(wrapper.vm, 'getChipInputEl').mockImplementation((index) => {
        if (index === 1) return { selectionStart: 3 };
        if (index === 0) return prevInput;
        return null;
      });

      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
      wrapper.vm.handleArrowLeft(1, event);
      expect(prevInput.focus).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('chipComponent computed', () => {
    it('returns evocon-number-input for Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.chipComponent).toBe('evocon-number-input');
    });

    it('returns evocon-input-chip for String chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'String',
        },
      });

      expect(wrapper.vm.chipComponent).toBe('evocon-input-chip');
    });
  });

  describe('chipComponentProps computed', () => {
    it('returns useChip and allowNegative for Number chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'Number',
        },
      });

      expect(wrapper.vm.chipComponentProps).toEqual({ useChip: true, allowNegative: true });
    });

    it('returns empty object for String chipType', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          chipValidationFn: mockValidationFn,
          chipType: 'String',
        },
      });

      expect(wrapper.vm.chipComponentProps).toEqual({});
    });
  });

  describe('addEmptyChip with Boolean chipType', () => {
    it('does not emit when chipType is Boolean', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [true],
          chipValidationFn: () => true,
          chipType: 'Boolean',
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')).toBeFalsy();
    });
  });

  describe('addEmptyChip with disabled prop', () => {
    it('does not emit when disabled is true', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['chip1'],
          chipValidationFn: mockValidationFn,
          disabled: true,
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')).toBeFalsy();
    });
  });

  describe('addEmptyChip with Number chipType', () => {
    it('emits null as empty value for Number chipType', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [10],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual([10, null]);
    });

    it('does not emit when an empty (null) chip already exists', async () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [10, null],
          chipValidationFn: () => true,
          chipType: 'Number',
        },
      });

      await wrapper.vm.addEmptyChip();
      expect(wrapper.emitted('update:model-value')).toBeFalsy();
    });
  });

  describe('isValid', () => {
    it('returns true if input is not valid, but validate is false', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['ab'],
          required: false,
          chipValidationFn: mockValidationFn,
          validate: false,
        },
      });

      expect(wrapper.vm.isValid).toBe(true);
    });
    it('returns false if required is true, but model-value is empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          required: true,
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isValid).toBe(false);
    });

    it('returns true if required is false, but model-value is empty', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: [],
          required: false,
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isValid).toBe(true);
    });

    it('returns true if all chips are valid', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['valid', 'alsoValid'],
          required: false,
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isValid).toBe(true);
    });

    it('returns false if any chip is invalid', () => {
      const wrapper = shallowMount(EvoconMultiChipInput, {
        global: { plugins: [createPinia()] },
        props: {
          modelValue: ['valid', 'ab'],
          required: false,
          chipValidationFn: mockValidationFn,
        },
      });

      expect(wrapper.vm.isValid).toBe(false);
    });
  });
});
