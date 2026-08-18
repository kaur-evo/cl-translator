import * as d3 from 'd3';
import { subMilliseconds } from 'date-fns';

import { TRANSITION_DURATION } from '@/d3/constants';

export default function ZoomModule(superclass) {
  return class extends superclass {
    // zoom option defaults
    zoomOptions = {
      defaultScaleFactor: 1,
      minScaleFactor: 1,
      maxScaleFactor: 1,
      defaultZoomRange: [],
      initialZoomRangeValue: 60 * 60 * 1000, // 1 hour in ms
      minZoomRangeValue: null,
      maxZoomRangeValue: null,
      scaleType: 'timeScale',
      xDomainKey: 'xDomain',
      xFirstVal: null,
      xLastVal: null,
      transitionDuration: TRANSITION_DURATION,
    };

    // Map slider value (0-100) to D3 scale factor
    sliderToScale(sliderValue) {
      const min = this.zoomOptions.minScaleFactor;
      const max = this.zoomOptions.maxScaleFactor;
      return min + ((sliderValue / 100) * (max - min));
    }

    // Map D3 scale factor to slider value (0-100)
    scaleToSlider(scale) {
      const min = this.zoomOptions.minScaleFactor;
      const max = this.zoomOptions.maxScaleFactor;
      if (max === min) return 0;
      return ((scale - min) / (max - min)) * 100;
    }

    drawZoom(options) {
      if (options) {
        this.zoomOptions = Object.assign(this.zoomOptions, options);
      }

      this.zoomFocus = this.plot.append('rect')
        .attr('class', 'zoom')
        .attr('width', this.width)
        .attr('height', this.height - 1)
        .attr('fill', 'transparent')
        .style('pointer-events', 'stroke')
        .lower();
      this.setZoom(this.plot);
      return this;
    }

    onZoomed(event) {
      this.currentScale = event.transform;
      if (this.zoomOptions.scaleType === 'scaleBand') {
        this.xScale.range([0, this.width].map((d) => event.transform.applyX(d)));
      }
    }

    setDatasetRangeInMs() {
      if (this.zoomOptions.scaleType === 'timeScale') {
        const xFirstVal = this.zoomOptions?.xFirstVal?.();
        const xLastVal = this.zoomOptions?.xLastVal?.();
        const dataSetStart = xFirstVal ? new Date(xFirstVal) : new Date();
        this.zoomOptions.dataSetEnd = xLastVal ? new Date(xLastVal) : new Date();
        this.zoomOptions.rangeInMs = this.zoomOptions.dataSetEnd - dataSetStart;
      }
    }

    setInitialZoomPositionByDuration() {
      let msRange = this.zoomOptions.initialZoomRangeValue;
      const durMs = this.zoomOptions.rangeInMs;
      if (durMs < msRange) {
        msRange = durMs;
      }
      this.zoomOptions.defaultZoomRange = [
        subMilliseconds(this.zoomOptions.dataSetEnd, msRange),
        this.zoomOptions.dataSetEnd,
      ];
    }

    setScaleFactorLimitsByDuration() {
      const widthMs = this[this.zoomOptions.xDomainKey][1] - this[this.zoomOptions.xDomainKey][0];
      if (this.zoomOptions.minZoomRangeValue) {
        const maxZoomRangeValue = this.zoomOptions.maxZoomRangeValue || this.zoomOptions.rangeInMs;
        this.zoomOptions.minScaleFactor = widthMs / maxZoomRangeValue;
        this.zoomOptions.maxScaleFactor = widthMs / this.zoomOptions.minZoomRangeValue;
        if (this.zoom?.scaleExtent) {
          this.zoom.scaleExtent([this.zoomOptions.minScaleFactor, this.zoomOptions.maxScaleFactor]);
        }
      }
    }

    updateZoom(options) {
      this.zoomOptions = Object.assign(this.zoomOptions, options);
      this.zoom.scaleExtent([this.zoomOptions.minScaleFactor, this.zoomOptions.maxScaleFactor]);
      this.currentZoom
        .call(this.zoom.transform, d3.zoomIdentity.scale(this.zoomOptions.defaultScaleFactor));
    }

    handleHorizontalScroll(event) {
      event.preventDefault();

      const currentTransform = d3.zoomTransform(this.currentZoom.node());
      let newX = currentTransform.x - event.deltaX;
      const maxPanLeft = Math.min(0, this.width * (1 - currentTransform.k));
      const maxPanRight = 0;
      newX = Math.max(maxPanLeft, Math.min(maxPanRight, newX));

      const newTransform = d3.zoomIdentity.translate(newX, currentTransform.y).scale(currentTransform.k);
      this.zoom.transform(this.currentZoom, newTransform);
    }

    setZoom(el) {
      const extent = [
        [0, 0],
        [this.width, this.height],
      ];
      this.setDatasetRangeInMs();

      if (this.zoomOptions.scaleType === 'timeScale') {
        this.setInitialZoomPositionByDuration();
        this.setScaleFactorLimitsByDuration();
      }
      this.zoom = d3.zoom()
        .filter((event) => {
          if (event.type === 'wheel' && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            this.handleHorizontalScroll(event);
            return false;
          }
          return true;
        })
        .scaleExtent([this.zoomOptions.minScaleFactor, this.zoomOptions.maxScaleFactor])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', (ev) => this.onZoomed(ev));

      this.currentZoom = el.call(this.zoom);

      if (this.zoomOptions.defaultZoomRange.length === 2) {
        const d0 = this.zoomOptions.defaultZoomRange[0];
        const d1 = this.zoomOptions.defaultZoomRange[1];
        const scale = this.width / (this.xScale(d1) - this.xScale(d0) || 1);
        this.currentZoom
          .transition()
          .duration(this.zoomOptions.transitionDuration)
          .call(
            this.zoom.transform,
            d3.zoomIdentity
              .scale(scale)
              .translate(-this.xScale(d0), 0),
          );
      } else if (this.zoomOptions.defaultScaleFactor) {
        this.currentZoom
          .transition()
          .duration(this.zoomOptions.transitionDuration)
          .call(this.zoom.transform, d3.zoomIdentity.scale(this.zoomOptions.defaultScaleFactor));
      }
    }
  };
}
