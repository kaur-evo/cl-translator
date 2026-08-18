const groupNotes = (notes) => {
  const result = {};
  for (let i = 0; i < notes.length; i += 1) {
    const date = notes[i].createdDate.substring(0, 7);
    if (result[date]) {
      result[date].push({ ...notes[i], entity: 'note', orderBy: notes[i].createdDate });
    } else {
      result[date] = [{ ...notes[i], entity: 'note', orderBy: notes[i].createdDate }];
    }
  }
  return result;
};

export default groupNotes;
