import * as d3 from "d3";

export function drawCircleLegend({ height, margin, data, scale }) {
  return (node) => {
    const paddedHeight = height + margin.bottom;
    const padding = 12;

    const g = node
      .append("g")
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

    g.append("text").attr("x", 30).text(`# of suppliers`);
  };
}

export function drawRectLegend({ data, height, margin }) {}
