import { createTableHeadersConf } from './shiftsTableHeadersConf';

describe('shiftsTableHeadersConf', () => {
  vi.useFakeTimers();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct table headers configuration before 2024-12-03', () => {
    vi.setSystemTime(new Date('2024-12-02'));
    expect(createTableHeadersConf()).toMatchSnapshot();
  });

  it('returns correct table headers configuration after 2024-12-03', () => {
    vi.setSystemTime(new Date('2024-12-04'));
    expect(createTableHeadersConf()).toMatchSnapshot();
  });
});
