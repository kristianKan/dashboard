import * as d3 from "d3";
import get from "lodash.get";

export function drawContainer({ width, height, margin }) {
  return (node) => {
    const paddedWidth = width + margin.left + margin.right;
    const paddedHeight = height + margin.top + margin.bottom;

    const svg = node.attr("width", paddedWidth).attr("height", paddedHeight);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("class", "container");
  };
}

export function getContainerWidth(ref, margin) {
  const parent = ref.current.parentElement;
  const container = parent.getBoundingClientRect();

  // Calculate any extra padding
  const { paddingLeft, paddingRight } =
    parent.currentStyle || window.getComputedStyle(parent);
  const padding = parseInt(paddingLeft, 10) + parseInt(paddingRight, 10);

  // Return the width with padding and margins
  return container.width - margin.left - margin.right - padding;
}

export function getContainerHeight(ref, margin) {
  const parent = ref.current.parentElement;
  const container = parent.getBoundingClientRect();

  // Return the height with padding
  return container.height - margin.top - margin.bottom;
}

export function getLinearScale({ data, key, range }) {
  return d3
    .scaleLinear()
    .domain([d3.min(data, (d) => +d[key]), d3.max(data, (d) => +d[key])])
    .range(range);
}

export function getColorScale({ data, key }) {
  const valueAccessorFn = (d) => get(d, key);

  return d3
    .scaleLinear()
    .domain([d3.min(data, valueAccessorFn), d3.max(data, valueAccessorFn)])
    .range(["#F4D166", "#DF452D"])
    .interpolate(d3.interpolateRgb);
}
