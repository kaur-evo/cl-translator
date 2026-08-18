const groupFiles = (files) => {
  const result = {};
  for (let i = 0; i < files.length; i += 1) {
    if (files[i].timestamp) {
      const month = files[i].timestamp.substring(0, 7);
      const filesGroup = `${files[i].timestamp}_${files[i].username}_${files[i].stepId}`;
      if (result[month]) {
        if (result[month][filesGroup]) {
          result[month][filesGroup].data.push({
            ...files[i],
            entity: 'file',
            orderBy: files[i].timestamp,
          });
        } else {
          result[month][filesGroup] = {
            username: files[i].username,
            createdByName: files[i].createdByName,
            roles: files[i].roles,
            timestamp: files[i].timestamp,
            entity: 'file',
            orderBy: files[i].timestamp,
            stepId: files[i].stepId,
            data: [{
              ...files[i],
              entity: 'file',
              orderBy: files[i].timestamp,
            }],
          };
        }
      } else {
        result[month] = {};
        result[month][filesGroup] = {
          username: files[i].username,
          createdByName: files[i].createdByName,
          roles: files[i].roles,
          timestamp: files[i].timestamp,
          entity: 'file',
          orderBy: files[i].timestamp,
          stepId: files[i].stepId,
          data: [{
            ...files[i],
            entity: 'file',
            orderBy: files[i].timestamp,
          }],
        };
      }
    } else {
      // console.error('file with no timestamp');
    }
  }
  return result;
};

export default groupFiles;
