import * as React from "react";
import * as d3 from "d3";

const barColors = ["#DEEBF7", "#4292C6", "#9ECAE1", "#C6DBEF"];

function getDataHeight(data, margin) {
  const barHeight = 20;

  return data.length * barHeight - margin.top - margin.bottom;
}

function flattenData(data) {
  const riskKeys = [
    "rs_rm_geographic",
    "rs_rm_industry",
    "rs_rm_product",
    "rs_rm_employment",
  ];

  return data.reduce((acc, d) => {
    const values = Object.entries(d.risks)
      .reduce((acc2, [key, value]) => {
        const isRiskKey = riskKeys.includes(key);

        return isRiskKey
          ? [
              ...acc2,
              {
                name: d.name,
                key,
                value,
              },
            ]
          : acc2;
      }, [])
      .sort((a, b) => b.value - a.value);

    return [...acc, ...values];
  }, []);
}

class StackedBars extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 20, right: 20, bottom: 30, left: 60 };
    this.xAxis = d3.axisBottom();
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0]);
  }

  componentDidMount() {
    const { ref, margin } = this;
    const { getContainerWidth, getContainerHeight, data } = this.props;

    const flatData = flattenData(data.suppliers);
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
      .domain([0, d3.max(flatData, (d) => +d.value)])
      .range([0, this.width])
      .nice();

    this.color = d3
      .scaleOrdinal()
      .domain(flatData.map((d) => d.key))
      .range(barColors);

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
    const { xScale, yScale, color } = this;
    const { duration } = this.props;
    const barHeight = 12;

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
        .attr("fill", (d) => color(d.key))
        .attr("opacity", 1)
        .attr("stroke", "none")
        .attr("height", barHeight)
        .attr("x", 0)
        .attr("y", (d) => yScale(d.name) - barHeight / 2)
        .merge(bars)
        .transition()
        .duration(duration)
        .attr("width", (d) => xScale(d.value));
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

export default StackedBars;
