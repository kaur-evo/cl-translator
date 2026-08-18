import { DateTime } from 'luxon';

const SNAP_GAP_SEC = 45; // seconds to snap to start/end

const MIN_SELECTION_SEC = 60;
class PositionCalculator {
  /**
   *
   * @param {String} startTime ISO date string
   * @param {String} endTime ISO date string
   * @param {Number} xStart Minimum x axis coordinate, x-axis 0 usually
   * @param {Number} xEnd Maximum x axis coordinate
   * @param {scaleBand} yScale d3 scaleBand for resolving y-axis position to correct line band
   * @param {Array} selectedRange range of selected slices
   * @param {Object} currentShift current selected shift
   * @param {String} timezone - timezone of current lineview station
   */
  constructor({
    startTime, endTime, xStart, xEnd, yScale, selectedRange, currentShift, timezone,
  }) {
    this.timezone = timezone;
    // Start and endtime of allowed range as utc seconds
    this.startTime = startTime;
    this.endTime = endTime;

    const shiftEnd = DateTime.fromISO(currentShift.endTimeISO, { zone: this.timezone });

    // == used exclusively for getPositionTime which in turn is used exclusively for green hover positioning
    const startHourStart = DateTime.fromISO(startTime, { zone: this.timezone }).startOf('hour');
    const endHourStart = DateTime.fromISO(endTime, { zone: this.timezone }).startOf('hour');
    this.startHourIdx = yScale.domain().indexOf(startHourStart.toISO());

    this.endHourIdx = shiftEnd.toISO() === endHourStart.toISO() ? yScale.domain().length - 1 : yScale.domain().indexOf(endHourStart.toISO());
    this.yScaleStartTime = startHourStart.minus({ hours: this.startHourIdx });
    // == end of used exclusively for getPositionTime...

    this.selectedRange = selectedRange;
    this.currentShift = currentShift;

    // Start and end coordinates for x axis as px
    this.xStart = xStart;
    this.xEnd = xEnd;

    // y scale of the chart
    this.yScale = yScale;
    // Currently selected start and end time
    if (this.selectedRange && this.selectedRange.length) {
      const [first, second] = this.selectedRange;
      this.selectedStart = first;
      const selectedEnd = DateTime.fromISO(second, { zone: this.timezone });
      this.selectedEnd = shiftEnd < selectedEnd ? shiftEnd.toISO() : selectedEnd.toISO();
    } else {
      this.selectedStart = startTime;
      this.selectedEnd = endTime;
    }
    this.pixelsInSecond = (this.xEnd - this.xStart) / 3600;
    this.dragFunction = undefined;
  }

  onDragStart({ x, y }) {
    const positionTime = DateTime.fromISO(this.getPositionTime(x, y), { zone: this.timezone });
    const selectedStart = DateTime.fromISO(this.selectedStart, { zone: this.timezone });
    const selectedEnd = DateTime.fromISO(this.selectedEnd, { zone: this.timezone });
    const startDiff = Math.abs(positionTime.diff(selectedStart, 'seconds').toObject().seconds);
    const endDiff = Math.abs(positionTime.diff(selectedEnd, 'seconds').toObject().seconds);
    if (startDiff < endDiff && startDiff < 60) {
      this.dragFunction = this.onStartPositionMove;
    } else if (startDiff > endDiff && endDiff < 60) {
      this.dragFunction = this.onEndPositionMove;
    }
  }

  onDrag({ x, y }) {
    if (typeof (this.dragFunction) === 'undefined') {
      return;
    }
    this.dragFunction(x, y);
  }

  onDragEnd() {
    this.dragFunction = undefined;
  }

  onStartPositionMove(x, y) {
    let positionTime = DateTime.fromISO(this.getPositionTime(x, y), { zone: this.timezone });
    const startTime = DateTime.fromISO(this.startTime, { zone: this.timezone });
    const selectedEnd = DateTime.fromISO(this.selectedEnd, { zone: this.timezone });

    if (positionTime.diff(startTime, 'seconds').toObject().seconds < SNAP_GAP_SEC) {
      positionTime = startTime;
    }
    if (positionTime < startTime) {
      positionTime = startTime;
    }
    const endLimit = selectedEnd.minus({ seconds: MIN_SELECTION_SEC });
    if (positionTime > endLimit) {
      positionTime = endLimit;
    }
    this.selectedStart = positionTime.toISO();
  }

  onEndPositionMove(x, y) {
    let positionTime = DateTime.fromISO(this.getPositionTime(x, y), { zone: this.timezone });
    const endTime = DateTime.fromISO(this.endTime, { zone: this.timezone });
    const selectedStart = DateTime.fromISO(this.selectedStart, { zone: this.timezone });
    const shiftEnd = DateTime.fromISO(this.currentShift.endTimeISO, { zone: this.timezone });

    if (endTime.diff(positionTime, 'seconds').toObject().seconds < SNAP_GAP_SEC) {
      positionTime = endTime;
    }
    const startLimit = selectedStart.plus({ seconds: MIN_SELECTION_SEC });
    if (positionTime < startLimit) {
      positionTime = startLimit;
    }
    if (positionTime > endTime) {
      positionTime = endTime;
    }
    if (positionTime > shiftEnd) {
      positionTime = shiftEnd;
    }
    this.selectedEnd = positionTime.toISO();
  }

  getStartPosition() {
    const start = DateTime.fromISO(this.selectedStart, { zone: this.timezone });
    const minutes = start.minute;
    const seconds = start.second;
    const shiftStart = DateTime.fromISO(this.currentShift.startTimeISO, { zone: this.timezone });
    const isShiftStartAfterStart = shiftStart > start;

    const hour = isShiftStartAfterStart
      ? start.startOf('hour').plus({ hours: 1 })
      : start.startOf('hour');
    const secondsThisHour = (minutes * 60) + seconds;
    const yPos = this.yScale(hour.toISO());
    const xPos = isShiftStartAfterStart ? (this.pixelsInSecond / 3600) : (secondsThisHour * this.pixelsInSecond);
    return [Math.round(xPos), yPos];
  }

  getEndPosition() {
    const end = DateTime.fromISO(this.selectedEnd, { zone: this.timezone });
    const minutes = end.minute;
    const seconds = end.second;
    const hour = minutes === 0 && seconds === 0
      ? end.minus({ hours: 1 }).startOf('hour')
      : end.startOf('hour');
    const secondsThisHour = (minutes * 60) + seconds;
    const yPos = this.yScale(hour.toISO());
    const xPos = minutes === 0 && secondsThisHour === 0 ? (3600 * this.pixelsInSecond) : (secondsThisHour * this.pixelsInSecond);
    return [Math.round(xPos), yPos];
  }

  hasChanged() {
    return this.selectedStart !== this.startTime || this.selectedEnd !== this.endTime;
  }

  getSelectedRange() {
    return [this.selectedStart, this.selectedEnd];
  }

  getPositionTime(x, y) {
    // gap the hoursFromStart to a selectable range to avoid jumps to end
    const xPos = Math.max(x, 0);
    const hoursFromStart = Math.max(Math.min(Math.floor(y / this.yScale.bandwidth()), this.endHourIdx), this.startHourIdx);
    return this.yScaleStartTime
      .plus({ hours: hoursFromStart, seconds: Math.min(3600, xPos / this.pixelsInSecond) })
      .toISO();
  }

  getTimePosition(time) {
    const dateTime = DateTime.fromISO(time, { zone: this.timezone });
    const hourStart = dateTime.startOf('hour').toISO();
    return {
      y: this.yScale(hourStart),
      x: ((dateTime.minute * 60) + dateTime.second) * this.pixelsInSecond,
    };
  }

  setSelectedRange(start, end) {
    this.selectedRange = [start, end];
    this.selectedStart = start;
    this.selectedEnd = end;
  }
}

export default PositionCalculator;
