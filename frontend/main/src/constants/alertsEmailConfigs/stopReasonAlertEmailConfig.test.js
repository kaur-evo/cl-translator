import { stopReasonAlertEmailConfig } from '@/constants/alertsEmailConfigs/stopReasonAlertEmailConfig';

describe('stopReasonAlertEmailConfig', () => {
  describe('getEmailTemplate', () => {
    it('should return the default email template for EXCEEDS alert subtype', () => {
      const alertSubtype = 'EXCEEDS';
      const { subject, message } = stopReasonAlertEmailConfig.getEmailTemplate(alertSubtype);
      expect(subject).toBe('{Reason} on {Station}');
      expect(message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
    });

    it('should return the default email template for ADDED alert subtype', () => {
      const alertSubtype = 'ADDED';
      const { subject, message } = stopReasonAlertEmailConfig.getEmailTemplate(alertSubtype);
      expect(subject).toBe('{Reason} on {Station}');
      expect(message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
    });

    it('should return the default email template + count row for REPEATS alert subtype', () => {
      const alertSubtype = 'REPEATS';
      const { subject, message } = stopReasonAlertEmailConfig.getEmailTemplate(alertSubtype);
      expect(subject).toBe('{Reason} ({Count}) on {Station}');
      expect(message).toBe(`Stop reason: {Reason}
  <br> Note: {Note}
  <br> Start time: {StartTime}
  <br> Duration: {Duration}
  <br> Factory: {Factory}
  <br> Station: {Station}
  <br> Machine location: {Location}
  <br> Product: {Product}
  <br> Product code: {ProductCode}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL} `);
    });
  });
  describe('getVariables', () => {
    it('should return an array of default variables for EXCEEDS alert subtype', () => {
      const alertSubtype = 'EXCEEDS';
      const variables = stopReasonAlertEmailConfig.getVariables(alertSubtype);
      const expectedVariables = [
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Duration', variableName: '{Duration}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'Loss', variableName: '{Loss}' },
        { displayName: 'Machine location', variableName: '{Location}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'Reason', variableName: '{Reason}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'Start time', variableName: '{StartTime}' },
        { displayName: 'station', variableName: '{Station}' },
      ];
      expect(variables).toEqual(expectedVariables);
    });

    it('should return an array of default variables for ADDED alert subtype', () => {
      const alertSubtype = 'ADDED';
      const variables = stopReasonAlertEmailConfig.getVariables(alertSubtype);
      const expectedVariables = [
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Duration', variableName: '{Duration}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'Loss', variableName: '{Loss}' },
        { displayName: 'Machine location', variableName: '{Location}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'Reason', variableName: '{Reason}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'Start time', variableName: '{StartTime}' },
        { displayName: 'station', variableName: '{Station}' },
      ];
      expect(variables).toEqual(expectedVariables);
    });

    it('should return an array of default variables + count variable for REPEATS alert subtype', () => {
      const alertSubtype = 'REPEATS';
      const variables = stopReasonAlertEmailConfig.getVariables(alertSubtype);
      const expectedVariables = [
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Count', variableName: '{Count}' },
        { displayName: 'Duration', variableName: '{Duration}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'Loss', variableName: '{Loss}' },
        { displayName: 'Machine location', variableName: '{Location}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'Reason', variableName: '{Reason}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'Start time', variableName: '{StartTime}' },
        { displayName: 'station', variableName: '{Station}' },
      ];
      expect(variables).toEqual(expectedVariables);
    });
  });
});
