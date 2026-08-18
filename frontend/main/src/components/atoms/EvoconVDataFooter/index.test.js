import { shallowMount } from '@vue/test-utils';

import index from './index.vue';

import createGlobal from '@/helpers/createGlobal';

const global = createGlobal();

const createWrapper = (options) => shallowMount(index, {
  global: { ...global },
  ...options,
});

const propsDefault = {
  items: Array.from(Array(40).keys()),
  options: {
    page: 1,
    itemsPerPage: 20,
  },
  itemsPerPageOptions: null,
};

describe('EvoconVDataFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: { ...propsDefault },
    });

    expect(wrapper.element).toMatchSnapshot();
  });
  describe('getPageEnd', () => {
    it('returns correct value when hasUknownTotalItems is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPageEnd(true, 2, { pageStart: 1 }, [1, 2, 3]);
      expect(result).toBe(4);
    });

    it('returns correct value when pageCount is 1', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPageEnd(false, 1, { itemsLength: 10, pageStop: 20 }, []);
      expect(result).toBe(10);
    });

    it('returns correct value when pagination.itemsLength < pagination.pageStop', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPageEnd(false, 2, { itemsLength: 15, pageStop: 20 }, []);
      expect(result).toBe(15);
    });

    it('returns correct value when none of the conditions are met', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPageEnd(false, 2, { itemsLength: 30, pageStop: 20 }, []);
      expect(result).toBe(20);
    });
  });

  describe('getPagination', () => {
    it('returns correct pagination object', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const validOptions = { page: 2, itemsPerPage: 20 };
      const pageCount = 3;
      const items = Array.from(Array(40).keys());

      const result = wrapper.vm.getPagination(validOptions, pageCount, items);
      expect(result).toEqual({
        page: 2,
        itemsPerPage: 20,
        pageStart: 20,
        pageStop: 40,
        pageCount: 3,
        itemsLength: 40,
      });
    });

    it('returns correct pagination object when page is 1', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const validOptions = { page: 1, itemsPerPage: 20 };
      const pageCount = 2;
      const items = Array.from(Array(40).keys());

      const result = wrapper.vm.getPagination(validOptions, pageCount, items);
      expect(result).toEqual({
        page: 1,
        itemsPerPage: 20,
        pageStart: 0,
        pageStop: 20,
        pageCount: 2,
        itemsLength: 40,
      });
    });

    it('returns correct pagination object when itemsPerPage is 10', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const validOptions = { page: 3, itemsPerPage: 10 };
      const pageCount = 4;
      const items = Array.from(Array(40).keys());

      const result = wrapper.vm.getPagination(validOptions, pageCount, items);
      expect(result).toEqual({
        page: 3,
        itemsPerPage: 10,
        pageStart: 20,
        pageStop: 30,
        pageCount: 4,
        itemsLength: 40,
      });
    });

    it('returns correct pagination object when items array is empty', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const validOptions = { page: 1, itemsPerPage: 20 };
      const pageCount = 1;
      const items = [];

      const result = wrapper.vm.getPagination(validOptions, pageCount, items);
      expect(result).toEqual({
        page: 1,
        itemsPerPage: 20,
        pageStart: 0,
        pageStop: 20,
        pageCount: 1,
        itemsLength: 0,
      });
    });
  });

  describe('getPage', () => {
    it('returns options.page when hasUnknownTotalItems is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPage(true, { page: 3 }, false, 5);
      expect(result).toBe(3);
    });

    it('returns 1 when showAllItems is true', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPage(false, { page: 3 }, true, 5);
      expect(result).toBe(1);
    });

    it('returns options.page when showAllItems is false and pageCount is greater than options.page', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPage(false, { page: 3 }, false, 5);
      expect(result).toBe(3);
    });

    it('returns pageCount when showAllItems is false and pageCount is less than options.page', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getPage(false, { page: 6 }, false, 5);
      expect(result).toBe(5);
    });
  });

  describe('getTotalCountText', () => {
    it('returns correct value when hasUnknownTotalItems is true and items length is less than pagination.itemsPerPage', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getTotalCountText(true, { pageStart: 0, itemsPerPage: 20 }, [1, 2, 3]);
      expect(result).toBe(3);
    });

    it('returns correct value when hasUnknownTotalItems is true and items length is equal to pagination.itemsPerPage', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getTotalCountText(true, { pageStart: 0, itemsPerPage: 20 }, Array.from(Array(20).keys()));
      expect(result).toBe('20+');
    });

    it('returns correct value when hasUnknownTotalItems is false', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getTotalCountText(false, { pageStart: 0, itemsPerPage: 20 }, Array.from(Array(15).keys()));
      expect(result).toBe(15);
    });

    it('returns correct value when hasUnknownTotalItems is true and items length is greater than pagination.itemsPerPage', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getTotalCountText(true, { pageStart: 0, itemsPerPage: 20 }, Array.from(Array(25).keys()));
      expect(result).toBe('25+');
    });

    it('returns correct value when hasUnknownTotalItems is true and pagination.pageStart is not zero', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getTotalCountText(true, { pageStart: 20, itemsPerPage: 20 }, Array.from(Array(15).keys()));
      expect(result).toBe(35);
    });
  });

  describe('getIsLastPage', () => {
    it('returns true when hasUnknownTotalItems is true and validOptions.itemsPerPage is greater than items length', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getIsLastPage(true, { itemsPerPage: 20 }, { page: 1 }, Array.from(Array(15).keys()), 2);
      expect(result).toBe(true);
    });

    it('returns false when hasUnknownTotalItems is true and validOptions.itemsPerPage is less than or equal to items length', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getIsLastPage(true, { itemsPerPage: 20 }, { page: 1 }, Array.from(Array(20).keys()), 2);
      expect(result).toBe(false);
    });

    it('returns true when hasUnknownTotalItems is false and options.page is equal to pageCount', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getIsLastPage(false, { itemsPerPage: 20 }, { page: 2 }, Array.from(Array(40).keys()), 2);
      expect(result).toBe(true);
    });

    it('returns false when hasUnknownTotalItems is false and options.page is not equal to pageCount', () => {
      const wrapper = createWrapper({
        props: { ...propsDefault },
      });

      const result = wrapper.vm.getIsLastPage(false, { itemsPerPage: 20 }, { page: 1 }, Array.from(Array(40).keys()), 2);
      expect(result).toBe(false);
    });
  });
});
