import { shallowMount } from '@vue/test-utils';

import AlertVariablesMenu from './index.vue';

import { getAlertVariables, alertTypes, alertSubtypes } from '@/constants/alerts';

document.body.setAttribute('data-app', true);

describe('AlertVariablesMenu', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(AlertVariablesMenu, { props: { variables: [{ displayName: 'Display name', variableName: '{VariableName}' }] } });

    expect(wrapper.element).toMatchSnapshot();
  });
  it('has correct variables when alert type is STOPREASON', async () => {
    const wrapper = shallowMount(AlertVariablesMenu, { props: { variables: getAlertVariables(alertTypes.STOPREASON, alertSubtypes.EXCEEDS) } });

    expect(wrapper.vm.variables).toEqual([
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
    ]);
  });

  it('has correct variables when alert type is CHECKLIST', async () => {
    const wrapper = shallowMount(AlertVariablesMenu, { props: { variables: getAlertVariables(alertTypes.CHECKLIST) } });

    expect(wrapper.vm.variables).toEqual([
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
