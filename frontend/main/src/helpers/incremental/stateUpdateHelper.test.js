import { subMinutes, subSeconds } from 'date-fns';

import stateUpdateHelper from './incrementalStateHelper';

vi.mock('@/helpers/incremental/calculateLastSliceQuantity', () => ({
  default: vi.fn(() => 1),
  __esModule: true,
}));

const state = [
  {
    sliceStartTmISO: '2020-02-20T22:10:20.000Z',
    sliceEndTmISO: '2020-02-20T22:12:20.000Z',
    originalEndTimeString: '2020-02-20T22:12:20.000Z',
    id: 0,
  },
  {
    sliceStartTmISO: '2020-02-20T22:12:20.000Z',
    sliceEndTmISO: '2020-02-20T22:13:20.000Z',
    originalEndTimeString: '2020-02-20T22:13:20.000Z',
    id: 1,
  },
];

describe('StateUpdateHelper', () => {
  it('deletes element with given endtime', () => {
    const updates = {
      added: [],
      changed: {},
      deletedISO: ['2020-02-20T22:12:20.000Z'],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(state, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(1);
    expect(newState.transformedTimeline[0].originalEndTimeString).toBe('2020-02-20T22:13:20.000Z');
  });
  it('adds new element to end', () => {
    const updates = {
      added: [{
        id: 3, startTimeLocalISO: '2020-02-20T22:13:20.000Z', endTimeLocalISO: '2020-02-20T22:13:40.000Z', batchId: 1234, commentId: 2, cycleTimeCritical: 60, cycleTimeGood: 30,
      }],
      changed: {},
      deletedISO: [],
    };
    const batches = new Map();
    batches.set(1234, { cycleTimeCritical: 60, cycleTimeGood: 30 });
    const comments = new Map();
    comments.set(2, { id: 2 });
    const newState = stateUpdateHelper(state, updates, batches, comments);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:12:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:12:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:13:20.000Z');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2020-02-20T22:13:20.000Z');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2020-02-20T22:13:40.000Z');
  });

  it('deletes all elements that have the same originalEndTimeString that is in deleted', () => {
    const currentState = [
      {
        startTimeISO: '2020-02-20T22:10:20.000Z',
        endTime: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:20.000Z',
      },
      {
        startTimeISO: '2020-02-20T22:11:20.000Z',
        endTime: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:20.000Z',
      },
      {
        startTimeISO: '2020-02-20T22:12:20.000Z',
        endTime: '2020-02-20T22:13:20.000Z',
        originalEndTimeString: '2020-02-20T22:13:20.000Z',
      },
    ];
    const updates = {
      added: [],
      changed: {},
      deletedISO: ['2020-02-20T22:11:20.000Z'],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(1);
    expect(newState.transformedTimeline[0].startTimeISO).toBe('2020-02-20T22:12:20.000Z');
    expect(newState.transformedTimeline[0].endTime).toBe('2020-02-20T22:13:20.000Z');
  });

  it('changes only last item in case of FE update (faking === true)', () => {
    const currentState = [
      {
        sliceStartTmISO: '2020-02-20T22:00:00.000Z',
        sliceEndTmISO: '2020-02-20T22:10:20.000Z',
        originalEndTimeString: '2020-02-20T22:10:20.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:10:20.000Z',
        sliceEndTmISO: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
        fake: true,
      },
      {
        sliceStartTmISO: '2020-02-20T22:11:20.000Z',
        sliceEndTmISO: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
        fake: true,
      },
    ];
    const updates = {
      added: [],
      changed: {
        '2020-02-20T22:11:00.000Z': {
          sliceStartTmISO: '2020-02-20T22:11:20.000Z',
          sliceEndTmISO: '2020-02-20T22:13:00.000Z',
          cycleTimeCritical: 60,
          cycleTimeGood: 90,
          isFake: true,
        },
      },
      deletedISO: [],
      faking: true,
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:00:00.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2020-02-20T22:13:00.000Z');
  });

  it('changes first item and deletes others in case of BE update (faking === false)', () => {
    const currentState = [
      {
        sliceStartTmISO: '2020-02-20T22:00:00.000Z',
        sliceEndTmISO: '2020-02-20T22:10:20.000Z',
        originalEndTimeString: '2020-02-20T22:10:20.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:10:20.000Z',
        sliceEndTmISO: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:11:20.000Z',
        sliceEndTmISO: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
      },
    ];
    const updates = {
      added: [],
      changed: {
        '2020-02-20T22:11:00.000Z': {
          sliceStartTmISO: '2020-02-20T22:11:20.000Z',
          sliceEndTmISO: '2020-02-20T22:13:00.000Z',
          isFake: true,
          cycleTimeCritical: 60,
          cycleTimeGood: 90,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(2);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:00:00.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:13:00.000Z');
  });

  it('changes one element with FE update when only one matches the time', () => {
    const currentState = [
      {
        sliceStartTmISO: '2020-02-20T22:00:00.000Z',
        sliceEndTmISO: '2020-02-20T22:10:20.000Z',
        originalEndTimeString: '2020-02-20T22:10:20.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:10:20.000Z',
        sliceEndTmISO: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:11:20.000Z',
        sliceEndTmISO: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:12:20.000Z',
      },
    ];
    const updates = {
      added: [],
      changed: {
        '2020-02-20T22:12:20.000Z': {
          sliceStartTmISO: '2020-02-20T22:11:20.000Z',
          sliceEndTmISO: '2020-02-20T22:13:00.000Z',
          cycleTimeCritical: 60,
          cycleTimeGood: 90,
          isFake: true,
        },
      },
      deletedISO: [],
      faking: true,
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:00:00.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2020-02-20T22:13:00.000Z');
  });

  it('changes one element with BE update when only one matches the time', () => {
    const currentState = [
      {
        sliceStartTmISO: '2020-02-20T22:00:00.000Z',
        sliceEndTmISO: '2020-02-20T22:10:20.000Z',
        originalEndTimeString: '2020-02-20T22:10:20.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:10:20.000Z',
        sliceEndTmISO: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:11:20.000Z',
        sliceEndTmISO: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:12:20.000Z',
      },
    ];
    const updates = {
      added: [],
      changed: {
        '2020-02-20T22:12:20.000Z': {
          sliceStartTmISO: '2020-02-20T22:11:20.000Z', sliceEndTmISO: '2020-02-20T22:13:00.000Z', isFake: true, cycleTimeCritical: 60, cycleTimeGood: 90,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:00:00.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2020-02-20T22:13:00.000Z');
  });

  it('returns timeline ordered by startTime', () => {
    const currentState = [
      {
        sliceStartTmISO: '2020-02-20T22:00:00.000Z',
        sliceEndTmISO: '2020-02-20T22:10:20.000Z',
        originalEndTimeString: '2020-02-20T22:10:20.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:10:20.000Z',
        sliceEndTmISO: '2020-02-20T22:11:20.000Z',
        originalEndTimeString: '2020-02-20T22:11:00.000Z',
      },
      {
        sliceStartTmISO: '2020-02-20T22:11:20.000Z',
        sliceEndTmISO: '2020-02-20T22:12:20.000Z',
        originalEndTimeString: '2020-02-20T22:12:20.000Z',
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: '2020-02-20T22:09:00.000Z', endTimeLocalISO: '2020-02-20T22:10:20.000Z', batchId: 1234, commentId: 2, cycleTimeCritical: 60, cycleTimeGood: 30,
      }],
      changed: {},
      deletedISO: ['2020-02-20T22:10:20.000Z'],
    };
    const batches = new Map();
    batches.set(1234, { cycleTimeCritical: 60, cycleTimeGood: 30 });
    const comments = new Map();
    comments.set(2, { id: 2 });
    const newState = stateUpdateHelper(currentState, updates, batches, comments);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2020-02-20T22:09:00.000Z');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2020-02-20T22:10:20.000Z');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2020-02-20T22:11:20.000Z');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2020-02-20T22:12:20.000Z');
  });

  it('handles a case when new product slice and running slice are added, but they are not ordered', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const twoMinutesAgo = subMinutes(now, 2);
    const threeMinutesAgo = subMinutes(now, 3);
    const tenSecsAgo = subSeconds(now, 10);
    const currentState = [
      {
        startTimeISO: threeMinutesAgo,
        endTime: twoMinutesAgo,
        sliceStartTmISO: threeMinutesAgo.toISOString(),
        sliceEndTmISO: twoMinutesAgo.toISOString(),
        originalEndTimeString: twoMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: twoMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: twoMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: minuteAgo.toISOString(),
        endTimeLocalISO: tenSecsAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 0,
        cycleTimeCritical: 60,
        cycleTimeGood: 30,
      },
      {
        startTimeLocalISO: twoMinutesAgo.toISOString(),
        endTimeLocalISO: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
        cycleTimeCritical: 60,
        cycleTimeGood: 30,
      }],
      changed: {},
      deletedISO: [minuteAgo.toISOString()],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 30 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const shift = { isShiftRunning: true, startTimeISO: threeMinutesAgo.toISOString() };
    const newState = stateUpdateHelper(currentState, updates, batches, comments, shift);
    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(twoMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(tenSecsAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('PRODUCT');
  });

  it('returns correct state when multiple stoppages are edited', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const fourMinutesAgo = subMinutes(now, 4);
    const fiveMinutesAgo = subMinutes(now, 5);
    const sixMinutesAgo = subMinutes(now, 6);
    const sevenMinutesAgo = subMinutes(now, 7);
    const eightMinutesAgo = subMinutes(now, 8);
    const nineMinutesAgo = subMinutes(now, 9);
    const tenMinutesAgo = subMinutes(now, 10);
    const currentState = [
      {
        startTimeISO: tenMinutesAgo,
        endTime: nineMinutesAgo,
        sliceStartTmISO: tenMinutesAgo.toISOString(),
        sliceEndTmISO: nineMinutesAgo.toISOString(),
        originalEndTimeString: nineMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: nineMinutesAgo,
        endTime: sevenMinutesAgo,
        sliceStartTmISO: nineMinutesAgo.toISOString(),
        sliceEndTmISO: sevenMinutesAgo.toISOString(),
        originalEndTimeString: sevenMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
      },
      {
        startTimeISO: sevenMinutesAgo,
        endTime: sixMinutesAgo,
        sliceStartTmISO: sevenMinutesAgo.toISOString(),
        sliceEndTmISO: sixMinutesAgo.toISOString(),
        originalEndTimeString: sixMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: sixMinutesAgo,
        endTime: fourMinutesAgo,
        sliceStartTmISO: sixMinutesAgo.toISOString(),
        sliceEndTmISO: fourMinutesAgo.toISOString(),
        originalEndTimeString: fourMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
      },
      {
        startTimeISO: fourMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: fourMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: nineMinutesAgo.toISOString(),
        endTimeLocalISO: eightMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 0,
      },
      {
        startTimeLocalISO: sixMinutesAgo.toISOString(),
        endTimeLocalISO: fiveMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 2,
      }],
      changed: {
        [sevenMinutesAgo.toISOString()]: {
          startTimeLocalISO: eightMinutesAgo.toISOString(),
          endTimeLocalISO: sevenMinutesAgo.toISOString(),
          type: 'STOPPAGE',
          commentId: 2,
          batchId: 1234,
        },
        [fourMinutesAgo.toISOString()]: {
          startTimeLocalISO: fiveMinutesAgo.toISOString(),
          endTimeLocalISO: fourMinutesAgo.toISOString(),
          type: 'STOPPAGE',
          commentId: 0,
          batchId: 1234,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 30 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches, comments);

    expect(newState.transformedTimeline).toHaveLength(7);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(nineMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(eightMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(0);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(sevenMinutesAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(2);
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe(sixMinutesAgo.toISOString());
    expect(newState.transformedTimeline[3].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[4].sliceEndTmISO).toBe(fiveMinutesAgo.toISOString());
    expect(newState.transformedTimeline[4].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[4].commentId).toBe(2);
    expect(newState.transformedTimeline[5].sliceEndTmISO).toBe(fourMinutesAgo.toISOString());
    expect(newState.transformedTimeline[5].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[5].commentId).toBe(0);
    expect(newState.transformedTimeline[6].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[6].type).toBe('PRODUCT');
  });

  it('returns correct state, if comment is added to start of stoppage, when cycleTimeCritical is equal to Stoppage slice duration', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const twoMinutesAgo = subMinutes(now, 2);
    const threeMinutesAgo = subMinutes(now, 3);
    const eightMinutesAgo = subMinutes(now, 8);
    const nineMinutesAgo = subMinutes(now, 9);
    const currentState = [
      {
        startTimeISO: nineMinutesAgo,
        endTime: eightMinutesAgo,
        sliceStartTmISO: nineMinutesAgo.toISOString(),
        sliceEndTmISO: eightMinutesAgo.toISOString(),
        originalEndTimeString: eightMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: eightMinutesAgo,
        endTime: twoMinutesAgo,
        sliceStartTmISO: eightMinutesAgo.toISOString(),
        sliceEndTmISO: twoMinutesAgo.toISOString(),
        originalEndTimeString: twoMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
      },
      {
        startTimeISO: twoMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: twoMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: eightMinutesAgo.toISOString(),
        endTimeLocalISO: threeMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 2,
      }],
      changed: {
        [twoMinutesAgo.toISOString()]: {
          startTimeLocalISO: threeMinutesAgo.toISOString(),
          endTimeLocalISO: twoMinutesAgo.toISOString(),
          type: 'STOPPAGE',
          commentId: 0,
          batchId: 1234,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 360, cycleTimeGood: 60 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches, comments);

    expect(newState.transformedTimeline).toHaveLength(4);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(eightMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(threeMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(2);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(twoMinutesAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(0);
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[3].type).toBe('PRODUCT');
  });

  it('returns correct state, if comment is added to middle of stoppage, when cycleTimeCritical is equal to Stoppage slice duration', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const twoMinutesAgo = subMinutes(now, 2);
    const threeMinutesAgo = subMinutes(now, 3);
    const sevenMinutesAgo = subMinutes(now, 7);
    const eightMinutesAgo = subMinutes(now, 8);
    const nineMinutesAgo = subMinutes(now, 9);
    const currentState = [
      {
        startTimeISO: nineMinutesAgo,
        endTime: eightMinutesAgo,
        sliceStartTmISO: nineMinutesAgo.toISOString(),
        sliceEndTmISO: eightMinutesAgo.toISOString(),
        originalEndTimeString: eightMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: eightMinutesAgo,
        endTime: twoMinutesAgo,
        sliceStartTmISO: eightMinutesAgo.toISOString(),
        sliceEndTmISO: twoMinutesAgo.toISOString(),
        originalEndTimeString: twoMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
      },
      {
        startTimeISO: twoMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: twoMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: eightMinutesAgo.toISOString(),
        endTimeLocalISO: sevenMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 0,
      },
      {
        startTimeLocalISO: sevenMinutesAgo.toISOString(),
        endTimeLocalISO: threeMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 2,
      }],
      changed: {
        [twoMinutesAgo.toISOString()]: {
          startTimeLocalISO: threeMinutesAgo.toISOString(),
          endTimeLocalISO: twoMinutesAgo.toISOString(),
          type: 'STOPPAGE',
          commentId: 0,
          batchId: 1234,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 360, cycleTimeGood: 60 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches, comments);

    expect(newState.transformedTimeline).toHaveLength(5);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(eightMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(sevenMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(0);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(threeMinutesAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(2);
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe(twoMinutesAgo.toISOString());
    expect(newState.transformedTimeline[3].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[3].commentId).toBe(0);
    expect(newState.transformedTimeline[4].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[4].type).toBe('PRODUCT');
  });

  it('returns correct state, if comment is added to end of stoppage, when cycleTimeCritical is equal to Stoppage slice duration', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const twoMinutesAgo = subMinutes(now, 2);
    const threeMinutesAgo = subMinutes(now, 3);
    const eightMinutesAgo = subMinutes(now, 8);
    const nineMinutesAgo = subMinutes(now, 9);
    const currentState = [
      {
        startTimeISO: nineMinutesAgo,
        endTime: eightMinutesAgo,
        sliceStartTmISO: nineMinutesAgo.toISOString(),
        sliceEndTmISO: eightMinutesAgo.toISOString(),
        originalEndTimeString: eightMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: eightMinutesAgo,
        endTime: twoMinutesAgo,
        sliceStartTmISO: eightMinutesAgo.toISOString(),
        sliceEndTmISO: twoMinutesAgo.toISOString(),
        originalEndTimeString: twoMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
      },
      {
        startTimeISO: twoMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: twoMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: eightMinutesAgo.toISOString(),
        endTimeLocalISO: threeMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 0,
      }],
      changed: {
        [twoMinutesAgo.toISOString()]: {
          startTimeLocalISO: threeMinutesAgo.toISOString(),
          endTimeLocalISO: twoMinutesAgo.toISOString(),
          type: 'STOPPAGE',
          commentId: 2,
          batchId: 1234,
        },
      },
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 360, cycleTimeGood: 60 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches, comments);

    expect(newState.transformedTimeline).toHaveLength(4);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(eightMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(threeMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(0);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(twoMinutesAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(2);
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[3].type).toBe('PRODUCT');
  });

  it('adds new products slice to end of timeline', () => {
    const now = new Date();
    const minuteAgo = subMinutes(now, 1);
    const twoMinutesAgo = subMinutes(now, 2);
    const threeMinutesAgo = subMinutes(now, 3);
    const fourMinutesAgo = subMinutes(now, 4);
    const currentState = [
      {
        startTimeISO: fourMinutesAgo,
        endTime: threeMinutesAgo,
        sliceStartTmISO: fourMinutesAgo.toISOString(),
        sliceEndTmISO: threeMinutesAgo.toISOString(),
        originalEndTimeString: threeMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: threeMinutesAgo,
        endTime: twoMinutesAgo,
        sliceStartTmISO: threeMinutesAgo.toISOString(),
        sliceEndTmISO: twoMinutesAgo.toISOString(),
        originalEndTimeString: twoMinutesAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
      {
        startTimeISO: twoMinutesAgo,
        endTime: minuteAgo,
        sliceStartTmISO: twoMinutesAgo.toISOString(),
        sliceEndTmISO: minuteAgo.toISOString(),
        originalEndTimeString: minuteAgo.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
      },
    ];
    const updates = {
      added: [{
        startTimeLocalISO: minuteAgo.toISOString(),
        endTimeLocalISO: now.toISOString(),
        type: 'PRODUCT',
        batchId: 1234,
        cycleTimeCritical: 360,
        cycleTimeGood: 60,
      }],
      changed: {},
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 360, cycleTimeGood: 60 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }]]);
    const newState = stateUpdateHelper(currentState, updates, batches, comments);

    expect(newState.transformedTimeline).toHaveLength(4);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(threeMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(twoMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(minuteAgo.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe(now.toISOString());
    expect(newState.transformedTimeline[3].type).toBe('PRODUCT');
  });

  it('adds two stoppages that are in added when first of them is shorter than ctc', () => {
    const now = new Date();
    const threeMinutesAgo = subMinutes(now, 3);
    const fourMinutesAgo = subMinutes(now, 4);
    const fiveMinutesAgo = subMinutes(now, 5);
    const currentState = [{
      startTimeISO: fiveMinutesAgo,
      endTime: fourMinutesAgo,
      sliceStartTmISO: fiveMinutesAgo.toISOString(),
      sliceEndTmISO: fourMinutesAgo.toISOString(),
      originalEndTimeString: fourMinutesAgo.toISOString(),
      type: 'PRODUCT',
      batchId: 1234,
    }];
    const updates = {
      added: [{
        startTimeLocalISO: fourMinutesAgo.toISOString(),
        endTimeLocalISO: threeMinutesAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 1,
      },
      {
        startTimeLocalISO: threeMinutesAgo.toISOString(),
        endTimeLocalISO: now.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 2,
      }],
      changed: {},
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 120, cycleTimeGood: 90 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }], [1, { maxDuration: 0, id: 1 }]]);
    const shift = { isShiftRunning: true, startTimeISO: fiveMinutesAgo.toISOString() };
    const newState = stateUpdateHelper(currentState, updates, batches, comments, shift);

    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(fourMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(threeMinutesAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(1);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(now.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(2);
  });

  it('adds two stoppages that are in added when second of them is shorter than ctc, but together exceed ctc', () => {
    const now = new Date();
    const oneMinuteAgo = subMinutes(now, 1);
    const fourMinutesAgo = subMinutes(now, 4);
    const fiveMinutesAgo = subMinutes(now, 5);
    const currentState = [{
      startTimeISO: fiveMinutesAgo,
      endTime: fourMinutesAgo,
      sliceStartTmISO: fiveMinutesAgo.toISOString(),
      sliceEndTmISO: fourMinutesAgo.toISOString(),
      originalEndTimeString: fourMinutesAgo.toISOString(),
      type: 'PRODUCT',
      batchId: 1234,
    }];
    const updates = {
      added: [{
        startTimeLocalISO: fourMinutesAgo.toISOString(),
        endTimeLocalISO: oneMinuteAgo.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 1,
      },
      {
        startTimeLocalISO: oneMinuteAgo.toISOString(),
        endTimeLocalISO: now.toISOString(),
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 2,
      }],
      changed: {},
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 120, cycleTimeGood: 90 }]]);
    const comments = new Map([[2, { id: 2 }], [0, { maxDuration: 0, groupId: -1 }], [1, { maxDuration: 0, id: 1 }]]);
    const shift = { isShiftRunning: true, startTimeISO: fiveMinutesAgo.toISOString };
    const newState = stateUpdateHelper(currentState, updates, batches, comments, shift);

    expect(newState.transformedTimeline).toHaveLength(3);
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe(fourMinutesAgo.toISOString());
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe(oneMinuteAgo.toISOString());
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[1].commentId).toBe(1);
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe(now.toISOString());
    expect(newState.transformedTimeline[2].type).toBe('STOPPAGE');
    expect(newState.transformedTimeline[2].commentId).toBe(2);
  });

  it('adds product slice, when secondsFromLastShiftSignal + lastSlice duration is bigger than cycleTimeCritical, but less than cycleTimeCritical + qty * cycleTimeGood', () => {
    const updates = {
      added: [{
        id: 1,
        startTimeLocalISO: '2018-10-10T10:01:00.000Z',
        endTimeLocalISO: '2018-10-10T10:01:40.000Z',
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 1,
      }],
      changed: {},
      deleted: [],
      deletedISO: [],
    };

    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const comments = new Map([[1, { id: 1 }]]);
    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const newState = stateUpdateHelper([], updates, batches, comments, shift);
    expect(newState.transformedTimeline).toHaveLength(1);
    expect(newState.transformedTimeline[0].duration).toBe(40);
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
  });

  it('adds stoppage slice, when secondsFromLastShiftSignal + lastSlice duration is bigger than cycleTimeCritical + qty * cycleTimeGood', () => {
    const updates = {
      added: [{
        id: 1,
        startTimeLocalISO: '2018-10-10T10:01:00.000Z',
        endTimeLocalISO: '2018-10-10T10:01:40.000Z',
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 1,
      }],
      changed: {},
      deleted: [],
      deletedISO: [],
    };

    const batches = new Map([[1234, { cycleTimeCritical: 30, cycleTimeGood: 1 }]]);
    const comments = new Map([[1, { id: 1 }]]);
    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const newState = stateUpdateHelper(
      [{ qty: 1, sliceStartTmISO: '2018-10-10T10:00:00.000Z', sliceEndTmISO: '2018-10-10T10:01:00.000Z' }],
      updates,
      batches,
      comments,
      shift,
    );
    expect(newState.transformedTimeline).toHaveLength(2);
    expect(newState.transformedTimeline[1].duration).toBe(40);
    expect(newState.transformedTimeline[1].type).toBe('STOPPAGE');
  });

  it('adds product slice, when secondsFromLastShiftSignal + lastSlice duration is smaller than cycleTimeCritical', () => {
    const updates = {
      added: [{
        id: 1,
        startTimeLocalISO: '2018-10-10T10:01:00.000Z',
        endTimeLocalISO: '2018-10-10T10:01:10.000Z',
        type: 'STOPPAGE',
        batchId: 1234,
        commentId: 1,
      }],
      changed: {},
      deleted: [],
      deletedISO: [],
    };

    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const comments = new Map([[1, { id: 1 }]]);
    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const newState = stateUpdateHelper([], updates, batches, comments, shift);
    expect(newState.transformedTimeline).toHaveLength(1);
    expect(newState.transformedTimeline[0].duration).toBe(10);
    expect(newState.transformedTimeline[0].type).toBe('PRODUCT');
  });

  test('EVOCON-6018 case - regular BE real update to timeline end', () => {
    const existingState = [
      {
        batchId: 148035,
        cycleTimeCritical: 300,
        cycleTimeGood: 4,
        duration: 3,
        id: 1317,
        idealAltQty: 0.75,
        idealQty: 0.75,
        isProductChange: false,
        originalEndTimeString: '2024-04-23T09:37:51.000+03:00',
        quantity: 1,
        quantityAlt: 1,
        scrapAltQty: 0,
        scrapNotes: '',
        scrapQty: 0,
        scrapReasonId: 0,
        shiftId: 147532,
        signalNotes: '',
        sliceEndTmISO: '2024-04-23T09:37:51.000+03:00',
        sliceStartTmISO: '2024-04-23T09:37:48.000+03:00',
        type: 'PRODUCT',
      },
      {
        batchId: -1,
        commentId: 0,
        cycleTimeCritical: 300,
        cycleTimeGood: 4,
        duration: 4,
        id: 1318,
        idealAltQty: 1,
        idealQty: 1,
        includeInOee: true,
        isFake: true,
        isProductChange: false,
        maxDuration: 0,
        notes: '',
        originalEndTimeString: '2024-04-23T09:37:55.000+03:00',
        positionId: 0,
        quantity: NaN,
        shiftId: 147532,
        sliceEndTmISO: '2024-04-23T09:37:55.000+03:00',
        sliceStartTmISO: '2024-04-23T09:37:51.000+03:00',
        type: 'PRODUCT',
      },
    ];
    const updates = {
      deletedISO: [],
      changed: {
        '2024-04-23T09:37:55.000+03:00': {
          batchId: 148035,
          endTimeLocal: '2024-04-23T09:37:55',
          endTimeLocalISO: '2024-04-23T09:37:55.000+03:00',
          isProductChange: false,
          qty: 1,
          scrapNotes: null,
          scrapQty: 0,
          scrapReasonId: 0,
          signalNotes: '',
          startTimeLocal: '2024-04-23T09:37:51',
          startTimeLocalISO: '2024-04-23T09:37:51.000+03:00',
          cycleTimeCritical: 60,
          cycleTimeGood: 30,
          type: 'PRODUCT',
        },
      },
      added: [
        {
          batchId: 148035,
          endTimeLocal: '2024-04-23T09:37:57',
          endTimeLocalISO: '2024-04-23T09:37:57.000+03:00',
          isProductChange: false,
          qty: 1,
          scrapNotes: null,
          scrapQty: 0,
          scrapReasonId: 0,
          signalNotes: '',
          startTimeLocal: '2024-04-23T09:37:55',
          startTimeLocalISO: '2024-04-23T09:37:55.000+03:00',
          cycleTimeCritical: 60,
          cycleTimeGood: 30,
          type: 'PRODUCT',
        },
        {
          batchId: 148035,
          endTimeLocal: '2024-04-23T09:38:00',
          endTimeLocalISO: '2024-04-23T09:38:00.000+03:00',
          isProductChange: false,
          qty: 1,
          scrapNotes: null,
          scrapQty: 0,
          scrapReasonId: 0,
          signalNotes: '',
          startTimeLocal: '2024-04-23T09:37:57',
          startTimeLocalISO: '2024-04-23T09:37:57.000+03:00',
          cycleTimeCritical: 60,
          cycleTimeGood: 30,
          type: 'PRODUCT',
        },
        {
          batchId: 148035,
          commentId: 0,
          endTimeLocal: '2024-04-23T09:38:09',
          endTimeLocalISO: '2024-04-23T09:38:09.000+03:00',
          includeInOee: true,
          isProductChange: false,
          notes: '',
          positionId: 0,
          startTimeLocal: '2024-04-23T09:38:00',
          startTimeLocalISO: '2024-04-23T09:38:00.000+03:00',
          type: 'STOPPAGE',
        },
      ],
    };
    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const batches = new Map([[148035, { cycleTimeCritical: 30, cycleTimeGood: 60 }]]);
    const comments = new Map([[0, { id: 0 }]]);
    const newState = stateUpdateHelper(existingState, updates, batches, comments, shift, 'Europe/Tallinn');

    expect(newState.transformedTimeline).toHaveLength(5);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2024-04-23T09:37:48.000+03:00');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2024-04-23T09:37:51.000+03:00');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2024-04-23T09:37:51.000+03:00');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2024-04-23T09:37:55.000+03:00');
    expect(newState.transformedTimeline[2].sliceStartTmISO).toBe('2024-04-23T09:37:55.000+03:00');
    expect(newState.transformedTimeline[2].sliceEndTmISO).toBe('2024-04-23T09:37:57.000+03:00');
    expect(newState.transformedTimeline[3].sliceStartTmISO).toBe('2024-04-23T09:37:57.000+03:00');
    expect(newState.transformedTimeline[3].sliceEndTmISO).toBe('2024-04-23T09:38:00.000+03:00');
    expect(newState.transformedTimeline[4].sliceStartTmISO).toBe('2024-04-23T09:38:00.000+03:00');
    expect(newState.transformedTimeline[4].sliceEndTmISO).toBe('2024-04-23T09:38:09.000+03:00');
  });

  test('EVOCON-6018 case - FE tries to update slice that is not the last one anymore', () => {
    const existingState = [
      {
        batchId: 148035,
        cycleTimeCritical: 300,
        cycleTimeGood: 4,
        duration: 3,
        id: 1317,
        idealAltQty: 0.75,
        idealQty: 0.75,
        isProductChange: false,
        originalEndTimeString: '2024-04-23T09:37:51.000+03:00',
        quantity: 1,
        quantityAlt: 1,
        scrapAltQty: 0,
        scrapNotes: '',
        scrapQty: 0,
        scrapReasonId: 0,
        shiftId: 147532,
        signalNotes: '',
        sliceEndTmISO: '2024-04-23T09:37:51.000+03:00',
        sliceStartTmISO: '2024-04-23T09:37:48.000+03:00',
        type: 'PRODUCT',
      },
      {
        batchId: -1,
        commentId: 0,
        cycleTimeCritical: 300,
        cycleTimeGood: 4,
        duration: 4,
        id: 1318,
        idealAltQty: 1,
        idealQty: 1,
        includeInOee: true,
        isFake: true,
        isProductChange: false,
        maxDuration: 0,
        notes: '',
        originalEndTimeString: '2024-04-23T09:37:55.000+03:00',
        positionId: 0,
        quantity: NaN,
        shiftId: 147532,
        sliceEndTmISO: '2024-04-23T09:37:55.000+03:00',
        sliceStartTmISO: '2024-04-23T09:37:51.000+03:00',
        type: 'PRODUCT',
      },
    ];
    const updates = {
      deletedISO: [],
      added: [],
      changed: {
        '2024-04-23T09:37:51.000+03:00': {
          batchId: 148035,
          cycleTimeCritical: 300,
          cycleTimeGood: 4,
          duration: 3,
          id: 1317,
          idealAltQty: 0.75,
          idealQty: 0.75,
          isProductChange: false,
          originalEndTimeString: '2024-04-23T09:37:51.000+03:00',
          quantity: 1,
          quantityAlt: 1,
          scrapAltQty: 0,
          scrapNotes: '',
          scrapQty: 0,
          scrapReasonId: 0,
          shiftId: 147532,
          signalNotes: '',
          sliceEndTmISO: '2024-04-23T09:37:51.000+03:00',
          sliceStartTmISO: '2024-04-23T09:37:55.000+03:00',
          type: 'PRODUCT',
        },
      },
      faking: true,
    };
    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const batches = new Map([[148035, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const comments = new Map([[0, { id: 0 }]]);
    const newState = stateUpdateHelper(existingState, updates, batches, comments, shift, 'Europe/Tallinn');

    expect(newState.transformedTimeline).toHaveLength(2);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2024-04-23T09:37:48.000+03:00');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2024-04-23T09:37:51.000+03:00');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2024-04-23T09:37:51.000+03:00');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2024-04-23T09:37:55.000+03:00');
  });

  test('EVOCON-6018: regular FE update', () => {
    const existingState = [
      {
        batchId: 148035,
        cycleTimeCritical: 180,
        cycleTimeGood: 10.588235294117647,
        duration: 20,
        id: 1065,
        idealAltQty: 1.8889,
        idealQty: 1.8889,
        isProductChange: false,
        originalEndTimeString: '2024-04-29T13:02:20.000+03:00',
        quantity: 1.5,
        quantityAlt: 1.5,
        scrapAltQty: 0,
        scrapNotes: '',
        scrapQty: 0,
        scrapReasonId: 0,
        shiftId: 148127,
        signalNotes: '',
        sliceEndTmISO: '2024-04-29T13:02:20.000+03:00',
        sliceStartTmISO: '2024-04-29T13:02:00.000+03:00',
        type: 'PRODUCT',
        yellowEnd: '2024-04-29T13:02:04.117+03:00',
      },
      {
        batchId: -1,
        commentId: 0,
        cycleTimeCritical: 180,
        cycleTimeGood: 10.588235294117647,
        duration: 13,
        id: 1066,
        idealAltQty: 1.2278,
        idealQty: 1.2278,
        includeInOee: true,
        isFake: true,
        isProductChange: false,
        maxDuration: 0,
        notes: '',
        originalEndTimeString: '2024-04-29T13:02:33.000+03:00',
        positionId: 0,
        quantity: NaN,
        shiftId: 148127,
        sliceEndTmISO: '2024-04-29T13:02:33.000+03:00',
        sliceStartTmISO: '2024-04-29T13:02:20.000+03:00',
        type: 'PRODUCT',
      },
    ];

    const updates = {
      added: [],
      deletedISO: [],
      changed: {
        '2024-04-29T13:02:33.000+03:00': {
          batchId: -1,
          commentId: 0,
          cycleTimeCritical: 180,
          cycleTimeGood: 10.588235294117647,
          duration: 32.312,
          id: 1066,
          idealAltQty: 3.05,
          idealQty: 3.05,
          includeInOee: true,
          isFake: true,
          isProductChange: false,
          maxDuration: 0,
          notes: '',
          originalEndTimeString: '2024-04-29T13:02:33.000+03:00',
          positionId: 0,
          quantity: 1.7,
          quantityAlt: 1.7,
          scrapNotes: '',
          scrapQty: 0,
          scrapReasonId: 0,
          shiftId: 148127,
          sliceEndTmISO: '2024-04-29T13:02:52.312+03:00',
          sliceStartTmISO: '2024-04-29T13:02:20.000+03:00',
          type: 'PRODUCT',
        },
      },
      faking: true,
    };

    const shift = {
      isShiftRunning: true,
      secondsFromLastShiftSignal: 30,
      startTimeISO: '2018-10-10T10:01:00.000Z',
    };
    const batches = new Map([[148035, { cycleTimeCritical: 60, cycleTimeGood: 90 }]]);
    const comments = new Map([[0, { id: 0 }]]);
    const newState = stateUpdateHelper(existingState, updates, batches, comments, shift, 'Europe/Tallinn');

    expect(newState.transformedTimeline).toHaveLength(2);
    expect(newState.transformedTimeline[0].sliceStartTmISO).toBe('2024-04-29T13:02:00.000+03:00');
    expect(newState.transformedTimeline[0].sliceEndTmISO).toBe('2024-04-29T13:02:20.000+03:00');
    expect(newState.transformedTimeline[1].sliceStartTmISO).toBe('2024-04-29T13:02:20.000+03:00');
    expect(newState.transformedTimeline[1].sliceEndTmISO).toBe('2024-04-29T13:02:52.312+03:00');
  });

  test('that first element has quantityFromBatchStart equal to quantity if batchQtyBeforeShift has quantity for previous shift', () => {
    const existingState = [{
      id: 1, quantity: 1, scrapQty: 0, sliceStartTmISO: '2024-04-29T13:02:00.000+03:00', sliceEndTmISO: '2024-04-29T13:02:20.000+03:00', type: 'PRODUCT', batchId: 1234,
    }];
    const updates = {
      changed: {},
      added: [],
      deletedISO: [],
    };
    const batches = new Map([[1234, { cycleTimeCritical: 60, cycleTimeGood: 9, plannedQty: 1000 }]]);
    const comments = new Map();
    const shift = { isShiftRunning: false, startTimeISO: '2024-04-29T13:02:00.000+03:00' };
    const timezone = 'Europe/Tallinn';
    const batchQtyBeforeShift = { batchId: 1233, producedQty: 100, scrapQty: 1 };
    const newState = stateUpdateHelper(existingState, updates, batches, comments, shift, timezone, batchQtyBeforeShift);

    expect(newState.transformedTimeline[0].quantityFromBatchStart).toBe(1);
  });
});
