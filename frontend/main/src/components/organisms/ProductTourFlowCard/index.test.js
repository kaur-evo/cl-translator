import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ProductTourFlowCard from './index.vue';

const defaultProps = {
  steps: [],
};

describe('ProductTourFlowCard', () => {
  it('renders', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: { ...defaultProps },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', descrLines: ['Content 1 line 1', 'Content 1 line 2'], tertiaryBtnText: 'Close' }, { title: 'Step 2', descrLines: ['Content 2'], tertiaryBtnText: 'Close' }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if currentStepIndex is 1', async () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [
          { title: 'Step 1', descrLines: ['Content 1 line 1', 'Content 1 line 2'], tertiaryBtnText: 'Close' },
          { title: 'Step 2', descrLines: ['Content 2'], showBackBtn: true, tertiaryBtnText: 'Close' },
        ],
      },
    });

    wrapper.vm.currentStepIndex = 1;

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if tertiaryBtnText is missing', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', descrLines: ['Content 1 line 1', 'Content 1 line 2'] }, { title: 'Step 2', descrLines: ['Content 2'] }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly if currentStepIndex is 1, but that step is missing showBackBtn boolean', async () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', descrLines: ['Content 1 line 1', 'Content 1 line 2'], tertiaryBtnText: 'Close' }, { title: 'Step 2', descrLines: ['Content 2'], tertiaryBtnText: 'Close' }],
      },
    });

    wrapper.vm.currentStepIndex = 1;

    await nextTick();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that visibleStep returns correct step from steps array by index', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
      },
    });

    wrapper.vm.currentStepIndex = 0;

    expect(wrapper.vm.visibleStep).toEqual({ title: 'Step 1', content: 'Content 1' });

    wrapper.vm.currentStepIndex = 1;

    expect(wrapper.vm.visibleStep).toEqual({ title: 'Step 2', content: 'Content 2' });
  });

  test('that progressBarPercentage returns correct percentage based on currentStepIndex', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }, { title: 'Step 3', content: 'Content 3' }, { title: 'Step 4', content: 'Content 4' }],
      },
    });

    wrapper.vm.currentStepIndex = 0;

    expect(wrapper.vm.progressBarPercentage).toEqual(25);

    wrapper.vm.currentStepIndex = 1;

    expect(wrapper.vm.progressBarPercentage).toEqual(50);

    wrapper.vm.currentStepIndex = 2;

    expect(wrapper.vm.progressBarPercentage).toEqual(75);

    wrapper.vm.currentStepIndex = 3;

    expect(wrapper.vm.progressBarPercentage).toEqual(100);
  });

  describe('primaryButtonText', () => {
    it('returns visibleStep.primaryBtnText if it is defined', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1', primaryBtnText: 'primary btn text' }],
        },
      });

      expect(wrapper.vm.primaryButtonText).toEqual('primary btn text');
    });

    it('returns Ok when currentStepIndex is equal to steps length - 1', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
        },
      });

      wrapper.vm.currentStepIndex = 1;

      expect(wrapper.vm.primaryButtonText).toEqual('Ok');
    });

    it('returns Next when currentStepIndex is not equal to steps length - 1', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
        },
      });

      wrapper.vm.currentStepIndex = 0;

      expect(wrapper.vm.primaryButtonText).toEqual('Next_noun');
    });
  });

  test('that onBackClick subtracts 1 from currentStepIndex', () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
      },
    });

    wrapper.vm.currentStepIndex = 1;

    wrapper.vm.onBackClick();

    expect(wrapper.vm.currentStepIndex).toEqual(0);
  });

  describe('onNextClick', () => {
    it('emits click:tertiary-btn if currentStepIndex is equal to steps length - 1', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
        },
      });

      wrapper.vm.currentStepIndex = 1;

      wrapper.vm.onNextClick();

      expect(wrapper.emitted('click:tertiary-btn')).toBeTruthy();
    });

    it('adds 1 to currentStepIndex if currentStepIndex is not equal to steps length - 1', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
        },
      });

      wrapper.vm.currentStepIndex = 0;

      wrapper.vm.onNextClick();

      expect(wrapper.vm.currentStepIndex).toEqual(1);
    });
  });

  test('that when currentStepIndex is equal to steps length - 1, then mark-flow-as-completed is emitted', async () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }, { title: 'Step 3', content: 'Content 3' }],
      },
    });

    expect(wrapper.vm.currentStepIndex).toEqual(0);

    wrapper.vm.onNextClick();

    await nextTick();

    expect(wrapper.vm.currentStepIndex).toEqual(1);
    expect(wrapper.emitted('mark-flow-as-completed')).toBeFalsy();

    wrapper.vm.onNextClick();

    await nextTick();

    expect(wrapper.vm.currentStepIndex).toEqual(2);
    expect(wrapper.emitted('mark-flow-as-completed')).toBeTruthy();
  });

  test('that when currentStepIndex is equal to steps length - 1, but markCompleteOnLastStep is false, then mark-flow-as-completed is not emitted', async () => {
    const wrapper = shallowMount(ProductTourFlowCard, {
      props: {
        steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }, { title: 'Step 3', content: 'Content 3' }],
        markCompleteOnLastStep: false,
      },
    });

    expect(wrapper.vm.currentStepIndex).toEqual(0);

    wrapper.vm.onNextClick();

    await nextTick();

    expect(wrapper.vm.currentStepIndex).toEqual(1);
    expect(wrapper.emitted('mark-flow-as-completed')).toBeFalsy();

    wrapper.vm.onNextClick();

    await nextTick();

    expect(wrapper.vm.currentStepIndex).toEqual(2);
    expect(wrapper.emitted('mark-flow-as-completed')).toBeFalsy();
  });

  describe('onPrimaryButtonClick', () => {
    it('calls primaryBtnAction if it is defined for visible step', () => {
      const primaryBtnAction = vi.fn();
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1', primaryBtnAction }],
        },
      });

      wrapper.vm.currentStepIndex = 0;
      wrapper.vm.onPrimaryButtonClick();

      expect(primaryBtnAction).toHaveBeenCalled();
    });
  });

  describe('onTertiaryClick', () => {
    it('calls tertiaryBtnAction if it is defined for visible step', () => {
      const tertiaryBtnAction = vi.fn();
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1', tertiaryBtnAction }],
        },
      });

      wrapper.vm.currentStepIndex = 0;
      wrapper.vm.onTertiaryClick();

      expect(tertiaryBtnAction).toHaveBeenCalled();
    });

    it('emits click:tertiary-btn if tertiaryBtnAction is not defined for visible step', () => {
      const wrapper = shallowMount(ProductTourFlowCard, {
        props: {
          steps: [{ title: 'Step 1', content: 'Content 1' }, { title: 'Step 2', content: 'Content 2' }],
        },
      });

      wrapper.vm.currentStepIndex = 0;
      wrapper.vm.onTertiaryClick();

      expect(wrapper.emitted('click:tertiary-btn')).toBeTruthy();
    });
  });
});
