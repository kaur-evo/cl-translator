import { createTableHeadersConf } from './devicesTableHeadersConf';

import useStationStore from '@/stores/station';
import { getFormattedDeviceInput } from '@/helpers/device/device-helpers';

describe('devicesTableHeadersConf', () => {
  it('creates table conf', () => {
    expect(createTableHeadersConf()).toMatchSnapshot();
  });
  describe('device inputs', () => {
    const tableConf = createTableHeadersConf();
    for (let i = 1; i <= 4; i += 1) {
      const input = tableConf.find((item) => item.textKey === `input${i}`);

      test(`that input with number ${i} does not return any class and returns station name, if station is present`, () => {
        useStationStore().stations = [{ id: 1, name: 'Station1' }];
        const device = { inputs: [{ inputNumber: i, stationId: 1 }] };
        expect(input.class(device)).toBe('');
        expect(getFormattedDeviceInput(device.inputs, i)).toBe('Station1');
      });

      test(`that input with number ${i} returns text--secondary class and "Inactive", if station is not present`, () => {
        useStationStore().stations = [{ id: 1, name: 'Station1' }];
        const device = { inputs: [{ inputNumber: i, stationId: 3 }] };
        expect(input.class(device)).toBe('text--secondary');
        expect(getFormattedDeviceInput(device.inputs, i)).toBe('Inactive');
      });
    }
  });
});
