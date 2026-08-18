import { addHours } from 'date-fns';

// Test constants for use in tests
export const TEST_STATION_ID = 1;
export const TEST_CHECKLIST_ID_1 = 'ba9ecf0c-1755-4c7d-8c49-33413c6db356';
export const TEST_CHECKLIST_ID_2 = '9e657b55-285c-480c-a92e-4e7ccbb4dbd4';
export const TEST_CHECKLIST_TASKS_COUNT = 8;
export const TEST_CHECKLIST_1_TASKS_COUNT = 5;

export const defaultChecklistTasks = [
  {
    id: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356#2-49-2024-05-13T03:30:00Z',
    name: '22.02 Regular interval',
    checklistId: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356',
    dateTime: '2024-05-13T06:30:00',
    dateTimeISO: '2024-05-13T06:30:00.000+03:00',
    submissionTime: null,
    submissionTimeISO: null,
    shiftId: 1184922,
    status: 'MISSED',
    description: "This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description",
    frequency: {
      productIds: [],
      resetOnChangeover: true,
      resetOnShiftStart: true,
      pauseDuringDowntime: false,
      type: 'INTERVAL',
      intervalTime: 1800,
    },
    elements: [
      {
        id: '1', name: 'Measure sth', unit: 'kg', minVal: 8, maxVal: 11, type: 'MEASUREMENT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: 'Is this message visible?', successful: false,
      },
      {
        id: '2', name: 'Yes or no', unit: '', minVal: null, maxVal: null, type: 'YES_NO', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: '', successful: false,
      },
      {
        id: '3', name: 'Enter text, this should be displayed in popup also. no NA', unit: '', minVal: null, maxVal: null, type: 'TEXT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
      {
        id: '4', name: 'Mark it done, no NA', unit: '', minVal: null, maxVal: null, type: 'CHECK', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
    ],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: false,
  },
  {
    id: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356#2-49-2024-05-13T06:30:00Z',
    name: '22.02 Regular interval',
    checklistId: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356',
    dateTime: '2024-05-13T09:30:00',
    dateTimeISO: '2024-05-13T09:30:00.000+03:00',
    submissionTime: '2024-05-13T12:06:40',
    submissionTimeISO: '2024-05-13T12:06:40.000+03:00',
    shiftId: 1184922,
    status: 'SUCCESSFUL',
    description: "This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description",
    frequency: {
      productIds: [],
      resetOnChangeover: true,
      resetOnShiftStart: true,
      pauseDuringDowntime: false,
      type: 'INTERVAL',
      intervalTime: 1800,
    },
    elements: [
      {
        id: '1', name: 'Measure sth', unit: 'kg', minVal: 8, maxVal: 11, type: 'MEASUREMENT', value: 9.0, comment: 'comment 1', valueNotApplicable: false, notApplicableEnabled: true, warningMessage: 'Is this message visible?', successful: true,
      },
      {
        id: '2', name: 'Yes or no', unit: '', minVal: null, maxVal: null, type: 'YES_NO', value: true, comment: 'comment 2', valueNotApplicable: false, notApplicableEnabled: true, warningMessage: '', successful: true,
      },
      {
        id: '3', name: 'Enter text, this should be displayed in popup also. no NA', unit: '', minVal: null, maxVal: null, type: 'TEXT', value: 'tere', comment: '', valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: true,
      },
      {
        id: '4', name: 'Mark it done, no NA', unit: '', minVal: null, maxVal: null, type: 'CHECK', value: true, comment: '', valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: true,
      },
    ],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: false,
  },
  {
    id: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356#2-49-2024-05-13T07:30:00Z',
    name: '22.02 Regular interval',
    checklistId: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356',
    dateTime: '2024-05-13T10:30:00',
    dateTimeISO: '2024-05-13T10:30:00.000+03:00',
    submissionTime: '2024-05-13T12:15:48',
    submissionTimeISO: '2024-05-13T12:15:48.000+03:00',
    shiftId: 1184922,
    status: 'UNSUCCESSFUL',
    description: "This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description",
    frequency: {
      productIds: [],
      resetOnChangeover: true,
      resetOnShiftStart: true,
      pauseDuringDowntime: false,
      type: 'INTERVAL',
      intervalTime: 1800,
    },
    elements: [
      {
        id: '1', name: 'Measure sth', unit: 'kg', minVal: 8, maxVal: 11, type: 'MEASUREMENT', value: 13.0, comment: '', valueNotApplicable: false, notApplicableEnabled: true, warningMessage: 'Is this message visible?', successful: false,
      },
      {
        id: '2', name: 'Yes or no', unit: '', minVal: null, maxVal: null, type: 'YES_NO', value: false, comment: '', valueNotApplicable: false, notApplicableEnabled: true, warningMessage: '', successful: false,
      },
      {
        id: '3', name: 'Enter text, this should be displayed in popup also. no NA', unit: '', minVal: null, maxVal: null, type: 'TEXT', value: 'asd', comment: '', valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: true,
      },
      {
        id: '4', name: 'Mark it done, no NA', unit: '', minVal: null, maxVal: null, type: 'CHECK', value: true, comment: '', valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: true,
      },
    ],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: false,
  },
  {
    id: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4#2-49-2024-05-13T07:55:00Z',
    name: 'Meeri: Passcode required + MA (18.03/11:16)',
    checklistId: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4',
    dateTime: '2024-05-13T10:55:00',
    dateTimeISO: '2024-05-13T10:55:00.000+03:00',
    submissionTime: '2024-05-13T12:06:24',
    submissionTimeISO: '2024-05-13T12:06:24.000+03:00',
    shiftId: 1184922,
    status: 'UNSUCCESSFUL',
    description: '',
    frequency: { productIds: [], resetOnChangeover: true, resetOnShiftStart: false, pauseDuringDowntime: false, type: 'INTERVAL', intervalTime: 1800 },
    elements: [{ id: '1', name: 'Length', unit: 'mm', minVal: 12, maxVal: 15, type: 'MEASUREMENT', value: 10.0, comment: '', valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false }],
    deleted: false, doneByEntityId: 'madli@evocon.com', doneBy: 'Madlii', conditionAuthenticationRequired: true,
  },
  {
    id: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4#2-49-2024-05-13T08:25:00Z',
    name: 'Meeri: Passcode required + MA (18.03/11:16)',
    checklistId: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4',
    dateTime: '2024-05-13T11:25:00',
    dateTimeISO: '2024-05-13T11:25:00.000+03:00',
    submissionTime: null,
    submissionTimeISO: null,
    shiftId: 1184922,
    status: 'MISSED',
    description: '',
    frequency: { productIds: [], resetOnChangeover: true, resetOnShiftStart: false, pauseDuringDowntime: false, type: 'INTERVAL', intervalTime: 1800 },
    elements: [{ id: '1', name: 'Length', unit: 'mm', minVal: 12, maxVal: 15, type: 'MEASUREMENT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false }],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: true,
  },
  {
    id: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356#2-49-2024-05-13T08:30:00Z',
    name: '22.02 Regular interval',
    checklistId: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356',
    dateTime: '2024-05-13T11:30:00',
    dateTimeISO: '2024-05-13T11:30:00.000+03:00',
    submissionTime: null,
    submissionTimeISO: null,
    shiftId: 1184922,
    status: 'MISSED',
    description: "This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description",
    frequency: {
      productIds: [],
      resetOnChangeover: true,
      resetOnShiftStart: true,
      pauseDuringDowntime: false,
      type: 'INTERVAL',
      intervalTime: 1800,
    },
    elements: [
      {
        id: '1', name: 'Measure sth', unit: 'kg', minVal: 8, maxVal: 11, type: 'MEASUREMENT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: 'Is this message visible?', successful: false,
      },
      {
        id: '2', name: 'Yes or no', unit: '', minVal: null, maxVal: null, type: 'YES_NO', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: '', successful: false,
      },
      {
        id: '3', name: 'Enter text, this should be displayed in popup also. no NA', unit: '', minVal: null, maxVal: null, type: 'TEXT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
      {
        id: '4', name: 'Mark it done, no NA', unit: '', minVal: null, maxVal: null, type: 'CHECK', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
    ],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: false,
  },
  {
    id: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4#2-49-2024-05-13T08:55:00Z',
    name: 'Meeri: Passcode required + MA (18.03/11:16)',
    checklistId: '9e657b55-285c-480c-a92e-4e7ccbb4dbd4',
    dateTime: '2024-05-13T11:55:00',
    dateTimeISO: '2024-05-13T11:55:00.000+03:00',
    submissionTime: null,
    submissionTimeISO: null,
    shiftId: 1184922,
    status: 'MISSED',
    description: '',
    frequency: { productIds: [], resetOnChangeover: true, resetOnShiftStart: false, pauseDuringDowntime: false, type: 'INTERVAL', intervalTime: 1800 },
    elements: [{ id: '1', name: 'Length', unit: 'mm', minVal: 12, maxVal: 15, type: 'MEASUREMENT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false }],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: true,
  },
  {
    id: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356#2-49-2024-05-13T09:00:00Z',
    name: '22.02 Regular interval',
    checklistId: 'ba9ecf0c-1755-4c7d-8c49-33413c6db356',
    dateTime: '2024-05-13T12:00:00',
    dateTimeISO: '2024-05-13T12:00:00.000+03:00',
    submissionTime: null,
    submissionTimeISO: null,
    shiftId: 1184922,
    status: 'NEW',
    description: "This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description, this can be 500 characters long, let's see how this displays everywhere. This is description",
    frequency: {
      productIds: [],
      resetOnChangeover: true,
      resetOnShiftStart: true,
      pauseDuringDowntime: false,
      type: 'INTERVAL',
      intervalTime: 1800,
    },
    elements: [
      {
        id: '1', name: 'Measure sth', unit: 'kg', minVal: 8, maxVal: 11, type: 'MEASUREMENT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: 'Is this message visible?', successful: false,
      },
      {
        id: '2', name: 'Yes or no', unit: '', minVal: null, maxVal: null, type: 'YES_NO', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: true, warningMessage: '', successful: false,
      },
      {
        id: '3', name: 'Enter text, this should be displayed in popup also. no NA', unit: '', minVal: null, maxVal: null, type: 'TEXT', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
      {
        id: '4', name: 'Mark it done, no NA', unit: '', minVal: null, maxVal: null, type: 'CHECK', value: null, comment: null, valueNotApplicable: false, notApplicableEnabled: false, warningMessage: '', successful: false,
      },
    ],
    deleted: false, doneByEntityId: null, doneBy: null, conditionAuthenticationRequired: false,
  },
];

export const getDefaultShift = () => ({ id: 12, endTime: addHours(new Date(), 2), endTimeISO: addHours(new Date(), 2).toISOString() });
