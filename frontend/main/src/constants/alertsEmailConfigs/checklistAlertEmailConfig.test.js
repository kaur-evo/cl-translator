import { checklistAlertEmailConfig } from '@/constants/alertsEmailConfigs/checklistAlertEmailConfig';

describe('checklistAlertEmailConfig', () => {
  it('should return default email template', () => {
    const { subject, message } = checklistAlertEmailConfig.getEmailTemplate();
    expect(subject).toBe('{ChecklistName} on {Station} is {ChecklistResult}');
    expect(message).toBe(`Checklist name: {ChecklistName}
    <br> Checklist result: {ChecklistResult}
    <br> Task results: {TaskResults}
    <br> Due time: {DueTime}
    <br> Done: {Done}
    <br> Factory: {Factory}
    <br> Station: {Station}
    <br> Shift: {Shift}
    <br> Active operators: {ActiveOperators}
    <br> Done by: {DoneBy}
    <br> Link: {ShiftURL}`);
  });

  it('should return default variables', () => {
    const variables = checklistAlertEmailConfig.getVariables();
    expect(variables).toEqual([
      { displayName: 'Active operators', variableName: '{ActiveOperators}' },
      { displayName: 'Checklist name', variableName: '{ChecklistName}' },
      { displayName: 'Checklist result', variableName: '{ChecklistResult}' },
      { displayName: 'Done', variableName: '{Done}' },
      { displayName: 'Done by', variableName: '{DoneBy}' },
      { displayName: 'Due time', variableName: '{DueTime}' },
      { displayName: 'Factory', variableName: '{Factory}' },
      { displayName: 'Shift', variableName: '{Shift}' },
      { displayName: 'Shift URL', variableName: '{ShiftURL}' },
      { displayName: 'station', variableName: '{Station}' },
      { displayName: 'Task results', variableName: '{TaskResults}' },
    ]);
  });
});
