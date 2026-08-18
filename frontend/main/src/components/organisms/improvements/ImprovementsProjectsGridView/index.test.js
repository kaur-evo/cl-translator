import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { addDays, subDays } from 'date-fns';

import ImprovementsProjectsGridView from './index.vue';

import { formatDate } from '@/helpers/date/formatDate';

const pinia = createTestingPinia();

const createWrapper = (options) => shallowMount(ImprovementsProjectsGridView, {
  global: { plugins: [pinia] },
  ...options,
});

describe('ImprovementsProjectsGridView', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123,
          name: 'project1',
          startDate: new Date('1970-01-25T00:00:00'),
          endDate: new Date('1970-02-25T00:00:00'),
          finished: false,
          users: [{ fullName: 'Doris test', userId: 'doristest1@test1.com' }],
        }, {
          id: 456,
          name: 'project2',
          startDate: new Date('1999-01-25T00:00:00'),
          endDate: new Date('1999-02-03T00:00:00'),
          finished: true,
          users: [{ fullName: 'Doris another test', userId: 'doristest2@test2.com' }],
        }],
      },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  test('that empty view is visible, when none of the projects match with search input', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123, name: 'project1', endDate: '', finished: false, users: [],
        }],
        search: 'test',
      },
    });

    expect(wrapper.find('#grid-layout-empty-view').isVisible()).toBe(true);
    expect(wrapper.find('.grid-view').exists()).toBe(false);
    expect(wrapper.vm.filteredProjectsBySearch).toEqual([]);
  });

  test('that projects are filtered by search input', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123, name: 'project1', endDate: addDays(new Date(), 10), finished: false, users: [],
        }, {
          id: 64, name: 'testname', endDate: subDays(new Date(), 10), finished: true, users: [],
        }, {
          id: 765, name: 'project3', endDate: addDays(new Date(), 25), finished: false, users: [],
        }],
        search: 'project',
      },
    });

    expect(wrapper.find('#grid-layout-empty-view').exists()).toBe(false);
    expect(wrapper.find('.grid-view').isVisible()).toBe(true);
    expect(wrapper.vm.filteredProjectsBySearch.length).toBe(2);
    expect(wrapper.vm.filteredProjectsBySearch[0].name).toBe('project1');
    expect(wrapper.vm.filteredProjectsBySearch[1].name).toBe('project3');
  });

  test('that "isProjectOverdue" returns true if project is not finished and project end date is in past', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123, name: 'project1', endDate: subDays(new Date(), 10), finished: false, users: [],
        }],
      },
    });

    expect(wrapper.vm.isProjectOverdue(wrapper.vm.projects[0])).toBe(true);
  });

  test('that upcoming project has info, when it starts', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123, name: 'project1', startDate: addDays(new Date(), 10), finished: false, users: [],
        }],
      },
    });

    const currentProject = wrapper.vm.projects[0];
    expect(wrapper.vm.getDateValueHeader(currentProject)).toBe('Starts');
    expect(wrapper.vm.getDateValue(currentProject)).toBe(formatDate(currentProject.startDate, 'long'));
  });

  test('that project has info, when it ends', () => {
    const wrapper = createWrapper({
      props: {
        projects: [{
          id: 123, name: 'project1', endDate: addDays(new Date(), 10), finished: false, users: [],
        }],
      },
    });

    const currentProject = wrapper.vm.projects[0];
    expect(wrapper.vm.getDateValueHeader(currentProject)).toBe('End');
    expect(wrapper.vm.getDateValue(currentProject)).toBe(formatDate(currentProject.endDate, 'long'));
  });
});
