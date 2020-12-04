import * as React from "react";
import * as d3 from "d3";

const colorRange = ["#DEEBF7", "#4292C6"];
const labelFormat = ["No Data", "Low", "Medium", "High"];

class Pie extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 30, left: 0 };
  }

  componentDidMount() {
    const { ref, margin } = this;
    const {
      getContainerHeight,
      getContainerWidth,
      getColorScale,
      data,
    } = this.props;

    this.height = getContainerHeight(ref, margin);
    this.width = getContainerWidth(ref, margin);

    const groupedData = d3.group(data.suppliers, (d) => d.tier.ms_governance);
    const root = Array.from(groupedData).sort((a, b) => a[0] - b[0]);

    const radius = Math.min(this.width, this.height) / 2;

    this.pie = d3
      .pie()
      .value((d) => d[1].length)
      .sort((a, b) => a[0] - b[0]);

    this.arc = d3.arc().innerRadius(0).outerRadius(radius);

    this.cScale = getColorScale({ data: root, key: 0, range: colorRange });

    const legendData = root.map((d) => {
      return {
        name: labelFormat[d[0]],
        color: this.cScale(d[0]),
      };
    });

    this.draw(root, data.suppliers.length, legendData);
  }

  componentDidUpdate() {
    const { data } = this.props;

    const groupedData = d3.group(data.suppliers, (d) => d.tier.ms_governance);
    const root = Array.from(groupedData).sort((a, b) => a[0] - b[0]);

    this.redraw(root, data.suppliers.length);
  }

  draw(data, dataLength, legendData) {
    const { ref, margin, width, height } = this;
    const { drawContainer, drawLegend } = this.props;

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawPie(data, dataLength))
      .call(
        drawLegend({
          data: legendData,
          height,
          margin: { left: 0, bottom: 10 },
        })
      );
  }

  redraw(data, dataLength) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawPie(data, dataLength));
  }

  drawPie(data, dataLength) {
    const { pie, arc, cScale, width, height } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node
        .select("g.container")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const paths = g.selectAll(".arc").data(pie(data)).attr("class", "arc");

      paths.exit().transition().duration(duration).attr("opacity", 0).remove();

      const arcG = paths.enter().append("g");

      arcG
        .append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", (d) => cScale(d.index))
        .attr("stroke", "none")
        .merge(paths)
        .transition()
        .duration(duration)
        .attr("opacity", 1);

      arcG
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("x", -10)
        .attr("y", 0)
        .attr("fill", "white")
        .text((d) => `${Math.round((100 / dataLength) * d.value)}%`);
    };
  }

  render() {
    return <svg ref={this.ref} />;
  }
}

export default Pie;
