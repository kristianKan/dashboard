import * as React from "react";
import * as d3 from "d3";

const barColors = ["#DEEBF7", "#C6DBEF", "#9ECAE1", "#4292C6"];

function getDataHeight(data, margin) {
  const barHeight = 20;

  return data.length * barHeight - margin.top - margin.bottom;
}

function getDataSeries(data) {
  return d3
    .stack()
    .keys(Object.keys(data.suppliers[0].risks.scores))(
      data.suppliers.map((d) => ({ ...d.risks.scores, name: d.name }))
    )
    .map((d) => (d.forEach((v) => ({ ...v, key: d.key })), d));
}

function getDataMean(data) {
  return (
    data.suppliers.reduce((acc, d) => {
      const total = Object.values(d.risks.scores).reduce(
        (sum, v) => sum + v,
        0
      );
      return acc + total;
    }, 0) / data.suppliers.length
  );
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

    const series = getDataSeries(data);
    const mean = getDataMean(data);

    const containerHeight = getContainerHeight(ref, margin);
    const dataHeight = getDataHeight(data.suppliers, margin);

    this.height = containerHeight > dataHeight ? containerHeight : dataHeight;
    this.width = getContainerWidth(ref, margin);

    this.yScale = d3
      .scaleBand()
      .domain(data.suppliers.map((d) => d.name))
      .range([this.height, 0])
      .padding(0.2);

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

    const legend = this.getLegendData(data);

    this.draw(series, mean, legend);
  }

  componentDidUpdate() {
    const { data } = this.props;
    const series = getDataSeries(data);
    const mean = getDataMean(data);

    this.xScale = this.xScale.domain([
      0,
      d3.max(series, (d) => d3.max(d, (v) => v[1])),
    ]);

    this.yScale = this.yScale.domain(data.suppliers.map((d) => d.name));

    this.xAxis = this.xAxis.scale(this.xScale);
    this.yAxis = this.yAxis.scale(this.yScale);

    this.redraw(series, mean);
  }

  getLegendData(data) {
    const legend = Object.keys(data.suppliers[0].risks.scores).map((key) => {
      return {
        name: `${key} Risk`,
        color: this.cScale(key),
      };
    });

    return [
      ...legend,
      {
        name: "Mean",
        color: "red",
      },
    ];
  }

  draw(series, mean, legend) {
    const { ref, margin, width, height } = this;
    const { drawContainer, drawLegend } = this.props;

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawSeries(series))
      .call(this.drawBars())
      .call(this.drawMean(mean))
      .call(this.drawAxes())
      .call(drawLegend({ data: legend, height, margin }));
  }

  redraw(series, mean) {
    const { ref } = this;

    d3.select(ref.current)
      .call(this.drawSeries(series))
      .call(this.drawBars())
      .call(this.drawMean(mean))
      .call(this.drawAxes());
  }

  drawSeries(data) {
    const { cScale } = this;

    return (node) => {
      const g = node.select("g.container");
      const series = g.selectAll("g.series").data(data);

      series
        .enter()
        .append("g")
        .attr("class", "series")
        .attr("fill", (d) => cScale(d.key));

      series.exit().remove();
    };
  }

  drawBars() {
    const { xScale, yScale } = this;
    const { duration } = this.props;

    return (node) => {
      const series = node.selectAll("g.series");
      const bars = series.selectAll("rect.bar").data((d) => d);

      const barsEnter = bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => yScale(d.data.name))
        .attr("height", yScale.bandwidth());

      bars
        .merge(barsEnter)
        .transition()
        .duration(duration)
        .attr("x", (d) => xScale(d[0]))
        .attr("y", (d) => yScale(d.data.name))
        .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
        .attr("height", yScale.bandwidth());

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

  drawMean(mean) {
    const { xScale, yScale } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const lines = g.selectAll(".mean").data([mean]);

      lines
        .enter()
        .append("line")
        .attr("class", "mean")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", yScale.range()[0])
        .attr("y2", yScale.range()[1])
        .attr("stroke", "red")
        .attr("stroke-dasharray", "3, 3")
        .merge(lines)
        .transition()
        .duration(duration)
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d));

      lines.exit().remove();
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
