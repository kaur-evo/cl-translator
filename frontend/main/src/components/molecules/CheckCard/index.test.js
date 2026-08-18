import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiAlert, mdiInformationOutline } from '@mdi/js';
import { nextTick } from 'vue';

import CheckCard from './index.vue';

import { checkTypes } from '@/constants/checklistsConstants';
import colorConstants from '@/constants/colorConstants';
import checklistApi from '@/api/checklistApi';
import { useDeviceStore } from '@/stores/index';


vi.mock('@/api/checklistApi');
const postChecklistFile = vi.fn();
checklistApi.postChecklistFile = postChecklistFile;

vi.mock('@/helpers/localStorage/getItemsFromLocalStorageArray', () => ({
  default: () => [],
}));

const mockFile = (fileName = 'test.jpg', size = 1000, type = 'image/jpeg') => new File([new ArrayBuffer(size)], fileName, { type });

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: {
    profile: { currentUser: { groupSeparator: ' ', decimalSeparator: ',', decimalPlaces: 2, pctDecimalPlaces: 2 } },
    ...overrides,
  },
});

describe('CheckCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders correctly, when type is YES_NO', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: true, value: [true], name: 'Check paint', type: 'YES_NO',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is YES_NO and "not applicable" chip is visible', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: [false], name: 'Check paint', type: 'YES_NO', notApplicableEnabled: true,
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is MEASUREMENT', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: [11], minVal: 7, maxVal: 10, unit: 'tk', name: 'Check paint', type: 'MEASUREMENT',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is MEASUREMENT and "not applicable" chip is visible', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: true, value: [8], minVal: 7, maxVal: 10, name: 'Check paint', type: 'MEASUREMENT', notApplicableEnabled: true,
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is MEASUREMENT, item has warningMessage and value is out of range', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false,
          value: [11],
          minVal: 7,
          maxVal: 10,
          name: 'Check paint',
          type: 'MEASUREMENT',
          notApplicableEnabled: true,
          warningMessage: 'Value is out of range, so warning message is shown',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is YES_NO, item has warningMessage and No is selected', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false,
          value: [false],
          name: 'Safety check',
          type: 'YES_NO',
          notApplicableEnabled: true,
          warningMessage: 'Contact supervisor immediately when No is selected',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is TEXT', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: true, value: 'test value', name: 'Check paint', type: 'TEXT',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is TEXT and "not applicable" chip is visible', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: 'test value', name: 'Check paint', type: 'TEXT', notApplicableEnabled: true, description: 'test description',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is CHECK', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: false, name: 'Check paint', type: 'CHECK',
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly, when type is CHECK and "not applicable" chip is visible', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: true, value: true, name: 'Check paint', type: 'CHECK', notApplicableEnabled: true,
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is SELECTION and multipleSelection is false', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: 'selected', name: 'Select items', type: checkTypes.SELECTION, multipleSelection: false, options: ['selected', 'not selected'],
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if type is SELECTION and multipleSelection is true', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: null, name: 'Select items', type: checkTypes.SELECTION, multipleSelection: true, options: ['selected', 'not selected'], notApplicableEnabled: true,
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with images selected', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: true,
          value: ['selected'],
          name: 'Select items',
          type: checkTypes.SELECTION,
          multipleSelection: false,
          options: ['selected', 'not selected'],
          attachmentsEnabled: true,
        },
        disabled: false,
        orderNumber: 1,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    await wrapper.setData({ selectedFiles: [{ fileName: 'image1.jpg', error: false }, { fileName: 'image2.jpg', error: true }] });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that CheckCard doesnt have check number, when orderNumber prop doesnt exist', () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: { item: { name: 'Check paint' }, checklistId: 'asd-asd-gdf' },
    });
    expect(wrapper.find('#check-number').exists()).toBe(false);
  });

  test('if CheckCard check number background is white when value is not selected', () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: { item: { name: 'Check paint', value: null }, checklistId: 'asd-asd-gdf' },
    });
    expect(wrapper.vm.checkNumberColor).toBe('white');
  });

  test('if CheckCard check number background is orange when value is false', () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: { item: { name: 'Check paint', value: false, successful: false }, checklistId: 'asd-asd-gdf' },
    });
    expect(wrapper.vm.checkNumberColor).toBe('lw-orange');
  });

  test('if CheckCard check number background is orange when type is MEASUREMENT and value is out of preferred range', () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: {
        item: {
          name: 'Check paint', value: [11], minVal: 7, maxVal: 10, successful: false, type: 'MEASUREMENT',
        },
        checklistId: 'asd-asd-gdf',
      },
    });
    expect(wrapper.vm.checkNumberColor).toBe('lw-orange');
  });

  test('if CheckCard check number background is white when type is TEXT and value is empty', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: '', successful: false, type: 'TEXT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('white');
  });

  test('if CheckCard check number background is green when value is true', () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: { item: { name: 'Check paint', value: true, successful: true }, checklistId: 'asd-asd-gdf' },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is green when type is MEASUREMENT and value is in preferred range', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [8], minVal: 7, maxVal: 10, successful: true, type: 'MEASUREMENT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is GREEN when type is TEXT and value prop has text', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: 'test text', successful: true, type: 'TEXT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is white when type is SELECTION and value is empty array', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Select items', value: [], successful: false, type: checkTypes.SELECTION,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('white');
  });

  test('if CheckCard check number background is colored when type is SELECTION and value has items', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Select items', value: ['option1'], successful: true, type: checkTypes.SELECTION,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is lw-orange when type is SELECTION and not successful', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Select items', value: ['option1'], successful: false, type: checkTypes.SELECTION,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('lw-orange');
  });

  test('if CheckCard check number background is white when YES_NO with multipleSelection and value is empty array', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [], successful: false, type: checkTypes.YES_NO, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('white');
  });

  test('if CheckCard check number background is colored when YES_NO with multipleSelection and value has entries', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [true], successful: true, type: checkTypes.YES_NO, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is lw-orange when YES_NO with multipleSelection and not successful', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [false], successful: false, type: checkTypes.YES_NO, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('lw-orange');
  });

  test('if CheckCard check number background is white when MEASUREMENT with multipleSelection and value is empty array', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [], successful: false, type: checkTypes.MEASUREMENT, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('white');
  });

  test('if CheckCard check number background is colored when MEASUREMENT with multipleSelection and value has entries', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [8], minVal: 7, maxVal: 10, successful: true, type: checkTypes.MEASUREMENT, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('primary');
  });

  test('if CheckCard check number background is lw-orange when MEASUREMENT with multipleSelection and not successful', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: [99], minVal: 7, maxVal: 10, successful: false, type: checkTypes.MEASUREMENT, multipleSelection: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.checkNumberColor).toBe('lw-orange');
  });

  test('that input has defined value, when type is MEASUREMENT', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          successful: false, value: 11, minVal: 7, maxVal: 10, name: 'Check paint', type: 'MEASUREMENT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.vm.inputValue).toEqual([11]);
  });

  test('that comment button is visible and comment input is hidden, when item doesnt have comment', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: 'test value', successful: false, comment: '',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.find('#check-comment-btn').isVisible()).toBe(true);
    expect(wrapper.find('#check-comment-input').exists()).toBe(false);
  });

  test('that comment button and comment input are visible, when item has comment', async () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: 'test value', successful: false, comment: 'has a comment',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    await flushPromises();
    expect(wrapper.find('#check-comment-btn').isVisible()).toBe(true);
    expect(wrapper.find('#check-comment-input').isVisible()).toBe(true);
  });

  test('that comment button click shows comment input', async () => {
    const wrapper = shallowMount(CheckCard, {
      global: { plugins: [createPinia()] },
      props: { item: { name: 'Check paint', value: 'test value', successful: false }, checklistId: 'asd-asd-gdf' },
    });

    await flushPromises();
    expect(wrapper.find('#check-comment-btn').isVisible()).toBe(true);
    expect(wrapper.find('#check-comment-input').exists()).toBe(false);
    await wrapper.find('#check-comment-btn').trigger('click');
    expect(wrapper.find('#check-comment-input').isVisible()).toBe(true);
  });

  it('renders disabled state correctly when type is YES_NO', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: null, successful: null, comment: '', type: 'YES_NO', attachmentsEnabled: true,
        },
        disabled: true,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders disabled state correctly when type is CHECK', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: null, successful: null, comment: '', type: 'CHECK',
        },
        disabled: true,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders disabled state correctly when type is MEASUREMENT', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', minVal: 10000.4567, maxVal: 12089.3323, value: 1234, successful: false, comment: 'has a comment', type: 'MEASUREMENT',
        },
        disabled: true,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('renders disabled state correctly when type is TEXT', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint', value: 'test value', successful: false, comment: 'has a comment', type: 'TEXT',
        },
        disabled: true,
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('it renders correctly in mobile with images and warning', () => {
    const pinia = createPinia();
    const deviceStore = useDeviceStore(pinia);
    deviceStore.isMobileView = true;

    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint',
          value: ['test.jpg'],
          type: 'SELECTION',
          attachmentsEnabled: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [pinia] },
    });

    wrapper.setData({
      selectedFiles: [mockFile('test1.jpg'), mockFile('test2.jpg')],
      showFileLimitWarning: true,
      showFileSizeWarning: false,
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('input value after shallowMounting if type is MEASUREMENT and value is 0', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check smth', value: 0, successful: false, comment: '', type: 'MEASUREMENT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.inputValue).toEqual([0]);
  });

  test('input value after shallowMounting if type is MEASUREMENT and value is not set', () => {
    const wrapper = shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check smth', value: null, successful: false, comment: '', type: 'MEASUREMENT',
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.vm.inputValue).toEqual([]);
  });

  describe('isArrayValueType', () => {
    const arrayValueTypes = [checkTypes.SELECTION, checkTypes.MEASUREMENT, checkTypes.YES_NO];
    const nonArrayValueTypes = [checkTypes.TEXT, checkTypes.CHECK];

    arrayValueTypes.forEach((type) => {
      it(`returns true when item type is ${type}`, () => {
        const wrapper = shallowMount(CheckCard, {
          props: {
            item: { name: 'Test', type, value: null },
            checklistId: 'test-id',
          },
          global: { plugins: [createPinia()] },
        });
        expect(wrapper.vm.isArrayValueType).toBe(true);
      });
    });

    nonArrayValueTypes.forEach((type) => {
      it(`returns false when item type is ${type}`, () => {
        const wrapper = shallowMount(CheckCard, {
          props: {
            item: { name: 'Test', type, value: null },
            checklistId: 'test-id',
          },
          global: { plugins: [createPinia()] },
        });
        expect(wrapper.vm.isArrayValueType).toBe(false);
      });
    });
  });

  describe('hasValue', () => {
    it('returns false for MEASUREMENT type with empty array', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.MEASUREMENT, value: [] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(false);
    });

    it('returns true for MEASUREMENT type with values', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.MEASUREMENT, value: [5] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(true);
    });

    it('returns false for YES_NO type with empty array', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.YES_NO, value: [] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(false);
    });

    it('returns true for YES_NO type with values', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.YES_NO, value: [true] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(true);
    });

    it('returns false for SELECTION type with empty array', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.SELECTION, value: [] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(false);
    });

    it('returns true for SELECTION type with values', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.SELECTION, value: ['option1'] },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(true);
    });

    it('returns falsy for TEXT type with null value', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.TEXT, value: null },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBeFalsy();
    });

    it('returns truthy for TEXT type with a value', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.TEXT, value: 'some text' },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBeTruthy();
    });

    it('returns true for CHECK type with boolean false value', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Test', type: checkTypes.CHECK, value: false },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.hasValue).toBe(true);
    });
  });

  describe('getInputValue', () => {
    it('returns null if type is TEXT and value is null', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint', value: null, successful: false, comment: '', type: 'TEXT',
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.getInputValue()).toBe(null);
    });

    it('returns value if type is TEXT and value is not empty', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint', value: 'tesst texts', successful: false, comment: '', type: 'TEXT',
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.getInputValue()).toBe('tesst texts');
    });

    it('returns empty array if type is SELECTION and value is null', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint', value: null, successful: false, comment: '', type: 'SELECTION',
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.getInputValue()).toEqual([]);
    });

    it('returns value if type is SELECTION and value is not empty', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint', value: ['one'], successful: false, comment: '', type: 'TEXT',
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.vm.getInputValue()).toEqual(['one']);
    });
  });

  describe('updated', () => {
    it('does not call notApplicableChipChanged if valueNotApplicable is not changed', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { value: 'text', type: 'TEXT', valueNotApplicable: false },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      const spy = vi.spyOn(wrapper.vm, 'notApplicableChipChanged');
      await wrapper.setProps({ item: { value: 'new text', type: 'TEXT', valueNotApplicable: false } });
      expect(spy).not.toHaveBeenCalled();
    });

    it('calls notApplicableChipChanged if valueNotApplicable is changed', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { value: 'text', type: 'TEXT', valueNotApplicable: false },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      const spy = vi.spyOn(wrapper.vm, 'notApplicableChipChanged');
      await wrapper.setProps({ item: { value: 'text', type: 'TEXT', valueNotApplicable: true } });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('fileInfoBlock', () => {
    it('should return correct file info block when showFileLimitWarning is false and showFileSizeWarning is false', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            value: ['test.jpg'],
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      await wrapper.setData({ showFileLimitWarning: false, showFileSizeWarning: false });
      expect(wrapper.vm.fileInfoBlock).toEqual({
        visible: false,
        icon: mdiAlert,
        color: colorConstants.dark['lw-orange'],
        body: '',
      });
    });

    it('should return correct file info block when showFileLimitWarning is false and showFileSizeWarning is true', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            value: ['test.jpg'],
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      await wrapper.setData({ showFileLimitWarning: false, showFileSizeWarning: true });
      expect(wrapper.vm.fileInfoBlock).toEqual({
        visible: true,
        icon: mdiInformationOutline,
        color: colorConstants.dark.error,
        body: 'Maximum file size: {value}MB.',
      });
    });

    it('should return correct file info block when showFileLimitWarning is true and showFileSizeWarning is false', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            value: ['test.jpg'],
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      await wrapper.setData({ showFileLimitWarning: true, showFileSizeWarning: false });
      expect(wrapper.vm.fileInfoBlock).toEqual({
        visible: true,
        icon: mdiAlert,
        color: colorConstants.dark['lw-orange'],
        body: 'Upload up to {value} files.',
      });
    });

    it('should return correct file info block when showFileLimitWarning is true and showFileSizeWarning is true', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            value: ['test.jpg'],
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });
      await wrapper.setData({ showFileLimitWarning: true, showFileSizeWarning: true });
      expect(wrapper.vm.fileInfoBlock).toEqual({
        visible: true,
        icon: mdiInformationOutline,
        color: colorConstants.dark.error,
        body: 'Upload up to {value} files. Maximum file size: {value}MB.',
      });
    });
  });

  describe('removeFile', () => {
    it('removes correct file', async () => {
      const file1 = mockFile('test1.jpg');
      const file2 = mockFile('test2.jpg');
      const file3 = mockFile('test3.jpg');

      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          files: [file1, file2, file3],
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.selectedFiles).toEqual([file1, file2, file3]);
      await wrapper.vm.removeFile(file2, 1);
      expect(wrapper.vm.selectedFiles).toEqual([file1, file3]);
      await wrapper.vm.removeFile({}, 7);
      expect(wrapper.vm.selectedFiles).toEqual([file1, file3]);
    });

    it('emits file-removed', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      const file = mockFile('test1.jpg');
      await wrapper.vm.removeFile(file, 0);
      expect(wrapper.emitted('file-removed')).toBeTruthy();
      expect(wrapper.emitted('file-removed')[0]).toEqual([{ file, index: 0 }]);
    });

    it('sets showFileLimitWarning to false when removing a file', async () => {
      const file1 = mockFile('test1.jpg');
      const file2 = mockFile('test2.jpg');

      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.setData({
        selectedFiles: [file1, file2],
        showFileLimitWarning: true,
      });

      expect(wrapper.vm.showFileLimitWarning).toBe(true);
      await wrapper.vm.removeFile({}, 0);
      expect(wrapper.vm.showFileLimitWarning).toBe(false);
    });

    it('sets showFileSizeWarning to false when removing a file and all remaining are without errors', async () => {
      const file1 = mockFile('test1.jpg');
      const file2 = mockFile('test2.jpg');

      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.setData({
        selectedFiles: [{ fileName: file1.name, error: true }, { fileName: file2.name, error: false }],
        showFileSizeWarning: true,
      });

      expect(wrapper.vm.showFileSizeWarning).toBe(true);
      await wrapper.vm.removeFile({ fileName: file1.name, error: true }, 0);
      expect(wrapper.vm.showFileSizeWarning).toBe(false);
    });

    it('keeps showFileSizeWarning true when removing a file and remaining files have errors', () => {
      const file1 = mockFile('test1.jpg');
      const file2 = mockFile('test2.jpg');

      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.setData({
        selectedFiles: [{ fileName: file1.name, error: true }, { fileName: file2.name, error: true }],
        showFileSizeWarning: true,
      });

      expect(wrapper.vm.showFileSizeWarning).toBe(true);
      wrapper.vm.removeFile({ fileName: file1.name, error: true }, 0);
      expect(wrapper.vm.showFileSizeWarning).toBe(true);
    });

    it('sets previewImgIndex to null', async () => {
      const file1 = mockFile('test1.jpg');
      const file2 = mockFile('test2.jpg');

      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.setData({
        selectedFiles: [file1, file2],
        previewImgIndex: 0,
      });

      expect(wrapper.vm.previewImgIndex).toBe(0);
      await wrapper.vm.removeFile(file1, 0);
      expect(wrapper.vm.previewImgIndex).toBe(null);
    });
  });

  describe('onFileRemove', () => {
    const mountWrapper = () => shallowMount(CheckCard, {
      props: {
        item: {
          name: 'Check paint',
          type: 'SELECTION',
          attachmentsEnabled: true,
        },
        checklistId: 'asd-asd-gdf',
      },
      global: { plugins: [createPinia()] },
    });

    it('calls removeFile with correct index when file has error', () => {
      const wrapper = mountWrapper();
      wrapper.setData({
        selectedFiles: [{ fileName: 'test.jpg', error: true }],
      });
      const removeFileSpy = vi.spyOn(wrapper.vm, 'removeFile');
      wrapper.vm.onFileRemove(0);
      expect(removeFileSpy).toHaveBeenCalledWith({ fileName: 'test.jpg', error: true }, 0);
    });

    it('calls openConfirmDialog with correct parameters when file has no error', () => {
      const wrapper = mountWrapper();
      wrapper.setData({
        selectedFiles: [{ fileName: 'test.jpg', error: false }],
      });
      const openConfirmDialogSpy = vi.spyOn(wrapper.vm, 'openConfirmDialog');
      wrapper.vm.onFileRemove(0);
      expect(openConfirmDialogSpy).toHaveBeenCalledWith({
        title: 'Confirmation',
        text: 'Are you sure you want to delete {value}?',
        action: expect.any(Function),
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
    });
  });

  describe('uploadFile', () => {
    it('uploads file, emits events, and stores path from API response', async () => {
      const fileMock = mockFile('test.jpg');
      const file = {
        fileName: 'test.jpg',
        currentFile: fileMock,
        uuid: 'file-uuid',
        checklistTaskId: 'checklist-task-id',
        checklistTaskElementId: 'checklist-task-element-id',
      };
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          fileUuid: 'file-uuid',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.selectedFiles = [file];
      postChecklistFile.mockResolvedValueOnce(['/path/to/returned-file.jpg']);

      await wrapper.vm.uploadFile(file, 0);

      expect(wrapper.emitted('file-add-start')).toBeTruthy();
      expect(postChecklistFile).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.selectedFiles[0].path).toEqual('/path/to/returned-file.jpg');
      expect(wrapper.emitted('file-added')).toBeTruthy();
      expect(wrapper.emitted('file-added')[0][0]).toEqual('/path/to/returned-file.jpg');
    });

    it('does not emit file-add-start and call checklistApi.postChecklistFile if disabled is true', async () => {
      const fileMock = mockFile('test.jpg');
      const file = {
        fileName: 'test.jpg',
        currentFile: fileMock,
        uuid: 'file-uuid',
        checklistTaskId: 'checklist-task-id',
        checklistTaskElementId: 'checklist-task-element-id',
      };
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          fileUuid: 'file-uuid',
          disabled: true,
        },
        global: { plugins: [createPinia()] },
      });

      await wrapper.vm.uploadFile(file);
      expect(wrapper.emitted('file-add-start')).toBeFalsy();
      expect(postChecklistFile).toHaveBeenCalledTimes(0);
    });

    it('sets file error to true if postChecklistFile fails and emits file-added without file', async () => {
      const fileMock = mockFile('test.jpg');
      const file = {
        fileName: 'test.jpg',
        currentFile: fileMock,
        uuid: 'file-uuid',
        checklistTaskId: 'checklist-task-id',
        checklistTaskElementId: 'checklist-task-element-id',
      };
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          fileUuid: 'file-uuid',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.selectedFiles = [{ fileName: 'test.jpg', error: false }];

      postChecklistFile.mockRejectedValueOnce(new Error('Upload failed'));

      await wrapper.vm.uploadFile(file, 0);
      expect(wrapper.vm.selectedFiles[0].error).toBe(true);
      expect(wrapper.emitted('file-added')).toBeTruthy();
      expect(wrapper.emitted('file-added')[0][0]).toEqual(undefined);
    });
  });

  describe('openImg', () => {
    it('does not set previewImgIndex if file at index has error', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          files: [{ fileName: 'test.jpg', error: true }],
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      wrapper.vm.openImg(0);
      expect(wrapper.vm.previewImgIndex).toBe(null);
    });

    it('sets previewImgIndex if file at index does not have error', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: 'SELECTION',
            attachmentsEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
          files: [{ fileName: 'test.jpg', error: false }],
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      wrapper.vm.openImg(0);
      expect(wrapper.vm.previewImgIndex).toBe(0);
    });
  });

  describe('chipChanged', () => {
    let wrapper;

    beforeEach(async () => {
      wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            name: 'Check paint',
            type: checkTypes.YES_NO,
            value: [true],
            notApplicableEnabled: true,
          },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();
      wrapper.vm.valueNotApplicable = true;
      wrapper.vm.comment = 'Test comment';
    });

    it('sets inputValue from the passed newValue', () => {
      wrapper.vm.chipChanged([false]);

      expect(wrapper.vm.inputValue).toEqual([false]);
    });

    it('sets inputValue to empty array when deselected', () => {
      wrapper.vm.chipChanged([]);

      expect(wrapper.vm.inputValue).toEqual([]);
    });

    it('sets valueNotApplicable to false and emits update:model-value', () => {
      wrapper.vm.chipChanged([true]);

      expect(wrapper.vm.valueNotApplicable).toBe(false);
      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0][0]).toEqual({
        inputValue: [true],
        comment: 'Test comment',
        valueNotApplicable: false,
      });
    });
  });

  describe('notApplicableChipChanged', () => {
    it('resets inputValue to [] for YES_NO type', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Check paint', type: checkTypes.YES_NO, value: [true], notApplicableEnabled: true },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.notApplicableChipChanged();

      expect(wrapper.vm.inputValue).toEqual([]);
    });

    it('resets inputValue to null for TEXT type', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Check paint', type: 'TEXT', value: 'some text', notApplicableEnabled: true },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      wrapper.vm.notApplicableChipChanged();

      expect(wrapper.vm.inputValue).toBeNull();
    });
  });

  describe('yesNoValidationFn', () => {
    it('returns false when value is false', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Check paint', type: checkTypes.YES_NO, value: [false] },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.yesNoValidationFn(false)).toBe(false);
    });

    it('returns true when value is true', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: { name: 'Check paint', type: checkTypes.YES_NO, value: [true] },
          checklistId: 'asd-asd-gdf',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.yesNoValidationFn(true)).toBe(true);
    });
  });

  describe('showWarningMessage for YES_NO type', () => {
    it('returns true when type is YES_NO, has warningMessage, No is selected, and not N/A', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            warningMessage: 'Contact supervisor',
            value: [false],
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(true);
    });

    it('returns false when Yes is selected', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            warningMessage: 'Contact supervisor',
            value: [true],
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });

    it('returns false when value is empty (no selection)', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            warningMessage: 'Contact supervisor',
            value: [],
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });

    it('returns false when Not Applicable is selected', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            warningMessage: 'Contact supervisor',
            value: [false],
            valueNotApplicable: true,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });

    it('returns false when warningMessage is empty', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            warningMessage: '',
            value: [false],
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });

    it('returns false when warningMessage is undefined', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.YES_NO,
            name: 'Safety check',
            value: [false],
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });

    it('returns false when type is CHECK (message only for MEASUREMENT and YES_NO)', () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.CHECK,
            name: 'Check task',
            warningMessage: 'This should not show',
            value: true,
            valueNotApplicable: false,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.vm.showWarningMessage).toBe(false);
    });
  });

  describe('multiChipInputHint', () => {
    it('returns default hint when inputValue is null', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: null,
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Enter measurement (multiple)');
    });

    it('returns default hint when inputValue is empty array', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Enter measurement (multiple)');
    });

    it('returns default hint when inputValue has only 1 value', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [5],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Enter measurement (multiple)');
    });

    it('returns average hint when inputValue has 2 values', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [10, 20],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Average: 15');
    });

    it('returns average hint when inputValue has multiple values', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [5, 10, 15, 20],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Average: 12,5');
    });

    it('returns default hint when all values are null or empty strings', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [null, '', null],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Enter measurement (multiple)');
    });

    it('returns average hint when at least 2 numeric values exist (filtering out null and empty strings)', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [10, null, 20, ''],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Average: 15');
    });

    it('correctly formats average with decimals', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [10.5, 20.3, 15.7],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });

      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Average: 15,5');
    });

    it('handles negative values correctly in average calculation', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [-10, 10],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      await nextTick();

      expect(wrapper.vm.multiChipInputHint).toBe('Average: 0');
    });

    it('handles mixed positive and negative values correctly', async () => {
      const wrapper = shallowMount(CheckCard, {
        props: {
          item: {
            type: checkTypes.MEASUREMENT,
            name: 'Measure',
            multipleSelection: true,
            value: [-5, 7, 10],
          },
          checklistId: 'test-id',
        },
        global: { plugins: [createPinia()] },
      });
      await nextTick();
      expect(wrapper.vm.multiChipInputHint).toBe('Average: 4');
    });
  });
});
