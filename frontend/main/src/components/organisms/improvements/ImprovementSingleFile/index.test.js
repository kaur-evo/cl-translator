import { shallowMount, flushPromises } from '@vue/test-utils';

import ImprovementsSingleFile from './index.vue';

import improvementsFileApi from '@/api/improvementsFileApi';

vi.mock('@/api/improvementsFileApi');
improvementsFileApi.getFile = () => ('test-file');

URL.createObjectURL = () => {
  'test-url';
};

describe('ImprovementsSingleFile', () => {
  it('has a placeholder for image if file type is image', () => {
    const wrapper = shallowMount(ImprovementsSingleFile, {

      props: {
        fileData: {
          contentType: 'image/png',
        },
      },
    });
    expect(wrapper.findAll('.image-prev').length).toBe(1);
  });

  it('img placeholder has src after mounting', async () => {
    const wrapper = shallowMount(ImprovementsSingleFile, {

      props: {
        fileData: {
          contentType: 'image/png',
        },
      },
    });

    await flushPromises();

    expect(wrapper.findAll('.image-prev').at(0).element.src).toBeDefined();
  });
});
