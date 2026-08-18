import { DateTime } from 'luxon';

/**
 *  Collects yellow slices and constructs SVG path d attribute for drawing path containing performance loss comments
 */

class CommentedYellowPath {
  /**
   *
   * @param {D3 scaleband} y - D3 scaleBand instance for calculating y axis coordinates
   * @param {Array} yellowSlices - Array of all yellow slices in shift
   * @param {Array} timeline - Array of performance loss timeline
   */
  constructor(y, yellowSlices, timeline) {
    this.y = y;
    this.yellowSlices = yellowSlices;
    this.path = '';
    timeline.forEach((elem) => this.add(elem));
  }

  add(timelineElem) {
    if (timelineElem.commentId !== 0) {
      this.yellowSlices.forEach((slice) => {
        const sliceStartTime = DateTime.fromISO(slice.parent.sliceStartTmISO);
        const elemStartTime = DateTime.fromISO(timelineElem.startTimeISO);
        const elemEndTime = DateTime.fromISO(timelineElem.endTimeISO);
        if (elemStartTime <= sliceStartTime && sliceStartTime < elemEndTime) {
          const coordY = this.y(slice.hourStart) + (this.y.bandwidth() / 2);

          this.path += `M ${slice.startSecond}, ${coordY} H ${slice.endSecond} `;
        }
      });
    }
  }

  getPath() {
    return this.path;
  }
}

export default CommentedYellowPath;
