import { shallowMount } from '@vue/test-utils';

import ShiftViewSkeletonLoader from './index.vue';

describe('ShiftViewSkeletonLoader', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(ShiftViewSkeletonLoader);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
