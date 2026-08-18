import { splitSliceByHours } from '@/helpers/timelineUtils';

/**
 *  Collects slices and constructs SVG path d attribute for drawing path containing comments
 */
class CommentPath {
  /**
   *
   * @param {D3 scaleband} y - D3 scaleBand instance for calculating y axis coordinates
   * @param {Map} batches - Map of batches by batchiId
   */
  constructor(type, y, slices, timezone) {
    this.type = type;
    this.commented = [];
    this.uncommented = [];

    this.y = y;
    this.path = '';
    this.timezone = timezone;
    slices.forEach((s) => this.add(s));
  }

  add(slice) {
    const slicePartsByHour = splitSliceByHours(slice, this.timezone);
    slicePartsByHour.forEach((hourPart) => {
      if (hourPart.commentId === 0) {
        this.uncommented.push(hourPart);
      } else {
        this.commented.push(hourPart);
      }
      const coordY = (this.y(hourPart.hourStart)) + (this.y.bandwidth() / 2);

      this.path += `M ${hourPart.startSecond}, ${coordY} H ${hourPart.endSecond} `;
    });
  }

  getPath() {
    return this.path;
  }

  getType() {
    return this.type;
  }

  getCommented() {
    return this.commented;
  }

  getUncommented() {
    return this.uncommented;
  }
}

export default CommentPath;
