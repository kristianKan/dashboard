import * as React from "react";
import * as d3 from "d3";

const colors = ["#CE4E22", "#EF701B", "#F7A144", "#F4D166", "#9ECAE1"];
const labelFormat = ["Highest", "High", "Medium", "Low", "Lowest"];

function flattenData(data) {
  const dataByTier = d3.group(data, (d) => d.tier.ms_employment);

  return Array.from(dataByTier).sort((a, b) => b[0] - a[0]);
}

class Bars extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.tooltipRef = React.createRef();
    this.margin = { top: 20, right: 20, bottom: 50, left: 40 };
    this.xAxis = d3.axisBottom();
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0]);
  }

  componentDidMount() {
    const { ref, margin } = this;
    const { getContainerWidth, getContainerHeight, data } = this.props;

    const flatData = flattenData(data.suppliers);

    this.height = getContainerHeight(ref, margin);
    this.width = getContainerWidth(ref, margin);

    this.yScale = d3
      .scaleBand()
      .domain(flatData.map((d) => `Tier ${d[0] + 1}`))
      .range([this.height, 0])
      .padding(0.2);

    this.xScale = d3
      .scaleLinear()
      .domain([0, d3.max(flatData, (d) => d[1].length)])
      .range([0, this.width])
      .nice();

    const xAxisTicks = this.xScale.ticks().filter(Number.isInteger);
    this.xAxis = this.xAxis.tickValues(xAxisTicks).tickFormat(d3.format("d"));

    this.yAxis = this.yAxis.scale(this.yScale);
    this.xAxis = this.xAxis.scale(this.xScale);

    const legendData = flatData.map((d) => {
      return {
        name: labelFormat[d[0]],
        color: colors[d[0]],
      };
    });

    this.draw(flatData, legendData);
  }

  componentDidUpdate() {
    const { data } = this.props;
    const flatData = flattenData(data.suppliers);

    this.redraw(flatData);
  }

  draw(data, legendData) {
    const { ref, tooltipRef, margin, width, height } = this;
    const { drawContainer, drawLegend, drawTooltip } = this.props;

    d3.select(tooltipRef.current).call(drawTooltip());

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawBars(data))
      .call(this.drawAxes())
      .call(drawLegend({ data: legendData, height, margin }));
  }

  redraw(data) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawBars(data)).call(this.drawAxes());
  }

  drawBars(data) {
    const { xScale, yScale } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const bars = g.selectAll(".bar").data(data).attr("class", "bar");

      bars
        .exit()
        .transition()
        .duration(duration)
        .attr("opacity", 0)
        .attr("width", 0)
        .remove();

      const enterBar = bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", (d) => colors[d[0]])
        .attr("opacity", 1)
        .attr("stroke", "none")
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("y", (d) => yScale(`Tier ${d[0] + 1}`));

      bars
        .merge(enterBar)
        .transition()
        .duration(duration)
        .attr("width", (d) => xScale(d[1].length));

      enterBar
        .on("mouseover", this.mouseover())
        .on("mouseleave", this.mouseleave());
    };
  }

  drawAxes() {
    const { height, xAxis, yAxis } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");
      const x = g.selectAll(".x.axis").data(["dummy"]);
      const y = g.selectAll(".y.axis").data(["dummy"]);

      x.enter()
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .merge(x)
        .transition()
        .duration(duration)
        .call(xAxis);

      y.enter()
        .append("g")
        .attr("class", "y axis")
        .merge(y)
        .transition()
        .duration(duration)
        .call(yAxis)
        .call((n) => n.select(".domain").remove());

      g.selectAll(".domain").attr("stroke", "#CCCCCC");

      g.selectAll(".tick line").attr("stroke", "#CCCCCC");

      g.selectAll(".y.axis text").attr("transform", `translate(${-10}, 0)`);
    };
  }

  mouseover() {
    const { tooltipRef, margin } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function (event, d) {
      const div = tooltip
        .append("div")
        .attr("class", "container")
        .style("background", "black")
        .style("min-width", "80px")
        .style("padding", "6px");

      div
        .append("div")
        .style("font-size", "14px")
        .style("color", "white")
        .text(`Tier ${d[0] + 1}`);

      div
        .append("div")
        .style("font-size", "14px")
        .style("color", "white")
        .style("margin-bottom", "10px")
        .text(`${labelFormat[d[0]]}`);

      div
        .append("div")
        .style("font-size", "10px")
        .style("color", "white")
        .text(`Suppliers: ${d[1].length}`);

      const node = d3.select(this);
      const nodeBox = node.node().getBBox();
      const tooltipBox = tooltip.node().getBoundingClientRect();
      const y =
        nodeBox.y + nodeBox.height / 2 - tooltipBox.height / 2 + margin.top;
      const x = nodeBox.x + nodeBox.width + margin.left;

      tooltip
        .style("left", `${x}px`)
        .style("top", `${y}px`)
        .style("opacity", 1)
        .style("z-index", 1);
    };
  }

  mouseleave() {
    const { tooltipRef } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function () {
      tooltip.style("opacity", 0).style("z-index", -1);
      tooltip.select(".container").remove();
    };
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div ref={this.tooltipRef} />
        <svg ref={this.ref} />
      </div>
    );
  }
}

export default Bars;
