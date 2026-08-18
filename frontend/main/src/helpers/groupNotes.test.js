import groupNotes from './groupNotes';

test('groupNotes', () => {
  const notes = [
    { id: 1, note: 'note1', createdDate: '2020-10-21T12:10:00' },
    { id: 2, note: 'note2', createdDate: '2020-10-21T14:10:00' },
    { id: 3, note: 'note3', createdDate: '2020-11-22T15:00:00' },
    { id: 4, note: 'note4', createdDate: '2020-12-23T16:15:00' },
  ];

  expect(groupNotes(notes)).toEqual({
    '2020-10': [
      {
        id: 1, note: 'note1', createdDate: '2020-10-21T12:10:00', entity: 'note', orderBy: '2020-10-21T12:10:00',
      },
      {
        id: 2, note: 'note2', createdDate: '2020-10-21T14:10:00', entity: 'note', orderBy: '2020-10-21T14:10:00',
      },
    ],
    '2020-11': [
      {
        id: 3, note: 'note3', createdDate: '2020-11-22T15:00:00', entity: 'note', orderBy: '2020-11-22T15:00:00',
      },
    ],
    '2020-12': [
      {
        id: 4, note: 'note4', createdDate: '2020-12-23T16:15:00', entity: 'note', orderBy: '2020-12-23T16:15:00',
      },
    ],
  });
});
