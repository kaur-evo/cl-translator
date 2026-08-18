const HumanizeDuration = (duration, newOpts) => {
  const newOptions = { ...newOpts };

  const allowedFormats = ['second', 'minute', 'hour', 'day'];

  const options = {
    type: newOptions.type && allowedFormats.indexOf(newOptions.type) !== -1 ? newOptions.type : 'second',
    largest: newOptions.largest && allowedFormats.indexOf(newOptions.largest) !== -1 ? newOptions.largest : 'minute',
  };

  // reformat to seconds

  let value = Math.abs(duration);

  switch (options.type) {
    case 'minute':
      value = Math.abs(duration) * 60;
      break;
    case 'hour':
      value = Math.abs(duration) * 3600;
      break;
    case 'day':
      value = Math.abs(duration) * 3600 * 24;
      break;
    default:
      break;
  }

  const formatDuration = {
    second(val) {
      return val ? `${val}s` : '';
    },
    minute(val) {
      let humanized = '';
      const sec = Math.round(val % 60);
      const min = Math.floor(val / 60);

      humanized += min ? `${min}m` : '';
      if (sec) {
        humanized += ` ${sec}s`;
      }

      if (!humanized) {
        humanized += `${0}s`;
      }

      return humanized;
    },
    hour(val) {
      const divided = val / 60;
      let humanized = '';
      const hour = Math.floor(divided / 60);
      const min = Math.round(divided % 60);

      humanized += hour ? `${hour}h ` : '';
      humanized += min ? `${min}m` : '';

      if (!humanized) {
        humanized += `${0}m`;
      }

      return humanized;
    },
    day(val) {
      let humanized = '';
      const hour = Math.round(val % 3600);
      const day = Math.floor(val / 86400);

      humanized += day ? `${day}d ` : '';
      humanized += hour ? `${hour}h` : '';

      if (!humanized) {
        humanized += `${0}d`;
      }

      return humanized;
    },
  };

  return formatDuration[options.largest](value).trim();
};

export default HumanizeDuration;
