import { defaultAlertEmailConfig } from './defaultAlertEmailConfig';

describe('defaultAlertEmailConfig', () => {
  describe('getEmailTemplate', () => {
    it('returns default email template', () => {
      const { subject, message } = defaultAlertEmailConfig.getEmailTemplate();
      expect(subject).toBe('');
      expect(message).toBe(`Station: {Station}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL}`);
    });

    it('returns scrap alert email template', () => {
      const { subject, message } = defaultAlertEmailConfig.getEmailTemplate('SCRAPREASON');
      expect(subject).toBe('{ScrapReason} ({ScrapQuantity}) on {Station}');
      expect(message).toBe(`Station: {Station}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL}`);
    });

    it('returns changeover alert email template for ADDED subtype', () => {
      const { subject, message } = defaultAlertEmailConfig.getEmailTemplate('CHANGEOVER', 'ADDED');
      expect(subject).toBe('Changeover added - {Product} on {Station}');
      expect(message).toBe(`Station: {Station}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL}`);
    });

    it('returns changeover alert email template for PLANNED_QTY subtype', () => {
      const { subject, message } = defaultAlertEmailConfig.getEmailTemplate('CHANGEOVER', 'PLANNED_QTY');
      expect(subject).toBe('Target reached - {Product} on {Station}');
      expect(message).toBe(`Station: {Station}
  <br> Shift: {Shift}
  <br> Active operators: {ActiveOperators}
  <br> Link: {ShiftURL}`);
    });
  });

  describe('getVariables', () => {
    it('returns default variables', () => {
      const variables = defaultAlertEmailConfig.getVariables();
      expect(variables).toEqual([
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'station', variableName: '{Station}' },
      ]);
    });

    it('returns scrap alert variables', () => {
      const variables = defaultAlertEmailConfig.getVariables('SCRAPREASON');
      expect(variables).toEqual([
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'quantity', variableName: '{ScrapQuantity}' },
        { displayName: 'Reason', variableName: '{ScrapReason}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'station', variableName: '{Station}' },
        { displayName: 'Time', variableName: '{ScrapTime}' },
      ]);
    });

    it('returns changeover alert variables', () => {
      const variables = defaultAlertEmailConfig.getVariables('CHANGEOVER');
      expect(variables).toEqual([
        { displayName: 'Active operators', variableName: '{ActiveOperators}' },
        { displayName: 'Extra note', variableName: '{Note}' },
        { displayName: 'Factory', variableName: '{Factory}' },
        { displayName: 'LOT/Batch', variableName: '{Lot/Batch}' },
        { displayName: 'Order', variableName: '{OrderNumber}' },
        { displayName: 'Product', variableName: '{Product}' },
        { displayName: 'Product code', variableName: '{ProductCode}' },
        { displayName: 'Shift', variableName: '{Shift}' },
        { displayName: 'Shift URL', variableName: '{ShiftURL}' },
        { displayName: 'station', variableName: '{Station}' },
        { displayName: 'Target quantity', variableName: '{TargetQuantity}' },
        { displayName: 'Time', variableName: '{BatchStartTime}' },
      ]);
    });
  });
});
