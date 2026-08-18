import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SettingsTranslationEditForm from './index.vue';

import useGenericDialogStore from '@/stores/genericDialog';
import useDeviceStore from '@/stores/device';
import { languages } from '@/constants/languages';

const createWrapper = (dialogDataOverride = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
  const genericDialogStore = useGenericDialogStore(pinia);
  genericDialogStore.dialogData = { addedTranslations: [], ...dialogDataOverride };
  useDeviceStore(pinia).isMobileView = false;
  useDeviceStore(pinia).showFullscreenDialogs = false;

  return shallowMount(SettingsTranslationEditForm, {
    global: {
      plugins: [pinia],
      stubs: { 'form-dialog-template': false },
    },
  });
};

describe('SettingsTranslationEditForm', () => {
  it('renders correctly in entity adding', () => {
    const wrapper = createWrapper({ isEntityAdding: true, addedTranslations: [], translation: null });
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders correctly in entity editing', async () => {
    const wrapper = createWrapper({ isEntityAdding: false, addedTranslations: [{ languageId: 'ee' }], translation: { entityId: 1 } });
    await flushPromises();
    expect(wrapper.element).toMatchSnapshot();
  });

  test('that filteredLanguages array contains all languages from language array', async () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.filteredLanguages.length).toBe(31);
    expect(wrapper.vm.filteredLanguages).toEqual(languages);
  });

  test('that filteredLanguages array doesnt contain languages, which are already in use', async () => {
    const wrapper = createWrapper({ addedTranslations: [{ languageId: 'ee' }, { languageId: 'lv' }] });
    expect(wrapper.vm.filteredLanguages.length).toBe(30);
    expect(wrapper.vm.filteredLanguages).toEqual(languages.filter((lang) => !['ee', 'lv'].includes(lang.languageId)));
  });

  test('that on translation edit, filteredLanguages array contains the language of this translation and all other languages, that are not in use', async () => {
    const wrapper = createWrapper({
      addedTranslations: [{ languageId: 'ee' }, { languageId: 'lv' }],
      translation: { languageId: 'ee' },
    });
    expect(wrapper.vm.filteredLanguages.length).toBe(30);
    expect(wrapper.vm.filteredLanguages).toEqual(languages.filter((lang) => !['lv'].includes(lang.languageId)));
  });
});
