import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';

import openSupportDialog from './openSupportDialog';

import useGenericDialogStore from '@/stores/genericDialog';

beforeEach(() => {
  setActivePinia(createTestingPinia({ createSpy: vi.fn }));
});

describe('openSupportDialog', () => {
  it('calls openDialog with the correct arguments', () => {
    openSupportDialog();
    expect(useGenericDialogStore().openDialog).toHaveBeenCalledWith({
      component: expect.any(Object),
      width: 900,
    });
  });
});
