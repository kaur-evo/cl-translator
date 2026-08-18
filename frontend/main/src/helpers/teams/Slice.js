import _ from 'lodash';

class Slice {
  /**
   *
   * @param {*} ids
   * @param {*} start
   * @param {*} end
   */
  constructor(ids, start, end) {
    this.ids = ids;
    this.start = start;
    this.end = end;
  }

  get len() {
    return this.end - this.start;
  }

  overlapsLeft(other) {
    return other.start < this.start && this.start < other.end;
  }

  overlapsRight(other) {
    return other.start < this.end && this.end < other.end;
  }

  overlapsCompletely(other) {
    return this.start <= other.start && this.end >= other.end;
  }

  noOverlapLeft(other) {
    return other.end <= this.start;
  }

  noOverlapRight(other) {
    return other.start >= this.end;
  }

  cutLeftOverlap(other, isLeftOverlap) {
    if (_.isEqual(this.ids, other.ids) && this.end === other.start) {
      return [new Slice(other.ids, this.start, other.end)].filter((s) => s.len);
    }
    if (this.end === other.start) {
      return [new Slice(this.ids, this.start, other.start), other].filter((s) => s.len);
    }
    if (isLeftOverlap) {
      return [
        new Slice(this.ids, this.start, other.start),
        new Slice(_.union(this.ids, other.ids), other.start, this.end),
        new Slice(other.ids, this.end, other.end),
      ].filter((s) => s.len);
    }
    return [new Slice(this.ids, this.start, this.end), other].filter((s) => s.len);
  }

  cutRightOverlap(other, isRightOverlap) {
    if (_.isEqual(this.ids, other.ids) && this.start === other.end) {
      return [new Slice(other.ids, other.start, this.end)].filter((s) => s.len);
    }
    if (this.start === other.end) {
      return [new Slice(other.ids, other.start, this.start), this].filter((s) => s.len);
    }
    if (isRightOverlap) {
      return [
        new Slice(other.ids, other.start, this.start),
        new Slice(_.union(this.ids, other.ids), this.start, other.end),
        new Slice(this.ids, other.end, this.end),
      ].filter((s) => s.len);
    }
    return [new Slice(other.ids, other.start, other.start), this].filter((s) => s.len);
  }

  cutCompleteOverlap(other) {
    if (_.isEqual(this.ids, other.ids)) {
      return [other].filter((s) => s.len);
    }
    const overlapSlices = [
      new Slice(other.ids, other.start, this.start),
      new Slice(_.union(this.ids, other.ids), this.start, this.end),
      new Slice(other.ids, this.end, other.end),
    ];
    return overlapSlices.filter((s) => s.len > 0);
  }
}

export default Slice;
