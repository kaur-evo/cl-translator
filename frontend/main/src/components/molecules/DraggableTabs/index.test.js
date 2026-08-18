import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import DraggableTabs from './index.vue';

const defaultProps = {
  tabs: [{ name: 'tab 1', id: 1 }, { name: 'tab 2', id: 2 }, { name: 'tab 3', id: 3 }],
};

describe('DraggableTabs', () => {
  it('renders', () => {
    const wrapper = mount(DraggableTabs, { props: defaultProps });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = mount(DraggableTabs, { props: defaultProps });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly with dragging enabled', () => {
    const wrapper = mount(DraggableTabs, { props: { ...defaultProps, draggingEnabled: true } });
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that selectedTabIndex watcher calls scrollIntoView on selected tab when index is changed', async () => {
    const wrapper = mount(DraggableTabs, { props: defaultProps });

    const mockTabs = [
      { scrollIntoView: vi.fn() },
      { scrollIntoView: vi.fn() },
      { scrollIntoView: vi.fn() },
    ];
    const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockTabs);

    await wrapper.setProps({ selectedTabIndex: 1 });
    await nextTick();
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.draggable-tabs__tab');
    expect(mockTabs[1].scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    querySelectorAllSpy.mockRestore();
  });
});
