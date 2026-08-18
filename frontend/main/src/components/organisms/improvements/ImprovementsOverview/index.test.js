import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import {
  format, addYears, isBefore, isAfter, startOfDay,
} from 'date-fns';

import ImprovementsOverview from './index.vue';

import {
  useFilterbarStore,
  useProfileStore,
  useImprovementsProjectStore,
} from '@/stores/index';

const defaultPropsData = {
  isGridView: false,
  viewIndex: 0,
};

const defaultPiniaState = {
  filterbar: {
    currentFilterState: {},
    requestFilterState: {},
  },
  profile: {
    currentUser: {},
  },
  improvementsProject: {
    projects: [],
  },
};

describe('ImprovementsOverview', () => {
  it('renders correctly', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.element).toMatchSnapshot();
  });

  it('returns empty groups of projects', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory).toEqual({
      myProjects: [], ongoing: [], finished: [], upcoming: [], all: [],
    });
  });

  test('that if current user is team member of some project, then this project belongs to "my project" and "all projects" groups', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        profile: {
          currentUser: { username: 'doristest@test.com' },
        },
        improvementsProject: {
          projects: [{ id: 123, name: 'project1', users: [{ fullName: 'Doris test', userId: 'doristest@test.com' }] }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const profileStore = useProfileStore(pinia);
    expect(wrapper.vm.projectsGroupedByCategory.myProjects).toContainEqual({ id: 123, name: 'project1', users: [{ fullName: 'Doris test', userId: 'doristest@test.com' }] });
    expect(wrapper.vm.projectsGroupedByCategory.all).toContainEqual({ id: 123, name: 'project1', users: [{ fullName: 'Doris test', userId: 'doristest@test.com' }] });
    expect(profileStore.currentUser.username).toEqual(wrapper.vm.projectsGroupedByCategory.myProjects[0].users[0].userId);
  });

  test('that if some project is not finished, then this project belongs to "ongoing projects" and "all projects" groups', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: '2022-01-10', finished: false, users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },

      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory.ongoing).toContainEqual({
      id: 123, name: 'project1', startDate: '2022-01-10', finished: false, users: [],
    });
    expect(wrapper.vm.projectsGroupedByCategory.all).toContainEqual({
      id: 123, name: 'project1', startDate: '2022-01-10', finished: false, users: [],
    });
    expect(wrapper.vm.projectsGroupedByCategory.ongoing[0].finished).toBe(false);
  });

  test('that if some project is finished, then this project belongs to "finished projects" and "all projects" groups', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', finished: true, users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory.finished).toContainEqual({
      id: 123, name: 'project1', finished: true, users: [],
    });
    expect(wrapper.vm.projectsGroupedByCategory.all).toContainEqual({
      id: 123, name: 'project1', finished: true, users: [],
    });
    expect(wrapper.vm.projectsGroupedByCategory.finished[0].finished).toBe(true);
  });

  test('that if some project start date is after current date, then this project belongs to "upcoming projects" and "all projects" groups', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: format(addYears(new Date(), 25), 'yyyy-MM-dd'), users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const now = startOfDay(new Date());
    expect(wrapper.vm.projectsGroupedByCategory.upcoming).toContainEqual({
      id: 123, name: 'project1', startDate: format(addYears(new Date(), 25), 'yyyy-MM-dd'), users: [],
    });
    expect(wrapper.vm.projectsGroupedByCategory.all).toContainEqual({
      id: 123, name: 'project1', startDate: format(addYears(new Date(), 25), 'yyyy-MM-dd'), users: [],
    });
    expect(isAfter(new Date(wrapper.vm.projectsGroupedByCategory.upcoming[0].startDate), now)).toBe(true);
  });

  test('that projects group has only this project, which end date is after the "dateRange" start date, that is selected in filterbar', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: '2010-04-15', endDate: '2010-05-09', users: [],
          }, {
            id: 455, name: 'project2', startDate: '2010-05-14', endDate: '2010-11-12', users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: ['2010-05-11', '2010-11-14'], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const improvementsProjectStore = useImprovementsProjectStore(pinia);
    expect(improvementsProjectStore.projects.length).toBe(2);
    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(1);
    expect(wrapper.vm.projectsGroupedByCategory.all).toEqual([{
      id: 455, name: 'project2', startDate: '2010-05-14', endDate: '2010-11-12', users: [],
    }]);

    const filteredProjectEndDate = wrapper.vm.projectsGroupedByCategory.all[0].endDate;
    const filterbarStore = useFilterbarStore(pinia);
    const startDateInFilterbar = filterbarStore.requestFilterState.dateRange[0];
    expect(isAfter(new Date(filteredProjectEndDate), new Date(startDateInFilterbar))).toBe(true);
  });

  test('that projects group has only this project, which start date is before the "dateRange" end date, that is selected in filterbar', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: '2010-04-15', endDate: '2010-06-19', users: [],
          }, {
            id: 455, name: 'project2', startDate: '2010-11-15', endDate: '2010-12-12', users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: ['2010-05-11', '2010-11-14'], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const improvementsProjectStore = useImprovementsProjectStore(pinia);
    expect(improvementsProjectStore.projects.length).toBe(2);
    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(1);
    expect(wrapper.vm.projectsGroupedByCategory.all).toEqual([{
      id: 123, name: 'project1', startDate: '2010-04-15', endDate: '2010-06-19', users: [],
    }]);

    const filteredProjectStartDate = wrapper.vm.projectsGroupedByCategory.all[0].startDate;
    const filterbarStore = useFilterbarStore(pinia);
    const endDateInFilterbar = filterbarStore.requestFilterState.dateRange[1];
    expect(isBefore(new Date(filteredProjectStartDate), new Date(endDateInFilterbar))).toBe(true);
  });

  test('that projects group has only this project, which factory id is selected in filterbar', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', factoryId: 1, users: [],
          }, {
            id: 455, name: 'project2', factoryId: 2, users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [1], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const improvementsProjectStore = useImprovementsProjectStore(pinia);
    expect(improvementsProjectStore.projects.length).toBe(2);
    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(1);
    expect(wrapper.vm.projectsGroupedByCategory.all).toEqual([{
      id: 123, name: 'project1', factoryId: 1, users: [],
    }]);

    const filteredProjectFactoryId = wrapper.vm.projectsGroupedByCategory.all[0].factoryId;
    const filterbarStore = useFilterbarStore(pinia);
    const factoryIdsInFilterbar = filterbarStore.requestFilterState.factoryId;
    expect(factoryIdsInFilterbar.includes(filteredProjectFactoryId)).toBe(true);
  });

  test('that projects group has only this project, which station id is selected in filterbar', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', stationIds: [11, 12], users: [],
          }, {
            id: 455, name: 'project2', stationIds: [15, 16], users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [10, 16], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const improvementsProjectStore = useImprovementsProjectStore(pinia);
    expect(improvementsProjectStore.projects.length).toBe(2);
    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(1);
    expect(wrapper.vm.projectsGroupedByCategory.all).toEqual([{
      id: 455, name: 'project2', stationIds: [15, 16], users: [],
    }]);

    const filteredProjectStationIds = wrapper.vm.projectsGroupedByCategory.all[0].stationIds;
    const filterbarStore = useFilterbarStore(pinia);
    const stationIdsInFilterbar = filterbarStore.requestFilterState.stationId;
    expect(filteredProjectStationIds.some((id) => stationIdsInFilterbar.includes(id))).toBe(true);
  });

  test('that projects group has only this project, which user is selected in filterbar', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', users: [{ fullName: 'Doris test', userId: 'doristest@test.com' }],
          }, {
            id: 455, name: 'project2', users: [{ fullName: 'Doris another test', userId: 'doristest2@test2.com' }],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: ['doristest2@test2.com'],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    const improvementsProjectStore = useImprovementsProjectStore(pinia);
    expect(improvementsProjectStore.projects.length).toBe(2);
    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(1);
    expect(wrapper.vm.projectsGroupedByCategory.all).toEqual([{
      id: 455, name: 'project2', users: [{ fullName: 'Doris another test', userId: 'doristest2@test2.com' }],
    }]);

    const filteredProjectUserId = wrapper.vm.projectsGroupedByCategory.all[0].users[0].userId;
    const filterbarStore = useFilterbarStore(pinia);
    const userIdInFilterbar = filterbarStore.requestFilterState.userId[0];
    expect(filteredProjectUserId).toEqual(userIdInFilterbar);
  });

  test('that after viewIndex is set to 1, then grid view is hidden', async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: { ...defaultPiniaState },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.find('#projects-grid-view').isVisible()).toBe(true);
    expect(wrapper.find('#projects-table-view').exists()).toBe(false);
    await wrapper.setData({ viewIndex: 1 });
    expect(wrapper.find('#projects-grid-view').exists()).toBe(false);
    expect(wrapper.find('#projects-table-view').isVisible()).toBe(true);
  });

  test('that default active tab index is 0, when current user is team member of some projects and these projects belong to "my project" group', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        profile: {
          currentUser: { username: 'doristest@test.com' },
        },
        improvementsProject: {
          projects: [
            { id: 123, name: 'project1', users: [{ fullName: 'Doris test', userId: 'doristest@test.com' }] },
            { id: 456, name: 'project2', users: [{ fullName: 'Doris test 2', userId: 'doristest@test.com' }] },
          ],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory.myProjects.length).toBe(2);
    wrapper.vm.setActiveTab();
    expect(wrapper.vm.activeTab).toBe(0);
  });

  test('that default active tab index is 2, when "my projects" group doesnt have any projects, but there are some unfinished projects that belong to "ongoing projects" group', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        profile: {
          currentUser: { username: 'doristest@test.com' },
        },
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: '2022-01-10', finished: false, users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory.ongoing.length).toBe(1);
    wrapper.vm.setActiveTab();
    expect(wrapper.vm.activeTab).toBe(2);
  });

  test('that default active tab index is 1, when "my projects" group and "ongoing projects" group dont have any projects', () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        ...defaultPiniaState,
        profile: {
          currentUser: { username: 'doristest@test.com' },
        },
        improvementsProject: {
          projects: [{
            id: 123, name: 'project1', startDate: '', finished: false, users: [],
          }, {
            id: 456, name: 'project2', startDate: '', finished: false, users: [],
          }, {
            id: 7565, name: 'project3', startDate: '', finished: false, users: [],
          }],
        },
        filterbar: {
          currentFilterState: {},
          requestFilterState: {
            dateRange: [], factoryId: [], stationId: [], userId: [],
          },
        },
      },
    });
    const wrapper = shallowMount(ImprovementsOverview, {
      props: { ...defaultPropsData },
      global: { plugins: [pinia] },
    });

    expect(wrapper.vm.projectsGroupedByCategory.all.length).toBe(3);
    wrapper.vm.setActiveTab();
    expect(wrapper.vm.activeTab).toBe(1);
  });
});
