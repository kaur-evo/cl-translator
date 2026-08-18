import { describe, it, expect } from 'vitest';

import tooltipTemplate from './tooltipTemplate';

import vIconRawTemplate from '@/helpers/html/vIconRawTemplate';
import { getIconAsset } from '@/helpers/file/getAsset';

vi.mock('@/helpers/html/vIconRawTemplate');
vi.mock('@/helpers/file/getAsset');

describe('tooltipTemplate', () => {
  beforeEach(() => {
    vIconRawTemplate.mockImplementation((icon) => `<svg>${icon}</svg>`);
    getIconAsset.mockImplementation((path) => `/assets/${path}`);
  });

  it('should return correct template with topLabel and topLabelIcon', () => {
    const result = tooltipTemplate({
      topLabel: 'Top Label',
      topLabelIcon: true,
      topLabelIconColor: 'red',
      primaryLabel: 'Primary Label',
      paramRows: [],
      useAxisIcons: false,
      note: '',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template with paramRows and useAxisIcons', () => {
    const result = tooltipTemplate({
      topLabel: '',
      topLabelIcon: false,
      topLabelIconColor: '',
      primaryLabel: 'Primary Label',
      paramRows: [
        {
          key: 'Param1', value: 'Value1', color: 'blue', isOnLeftYAxis: true, isOnRightYAxis: false, secondaryValue: 'Secondary1',
        },
        {
          key: 'Param2', value: 'Value2', color: '', isOnLeftYAxis: false, isOnRightYAxis: true, secondaryValue: '',
        },
      ],
      useAxisIcons: true,
      note: '',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template with note', () => {
    const result = tooltipTemplate({
      topLabel: '',
      topLabelIcon: false,
      topLabelIconColor: '',
      primaryLabel: 'Primary Label',
      paramRows: [],
      useAxisIcons: false,
      note: 'This is a note',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template without optional fields', () => {
    const result = tooltipTemplate({
      primaryLabel: 'Primary Label',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template with all fields', () => {
    const result = tooltipTemplate({
      topLabel: 'Top Label',
      topLabelIcon: true,
      topLabelIconColor: 'red',
      primaryLabel: 'Primary Label',
      paramRows: [
        {
          key: 'Param1', value: 'Value1', color: 'blue', isOnLeftYAxis: true, isOnRightYAxis: false, secondaryValue: 'Secondary1',
        },
        {
          key: 'Param2', value: 'Value2', color: '', isOnLeftYAxis: false, isOnRightYAxis: true, secondaryValue: '',
        },
      ],
      useAxisIcons: true,
      note: 'This is a note',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template with empty paramRows', () => {
    const result = tooltipTemplate({
      topLabel: 'Top Label',
      topLabelIcon: false,
      topLabelIconColor: '',
      primaryLabel: 'Primary Label',
      paramRows: [],
      useAxisIcons: true,
      note: '',
    });

    expect(result).toMatchSnapshot();
  });

  it('should return correct template with only topLabel and primaryLabel', () => {
    const result = tooltipTemplate({
      topLabel: 'Top Label',
      primaryLabel: 'Primary Label',
    });

    expect(result).toMatchSnapshot();
  });
});
