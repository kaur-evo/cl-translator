import { useI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

import getTimeDeviationTableHeaders, { formatShiftTimeRange } from '@/components/pages/settings/SettingsShiftsEdit/timeDeviationTableHeadersConf';
import useDeviceStore from '@/stores/device';
import useStationStore from '@/stores/station';
import { formatDateInZone } from '@/helpers/date/formatDate';
import { formatTimeInZone } from '@/helpers/time/formatTime';
import humanizeDuration from '@/helpers/time/humanizeDuration';

const mockGetOrderedStationNamesArray = vi.fn((ids) => ids.map((id) => `Station${id}`));
const mockGetZoneIdByStationIds = vi.fn(() => 'Europe/Berlin');

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: vi.fn(),
  };
});
vi.mock('@/helpers/date/formatDate', () => ({
  formatDateInZone: vi.fn((val, format) => `formattedDate(${val},${format})`),
}));
vi.mock('@/helpers/time/formatTime', () => ({
  formatTimeInZone: vi.fn((time, zoneId) => `formattedTime(${time},${zoneId})`),
}));
vi.mock('@/helpers/time/humanizeDuration', () => ({
  default: vi.fn((seconds, opts) => `humanized(${seconds},${JSON.stringify(opts)})`),
}));

describe('timeDeviationTableHeadersConf', () => {
  describe('timeDeviationTableHeadersConf', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      const pinia = createTestingPinia({ createSpy: vi.fn });
      setActivePinia(pinia);
      const deviceStore = useDeviceStore(pinia);
      deviceStore.isMobileView = false;
      const stationStore = useStationStore(pinia);
      stationStore.getOrderedStationNamesArray = mockGetOrderedStationNamesArray;
      stationStore.getZoneIdByStationIds = mockGetZoneIdByStationIds;
    });

    it('should return correct headers structure', () => {
      const tMock = vi.fn((key) => `translated:${key}`);
      useI18n.mockReturnValue({ t: tMock });

      const headers = getTimeDeviationTableHeaders();
      expect(headers).toHaveLength(4);
      expect(headers[0]).toMatchObject({
        text: 'translated:Shift date',
        value: 'startTime',
        textKey: 'startTime',
        isBold: true,
        isFixed: true,
      });
      expect(typeof headers[0].formatFn).toBe('function');
      expect(headers[1].text).toBe('translated:Shift time');
      expect(headers[2].text).toBe('translated:station');
      expect(headers[3]).toMatchObject({
        filterable: false,
        sortable: false,
        style: { padding: '0 !important', width: '112px', maxWidth: '112px', minWidth: '112px' },
        isSlotColumn: true,
        slotName: 'row-actions',
        notClickable: true,
        type: 'number',
      });
    });

    it('formatFn for Shift date calls formatDate', () => {
      const tMock = vi.fn();
      useI18n.mockReturnValue({ t: tMock });
      const headers = getTimeDeviationTableHeaders();
      headers[0].formatFn('2024-01-01', { stationIds: [1] });
      expect(formatDateInZone).toHaveBeenCalledWith('2024-01-01', 'Europe/Berlin', 'long');
    });

    it('formatFn for Shift time calls formatShiftTimeRange and getZoneIdByStationIds', () => {
      const tMock = vi.fn();
      useI18n.mockReturnValue({ t: tMock });

      const headers = getTimeDeviationTableHeaders();
      const obj = {
        startTime: '2024-01-01T08:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
        stationIds: ['1'],
      };
      const result = headers[1].formatFn(obj.startTime, obj);
      expect(result).toContain('('); // Should contain duration
    });

    it('formatFn for station column returns joined station names', () => {
      const tMock = vi.fn();
      useI18n.mockReturnValue({ t: tMock });

      const headers = getTimeDeviationTableHeaders(['1', '2']);
      const val = ['1', '2'];
      const result = headers[2].formatFn(val);
      expect(result).toBe('Station1, Station2');
      expect(mockGetOrderedStationNamesArray).toHaveBeenCalledWith(val);
    });

    describe('formatShiftTimeRange', () => {
      it('formats time range and duration', () => {
        formatTimeInZone.mockImplementation((time, zoneId) => `T(${time},${zoneId})`);
        humanizeDuration.mockImplementation((seconds, opts) => `D(${seconds},${JSON.stringify(opts)})`);

        const obj = {
          startTime: '2024-01-01T08:00:00Z',
          endTime: '2024-01-01T10:00:00Z',
        };
        const result = formatShiftTimeRange(obj, 'Europe/Berlin');
        expect(result).toBe('T(2024-01-01T08:00:00Z,Europe/Berlin) - T(2024-01-01T10:00:00Z,Europe/Berlin) (D(7200,{"type":"min","largest":"hour"}))');
      });
    });
  });
});
