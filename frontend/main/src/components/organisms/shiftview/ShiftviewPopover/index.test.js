import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiAbacus, mdiPlaylistCheck, mdiHelp, mdiLink, mdiImageOutline } from '@mdi/js';

import ShiftviewPopover from './index.vue';

import { useDeviceStore } from '@/stores/index';
import { pinTypes } from '@/constants/shiftviewPinConstants';

const target = document.createElement('div');

const createPinia = (overrides = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  const deviceStore = useDeviceStore(pinia);
  deviceStore.screen = overrides.screen ?? 1800;
  vi.spyOn(deviceStore, 'isMobileView', 'get').mockReturnValue(overrides.isMobileView ?? false);
  return pinia;
};

describe('ShiftviewPopover', () => {
  it('renders correctly', () => {
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [createPinia()], stubs: ['evocon-v-button'] },
      props: {
        targetEl: target,
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        titleIcon: mdiLink,
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK, appendIcon: mdiImageOutline }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in mobile view', () => {
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [createPinia({ isMobileView: true })], stubs: ['evocon-v-button'] },
      props: {
        targetEl: target,
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        titleIcon: mdiLink,
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK, appendIcon: mdiImageOutline }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('does not have arrows by default', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        targetEl: target,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    expect(wrapper.find('#left-arrow').exists()).toBe(false);
    expect(wrapper.find('#right-arrow').exists()).toBe(false);
  });

  it('has arrows disabled by default if they are visible', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        targetEl: target,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    const leftArrow = wrapper.find('#left-arrow');
    const rightArrow = wrapper.find('#right-arrow');
    expect(leftArrow.exists()).toBe(true);
    expect(leftArrow.attributes('disabled')).toBe('');
    expect(rightArrow.exists()).toBe(true);
    expect(rightArrow.attributes('disabled')).toBe('');
  });

  test('enabling left arrow', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        targetEl: target,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    const leftArrow = wrapper.find('#left-arrow');
    const rightArrow = wrapper.find('#right-arrow');
    expect(leftArrow.exists()).toBe(true);
    expect(leftArrow.attributes('disabled')).toBe(undefined);
    expect(rightArrow.exists()).toBe(true);
    expect(rightArrow.attributes('disabled')).toBe('');
  });

  test('enabling right arrow', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveRight: true,
        targetEl: target,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    const leftArrow = wrapper.find('#left-arrow');
    const rightArrow = wrapper.find('#right-arrow');
    expect(leftArrow.exists()).toBe(true);
    expect(leftArrow.attributes('disabled')).toBe('');
    expect(rightArrow.exists()).toBe(true);
    expect(rightArrow.attributes('disabled')).toBe(undefined);
  });

  test('clicking arrows', async () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        dotColor: 'purple',
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    const leftArrow = wrapper.find('#left-arrow');
    const rightArrow = wrapper.find('#right-arrow');
    await leftArrow.trigger('click');
    expect('left-arrow-click' in wrapper.emitted()).toBe(true);
    await rightArrow.trigger('click');
    expect('right-arrow-click' in wrapper.emitted()).toBe(true);
  });

  it('does not have dot by default if dotColor is not defined', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'popover subtitle',
        title: 'popover title',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });

    expect(wrapper.find('#popover-dot').exists()).toBe(false);
  });

  test('dot and its color', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'popover subtitle',
        title: 'popover title',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });
    const dot = wrapper.find('#popover-dot');
    expect(dot.exists()).toBe(true);
    expect(dot.attributes('style')).toContain('color: rgba(255, 255, 255, 0.54)');
  });

  test('subtitle', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'popover title',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });
    const subtitle = wrapper.find('#subtitle');
    expect(subtitle.exists()).toBe(true);
    expect(subtitle.text()).toBe('this is a subtitle');
  });

  test('title', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'TITLE OF A POPOVER',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });
    const title = wrapper.find('#popover-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('TITLE OF A POPOVER');
  });

  it('has all the items in the list', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'TITLE OF A POPOVER',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: () => 'red',
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { check: {}, type: pinTypes.CHECK }],
      },
    });
    const items = wrapper.findAll('.popover-menu-item');
    expect(items.length).toBe(2);
    expect(items.at(0).text()).toBe('test text');
    expect(items.at(1).text()).toBe('test text');
  });

  test('itemIconColor', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'TITLE OF A POPOVER',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: (item) => item.color,
        itemIcon: () => mdiAbacus,
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK, color: '#82b1ff' }, { check: {}, type: pinTypes.CHECK, color: '#f28a0d' }],
      },
    });
    const itemIcons = wrapper.findAll('.item-icon');
    expect(itemIcons.at(0).attributes('style')).toContain('color: rgb(130, 177, 255)');
    expect(itemIcons.at(1).attributes('style')).toContain('color: rgb(242, 138, 13)');
  });

  test('itemIcon', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'TITLE OF A POPOVER',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: (item) => item.color,
        itemIcon: (item) => (item.type === pinTypes.CHECK ? mdiPlaylistCheck : mdiHelp),
        itemText: () => 'test text',
        items: [{ check: {}, type: pinTypes.CHECK }, { team: {}, type: pinTypes.TEAM }],
      },
    });
    const itemIcons = wrapper.findAll('.item-icon');
    expect(itemIcons.at(0).find('path').attributes('d')).toBe(mdiPlaylistCheck);
    expect(itemIcons.at(1).find('path').attributes('d')).toBe(mdiHelp);
  });
  test('itemText', () => {
    const pinia = createPinia();
    const wrapper = mount(ShiftviewPopover, {
      global: { plugins: [pinia] },
      props: {
        areArrowsEnabled: true,
        canMoveLeft: true,
        canMoveRight: true,
        targetEl: target,
        subtitle: 'this is a subtitle',
        title: 'TITLE OF A POPOVER',
        dotColor: 'rgba(255, 255, 255, 0.54)',
        itemIconColor: (item) => item.color,
        itemIcon: (item) => (item.type === 'CHECK' ? mdiPlaylistCheck : mdiHelp),
        itemText: (item) => (item.type === pinTypes.CHECK ? item.check.name : 'Edit item'),
        items: [{ check: { name: 'test 1' }, type: pinTypes.CHECK }, { team: {}, type: pinTypes.TEAM }],
      },
    });
    const itemTexts = wrapper.findAll('.item-text');
    expect(itemTexts.at(0).text()).toBe('test 1');
    expect(itemTexts.at(1).text()).toBe('Edit item');
  });
});
