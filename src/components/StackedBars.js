import * as React from "react";
import * as d3 from "d3";

const barColors = ["#DEEBF7", "#C6DBEF", "#9ECAE1", "#4292C6"];

function getDataHeight(data, margin) {
  const barHeight = 20;

  return data.length * barHeight - margin.top - margin.bottom;
}

class StackedBars extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 20, right: 20, bottom: 60, left: 100 };
    this.xAxis = d3.axisBottom();
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0]);
  }

  componentDidMount() {
    const { ref, margin } = this;
    const { getContainerWidth, getContainerHeight, data } = this.props;

    const series = d3
      .stack()
      .keys(Object.keys(data.suppliers[0].risks.scores))(
        data.suppliers.map((d) => ({ ...d.risks.scores, name: d.name }))
      )
      .map((d) => (d.forEach((v) => ({ ...v, key: d.key })), d));

    const containerHeight = getContainerHeight(ref, margin);
    const dataHeight = getDataHeight(data.suppliers, margin);

    this.height = containerHeight > dataHeight ? containerHeight : dataHeight;
    this.width = getContainerWidth(ref, margin);

    this.yScale = d3
      .scaleBand()
      .domain(data.suppliers.map((d) => d.name))
      .range([this.height, 0])
      .padding(1.2);

    this.xScale = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d3.max(d, (v) => v[1]))])
      .range([0, this.width])
      .nice();

    this.cScale = d3
      .scaleOrdinal()
      .domain(series.map((d) => d.key))
      .range(barColors);

    this.yAxis = this.yAxis.scale(this.yScale);
    this.xAxis = this.xAxis.scale(this.xScale);

    const legendData = Object.keys(data.suppliers[0].risks.scores).map(
      (key) => {
        return {
          name: `${key} Risk`,
          color: this.cScale(key),
        };
      }
    );

    this.draw(series, legendData);
  }

  componentDidUpdate() {
    const { data } = this.props;

    const series = d3
      .stack()
      .keys(Object.keys(data.suppliers[0].risks.scores))(
        data.suppliers.map((d) => ({ ...d.risks.scores, name: d.name }))
      )
      .map((d) => (d.forEach((v) => ({ ...v, key: d.key })), d));

    this.xScale = this.xScale.domain([
      0,
      d3.max(series, (d) => d3.max(d, (v) => v[1])),
    ]);

    this.xAxis = this.xAxis.scale(this.xScale);

    this.redraw(series);
  }

  draw(data, legendData) {
    const { ref, margin, width, height } = this;
    const { drawContainer, drawLegend } = this.props;

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
    const { xScale, yScale, cScale } = this;
    const { duration } = this.props;
    const barHeight = 12;

    return (node) => {
      const g = node.select("g.container");

      /*
      const series = g.append("g")
        .selectAll("g")
        .data(data, d => d.key)
        .join(
          enter => enter.append("g"),
          update => update,
          exit => exit
            .transition()
            .duration(duration)
            .attr("opacity", "0")
            .remove()
        )
        .attr("fill", d => cScale(d.key))

      const bars = series
        .selectAll("rect")
        .data(d => d)

      bars
        .join(
          enter => enter.append("rect")
            .attr("y", (d) => yScale(d.data.name))
            .attr("height", barHeight),
          update => update
            .merge(bars),
          exit => exit
            .transition()
            .duration(duration)
            .attr("x", 0)
            .attr("width", 0)
            .remove()
        )
        .transition()
        .duration(duration)
        .attr("x", d => xScale(d[0]))
        .attr("width", d => xScale(d[1]) - xScale(d[0]));
      */

      const series = g.selectAll("g.series").data(data, (d) => d.key);

      series
        .enter()
        .append("g")
        .attr("class", "series")
        .attr("fill", (d) => cScale(d.key));

      series.exit().remove();

      const bars = series.selectAll("rect.bar").data((d) => d);

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => yScale(d.data.name))
        .attr("height", barHeight)
        .merge(bars)
        .transition()
        .duration(duration)
        .attr("x", (d) => xScale(d[0]))
        .attr("width", (d) => xScale(d[1]) - xScale(d[0]));

      bars
        .exit()
        .transition()
        .duration(duration)
        .attr("x", 0)
        .attr("width", 0)
        .remove();
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

  render() {
    return (
      <div>
        <svg ref={this.ref} />
      </div>
    );
  }
}

export default StackedBars;
