import * as React from "react";
import * as d3 from "d3";

function getDataHeight(data, margin) {
  const barHeight = 50;

  return data.length * barHeight - margin.top - margin.bottom;
}

function flattenData(data) {
  const dataByTier = d3.group(data, (d) => d.tier);

  return Array.from(dataByTier).sort((a, b) => a[1].length - b[1].length);
}

class Bars extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 20, right: 20, bottom: 30, left: 60 };
    this.xAxis = d3.axisBottom();
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0]);
  }

  componentDidMount() {
    const { ref, margin } = this;
    const {
      getContainerWidth,
      getContainerHeight,
      getColorScale,
      data,
    } = this.props;

    const flatData = flattenData(data.suppliers);
    const containerHeight = getContainerHeight(ref, margin);
    const dataHeight = getDataHeight(flatData, margin);

    this.height = containerHeight > dataHeight ? containerHeight : dataHeight;
    this.width = getContainerWidth(ref, margin);

    this.yScale = d3
      .scaleBand()
      .domain(flatData.map((d) => d[0]))
      .range([this.height, 0])
      .padding(0.2);

    this.xScale = d3
      .scaleLinear()
      .domain([0, d3.max(flatData, (d) => d[1].length)])
      .range([0, this.width])
      .nice();

    this.colorScale = getColorScale({ data: flatData, key: "1.length" });

    const xAxisTicks = this.xScale.ticks().filter(Number.isInteger);
    this.xAxis = this.xAxis.tickValues(xAxisTicks).tickFormat(d3.format("d"));

    this.yAxis = this.yAxis.scale(this.yScale);
    this.xAxis = this.xAxis.scale(this.xScale);

    this.draw(flatData);
  }

  componentDidUpdate() {
    const { data } = this.props;

    this.redraw(data.suppliers);
  }

  draw(data) {
    const { ref, margin, width, height } = this;
    const { drawContainer } = this.props;

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawBars(data))
      .call(this.drawAxes());
  }

  redraw(data) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawBars(data)).call(this.drawAxes());
  }

  drawBars(data) {
    const { xScale, yScale, colorScale } = this;
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

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", (d) => colorScale(d[1].length))
        .attr("opacity", 1)
        .attr("stroke", "none")
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("y", (d) => yScale(d[0]))
        .merge(bars)
        .transition()
        .duration(duration)
        .attr("width", (d) => xScale(d[1].length));
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

      g.selectAll(".y.axis text").attr("transform", `translate(${-15}, 0)`);
    };
  }

  handleChange(_, { value }) {
    const { setSelection } = this.props;

    setSelection(value);
  }

  render() {
    return (
      <div>
        <svg ref={this.ref} />
      </div>
    );
  }
}

export default Bars;
