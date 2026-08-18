import { entities, entityUrlParams } from './activityLogsConstants';

describe('activityLogsConstants', () => {
  it('returns correct entities map', () => {
    expect(entities).toMatchSnapshot();
  });

  it('returns correct entityUrlParams map', () => {
    expect(entityUrlParams).toMatchSnapshot();
  });
});
