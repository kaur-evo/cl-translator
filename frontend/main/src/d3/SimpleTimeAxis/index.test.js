import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';

import SimpleTimeAxis from './index';

describe('SimpleTimeAxis', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    window.SVGElement.prototype.getBBox = () => ({ width: 30 });
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should initialize with default options', () => {
    const axis = new SimpleTimeAxis(element);
    expect(axis.options.ticks).toBe(10);
    expect(typeof axis.options.tickFormat).toBe('function');
    expect(axis.options.fontSize).toBe(10);
    expect(axis.options.axisType).toBe('axisTop');
    expect(axis.options.scale).toBe(null);
  });

  it('should override default options with provided options', () => {
    const axis = new SimpleTimeAxis(element, { ticks: 5, fontSize: 20 });
    expect(axis.options.ticks).toBe(5);
    expect(axis.options.fontSize).toBe(20);
  });

  it('getContainerHeight returns correct value', () => {
    const axis = new SimpleTimeAxis(element, { fontSize: 15 });
    expect(axis.containerHeight).toBe(17);
  });

  it('createSVG creates an SVG element with correct attributes', () => {
    const axis = new SimpleTimeAxis(element, { fontSize: 12 });
    axis.createSVG();
    const svg = element.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('height')).toBe('14px');
    expect(svg.getAttribute('width')).toBe('100%');
  });

  it('createContainer creates a group element with correct attributes', () => {
    const axis = new SimpleTimeAxis(element, { fontSize: 16 });
    axis.createSVG();
    axis.createContainer();
    const g = element.querySelector('svg g.x.axis');
    expect(g).not.toBeNull();
    expect(g.getAttribute('transform')).toBe('translate(0, 16)');
  });

  it('draw does nothing if element is null', () => {
    const axis = new SimpleTimeAxis(null);
    axis.createSVG = vi.fn();
    axis.createContainer = vi.fn();
    axis.draw();
    expect(axis.createSVG).not.toHaveBeenCalled();
    expect(axis.createContainer).not.toHaveBeenCalled();
  });

  it('draw creates SVG, container, and axis', () => {
    const axis = new SimpleTimeAxis(element, { scale: d3.scaleLinear().domain([0, 10]).range([0, 100]) });
    axis.draw();
    expect(element.querySelector('svg')).not.toBeNull();
    expect(element.querySelector('svg g.x.axis')).not.toBeNull();
    expect(axis.axis).toBeDefined();
  });

  it('update updates axis and container', () => {
    const scale = d3.scaleLinear().domain([0, 10]).range([0, 100]);
    const axis = new SimpleTimeAxis(element, { scale });
    axis.draw();
    const spy = vi.spyOn(axis.axis, 'scale');
    axis.update({ ticks: 5 });
    expect(axis.options.ticks).toBe(5);
    expect(spy).toHaveBeenCalledWith(scale);
  });
  it('should allow custom tickFormat function', () => {
    const customFormat = vi.fn((d) => `Tick: ${d}`);
    const axis = new SimpleTimeAxis(element, { tickFormat: customFormat, scale: d3.scaleLinear().domain([0, 10]).range([0, 100]) });
    axis.draw();
    expect(axis.options.tickFormat).toBe(customFormat);
    expect(typeof axis.options.tickFormat).toBe('function');
  });

  it('should remove previous SVG before creating a new one', () => {
    const axis = new SimpleTimeAxis(element, { fontSize: 12 });
    axis.createSVG();
    const firstSVG = element.querySelector('svg');
    axis.createSVG();
    const svgs = element.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(element.querySelector('svg')).not.toBeNull();
    expect(element.querySelector('svg')).not.toBe(firstSVG);
  });

  it('should update scale if provided in update options', () => {
    const scale1 = d3.scaleLinear().domain([0, 10]).range([0, 100]);
    const scale2 = d3.scaleLinear().domain([0, 20]).range([0, 200]);
    const axis = new SimpleTimeAxis(element, { scale: scale1 });
    axis.draw();
    axis.update({ scale: scale2 });
    expect(axis.options.scale).toBe(scale2);
  });
});
