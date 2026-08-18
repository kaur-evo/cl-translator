import { shallowMount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mdiPencil, mdiDelete } from '@mdi/js';

import SettingsTranslationsCard from './index.vue';

import translationApi from '@/api/translationApi';

vi.mock('@/api/translationApi');
translationApi.getLanguageTexts = vi.fn().mockReturnValue([]);
const putLanguageTexts = vi.fn();
translationApi.putLanguageTexts = putLanguageTexts;
const deleteLanguageText = vi.fn();
translationApi.deleteLanguageText = deleteLanguageText;

const propsDefaults = {
  languageTextEntity: 'entityName',
  entityId: 12,
};

const createWrapper = (propsOverrides = {}) => {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  return shallowMount(SettingsTranslationsCard, {
    global: { plugins: [pinia] },
    props: { ...propsDefaults, ...propsOverrides },
  });
};

describe('SettingsTranslationsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = createWrapper();

    await flushPromises();
    await wrapper.setData({ translations: [{ languageId: 'et', languageText: 'tõlge' }, { languageId: 'en', languageText: 'translation' }] });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that translationsCardButtons array has delete and edit actions', () => {
    const wrapper = createWrapper();

    expect(wrapper.vm.translationsCardButtons).toHaveLength(2);
    expect(wrapper.vm.translationsCardButtons[0]).toEqual({
      icon: mdiPencil,
      text: 'Edit',
      tooltip: 'Edit',
      action: expect.any(Function),
    });
    expect(wrapper.vm.translationsCardButtons[1]).toEqual({
      icon: mdiDelete,
      text: 'Delete',
      tooltip: 'Delete',
      action: expect.any(Function),
    });
  });

  test('saveTranslations', async () => {
    const wrapper = createWrapper();

    await flushPromises();
    const translations = [{ languageId: 'et', languageText: 'tõlge' }, { languageId: 'en', languageText: 'translation' }];
    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');
    await wrapper.setData({ translations });
    await wrapper.vm.saveTranslations(12, 'abc');
    expect(putLanguageTexts).toHaveBeenCalledTimes(1);
    expect(putLanguageTexts).toHaveBeenCalledWith([{ languageId: 'et', languageText: 'tõlge', entityId: 12 }, { languageId: 'en', languageText: 'translation', entityId: 12 }]);
    expect(notifySuccess).toHaveBeenCalledTimes(1);
  });

  test('onDelete in new entity', async () => {
    const wrapper = createWrapper({ entityId: 'new' });

    const translations = [{ languageId: 'et', languageText: 'tõlge' }, { languageId: 'en', languageText: 'translation' }];
    await wrapper.setData({ translations: [...translations] });

    const openConfirmDialog = vi.spyOn(wrapper.vm, 'openConfirmDialog');
    const notifySuccess = vi.spyOn(wrapper.vm, 'notifySuccess');

    expect(wrapper.vm.translations).toEqual(translations);
    await wrapper.vm.onDelete({ index: 1 });
    expect(wrapper.vm.translations).toEqual([{ languageId: 'et', languageText: 'tõlge' }]);
    await wrapper.vm.onDelete({ index: 0 });
    expect(wrapper.vm.translations).toEqual([]);
    expect(deleteLanguageText).toHaveBeenCalledTimes(0);
    expect(openConfirmDialog).toHaveBeenCalledTimes(0);
    expect(notifySuccess).toHaveBeenCalledTimes(0);
  });

  test('onDelete in existing entity', async () => {
    const wrapper = createWrapper();

    const translations = [{ languageId: 'et', languageText: 'tõlge', entityId: 12 }, { languageId: 'en', languageText: 'translation', entityId: 14 }];
    await wrapper.setData({ translations: [...translations] });

    const openConfirmDialog = vi.spyOn(wrapper.vm, 'openConfirmDialog');

    await wrapper.vm.onDelete({ item: { entityId: 12 }, index: 1 });

    expect(openConfirmDialog).toHaveBeenCalledTimes(1);
  });

  test('onTranslationChange with new entity', async () => {
    const wrapper = createWrapper({ entityId: 'new' });
    await flushPromises();

    const translations = [{ languageId: 'et', languageText: 'tõlge' }, { languageId: 'en', languageText: 'translation' }];
    await wrapper.setData({ translations: [...translations] });
    const saveTranslations = vi.spyOn(wrapper.vm, 'saveTranslations');
    const newTranslation = { languageId: 'et', languageText: 'uuendatud tõlge' };
    await wrapper.vm.onTranslationChange({ item: newTranslation, index: 0 });
    expect(wrapper.vm.translations).toHaveLength(2);
    expect(wrapper.vm.translations[0]).toMatchObject(newTranslation);
    expect(wrapper.vm.translations[1]).toEqual(translations[1]);
    expect(saveTranslations).toHaveBeenCalledTimes(0);
    expect(wrapper.emitted('update:have-translations-changed')[0][0]).toBe(true);
  });

  test('onTranslationChange with existing entity', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    const translations = [{ languageId: 'et', languageText: 'tõlge' }, { languageId: 'en', languageText: 'translation' }];
    await wrapper.setData({ translations: [...translations] });
    const saveTranslations = vi.spyOn(wrapper.vm, 'saveTranslations');
    const newTranslation = { languageId: 'en', languageText: 'new translation' };
    expect(wrapper.vm.translations).toEqual(translations);
    await wrapper.vm.onTranslationChange({ item: newTranslation, index: 1 });
    expect(wrapper.vm.translations).toMatchObject([
      { languageId: 'et', languageText: 'tõlge', entityId: 12 },
      {
        entity: 'entityName', entityId: 12, languageId: 'en', languageText: 'new translation',
      },
    ]);
    expect(saveTranslations).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:have-translations-changed')[0][0]).toBe(false);
  });
  test('onConfirmDelete', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const translations = [{ id: 12, languageId: 'et', languageText: 'tõlge' }, { id: 13, languageId: 'en', languageText: 'translation' }];
    await wrapper.setData({ translations: [...translations] });
    expect(wrapper.vm.translations).toEqual(translations);

    await wrapper.vm.onConfirmDelete({ id: 12, languageId: 'et', languageText: 'tõlge' }, 0);
    expect(deleteLanguageText).toHaveBeenCalledTimes(1);
    expect(deleteLanguageText).toHaveBeenCalledWith(12);
    expect(wrapper.vm.translations).toEqual([{ id: 13, languageId: 'en', languageText: 'translation' }]);
  });
});
