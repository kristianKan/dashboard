import * as d3 from "d3";

export function drawCircleLegend({ height, margin, data, scale }) {
  return (node) => {
    const paddedHeight = height + margin.bottom;
    const padding = 12;

    const g = node
      .append("g")
      .attr("class", "circle-legend")
      .attr("transform", `translate(${margin.left}, ${paddedHeight})`);

    const legends = g.selectAll(".legend").data(data);

    legends.exit().remove();

    const legend = legends
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${padding}, -${i * 3})`);

    legend
      .append("circle")
      .attr("stroke", "#000")
      .attr("fill", "transparent")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (d) => scale(d.value));

    g.append("text")
      .attr("x", 30)
      .attr("font-size", "10px")
      .text(`# of Suppliers`);
  };
}

export function drawRectLegend({ data, height, margin }) {}

export function drawColorLegend({ height, width, margin }) {
  const legendWidth = width;
  const legendHeight = 6;
  const paddedHeight = height + margin.bottom;

  return (node) => {
    const defs = node.append("defs");

    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F4D166");

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#DF452D");

    const g = node
      .append("g")
      .attr("transform", `translate(${margin.left}, ${paddedHeight})`);

    g.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

    const xScale = d3
      .scaleOrdinal()
      .domain(["Min Risk", "Max Risk"])
      .range([0, legendWidth]);

    const xAxis = d3.axisBottom().tickValues(xScale.domain()).scale(xScale);

    g.append("g").attr("class", "axis").call(xAxis);

    g.selectAll(".tick:first-of-type text")
      .attr("font-size", "10px")
      .style("text-anchor", "start");

    g.selectAll(".tick:last-of-type text")
      .attr("font-size", "10px")
      .style("text-anchor", "end");

    g.select(".axis .domain").attr("stroke", "transparent");
  };
}
