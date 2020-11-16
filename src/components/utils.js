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

export function drawLegend({ height, margin, data }) {
  return (node) => {
    const rectHeight = 20;
    const paddedHeight = height + margin.bottom;

    const g = node
      .append("g")
      .attr("transform", `translate(${margin.left}, ${paddedHeight})`);

    const legends = g.selectAll(".legend").data(data);

    legends.exit().remove();

    const legend = legends.enter().append("g").attr("class", "legend");

    legend
      .append("rect")
      .attr("fill", (d) => d.color)
      .attr("width", rectHeight)
      .attr("height", rectHeight);

    legend
      .append("text")
      .attr("x", rectHeight + 5)
      .attr("font-size", 10)
      .text((d) => d.name);

    let x = 0;

    legend.each(function () {
      const thisNode = d3.select(this);
      const legendWidth = thisNode.node().getBBox().width;

      const textNode = thisNode.select("text");
      const textHeight = textNode.node().getBBox().height;

      textNode.attr("y", rectHeight / 2 + textHeight / 4);

      thisNode.attr("transform", `translate(${x}, ${0})`);

      x += legendWidth + 10;
    });
  };
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
