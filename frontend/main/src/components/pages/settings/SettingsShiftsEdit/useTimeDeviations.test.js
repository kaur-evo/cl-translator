import { ref } from 'vue';
import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import useTimeDeviations from './useTimeDeviations';

import useConfirmDialogStore from '@/stores/confirmDialog';
import useShiftTemplateStore from '@/stores/shiftTemplate';

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: vi.fn(),
  };
});

describe('useTimeDeviations', () => {
  let tMock;
  let shiftTemplateId;
  let useI18n;
  let confirmDialogStore;
  let shiftTemplateStore;

  beforeEach(async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    setActivePinia(pinia);

    confirmDialogStore = useConfirmDialogStore();
    shiftTemplateStore = useShiftTemplateStore();

    confirmDialogStore.openConfirmDialog = vi.fn();
    shiftTemplateStore.currentTimeDeviations = vi.fn(() => ['deviation1', 'deviation2']);
    shiftTemplateStore.fetchShiftTemplateTimeDeviations = vi.fn(() => Promise.resolve());
    shiftTemplateStore.deleteShiftTemplateTimeDeviation = vi.fn(() => Promise.resolve());

    shiftTemplateId = ref(123);
    tMock = vi.fn((key) => key);

    useI18n = (await import('vue-i18n')).useI18n;
    useI18n.mockReturnValue({ t: tMock });
  });

  it('returns currentTimeDeviations as a computed property', () => {
    const { currentTimeDeviations } = useTimeDeviations(shiftTemplateId);
    expect(currentTimeDeviations.value).toEqual(['deviation1', 'deviation2']);
    expect(shiftTemplateStore.currentTimeDeviations).toHaveBeenCalledWith(123);
  });

  it('timeDeviationsLoading is initially false', () => {
    const { timeDeviationsLoading } = useTimeDeviations(shiftTemplateId);
    expect(timeDeviationsLoading.value).toBe(false);
  });

  it('loadTimeDeviations sets loading, calls dispatch, and resets loading', async () => {
    const { timeDeviationsLoading, loadTimeDeviations } = useTimeDeviations(shiftTemplateId);
    const promise = loadTimeDeviations();
    expect(timeDeviationsLoading.value).toBe(true);
    await promise;
    expect(shiftTemplateStore.fetchShiftTemplateTimeDeviations).toHaveBeenCalledWith(123);
    expect(timeDeviationsLoading.value).toBe(false);
  });

  it('openDeleteTimeDeviationConfirmation calls confirmDialogStore with correct config', async () => {
    const { openDeleteTimeDeviationConfirmation } = useTimeDeviations(shiftTemplateId);
    const deviation = { id: 1 };
    await openDeleteTimeDeviationConfirmation(deviation);

    expect(confirmDialogStore.openConfirmDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirmation',
        text: 'Are you sure you want to delete this?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        action: expect.any(Function),
      }),
    );
    const dialogConfig = confirmDialogStore.openConfirmDialog.mock.calls[0][0];
    await dialogConfig.action();
    expect(shiftTemplateStore.deleteShiftTemplateTimeDeviation).toHaveBeenCalledWith(deviation);
  });
});
