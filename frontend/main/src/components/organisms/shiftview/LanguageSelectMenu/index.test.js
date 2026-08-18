import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import LanguageSelectMenu from './index.vue';

const defaultPiniaState = {
  profile: {
    currentUser: { uuid: 'test uuid', lineviewLanguages: ['et', 'en', 'lv', 'lt'] },
    language: 'et',
  },
};

const createPinia = (overrides = {}) => createTestingPinia({
  createSpy: vi.fn,
  initialState: { ...defaultPiniaState, ...overrides },
});

const createWrapper = (overrides = {}) => mount(LanguageSelectMenu, {
  global: { plugins: [createPinia(overrides)] },
});

describe('LanguageSelectMenu', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that on setLanguage comments, groups and positions are fetched with correct params', () => {
    const wrapper = createWrapper();
    const fetchComments = vi.spyOn(wrapper.vm, 'fetchComments');
    const fetchCommentGroups = vi.spyOn(wrapper.vm, 'fetchCommentGroups');
    const fetchPerfComments = vi.spyOn(wrapper.vm, 'fetchPerfComments');
    const fetchPerfCommentGroups = vi.spyOn(wrapper.vm, 'fetchPerfCommentGroups');
    const fetchScrapReasons = vi.spyOn(wrapper.vm, 'fetchScrapReasons');
    const fetchScrapReasonGroups = vi.spyOn(wrapper.vm, 'fetchScrapReasonGroups');
    const fetchPositions = vi.spyOn(wrapper.vm, 'fetchPositions');

    const langParams = { lang: 'en' };
    wrapper.vm.selectLanguage('en');
    expect(fetchComments).toBeCalledTimes(1);
    expect(fetchComments).toBeCalledWith(langParams);
    expect(fetchCommentGroups).toBeCalledTimes(1);
    expect(fetchCommentGroups).toBeCalledWith(langParams);
    expect(fetchPerfComments).toBeCalledTimes(1);
    expect(fetchPerfComments).toBeCalledWith(langParams);
    expect(fetchPerfCommentGroups).toBeCalledTimes(1);
    expect(fetchPerfCommentGroups).toBeCalledWith(langParams);
    expect(fetchScrapReasons).toBeCalledTimes(1);
    expect(fetchScrapReasons).toBeCalledWith(langParams);
    expect(fetchScrapReasonGroups).toBeCalledTimes(1);
    expect(fetchScrapReasonGroups).toBeCalledWith(langParams);
    expect(fetchPositions).toBeCalledTimes(1);
    expect(fetchPositions).toBeCalledWith(langParams);
  });
});
