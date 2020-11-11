import * as React from "react";
import * as d3 from "d3";

class Pie extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
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

    const groupedData = d3.group(data.suppliers, (d) => d.governance);
    const root = Array.from(groupedData);

    const radius = Math.min(this.width, this.height) / 2;

    this.pie = d3
      .pie()
      .value((d) => d[1].length)
      .sort(null);

    this.arc = d3.arc().innerRadius(0).outerRadius(radius);

    this.colorScale = getColorScale({ data: root, key: "1.length" });

    this.draw(root, data.suppliers.length);
  }

  componentDidUpdate() {
    const { props } = this;
    const data = props.data.rights;

    this.redraw(data);
  }

  draw(data, dataLength) {
    const { ref, margin, width, height } = this;
    const { drawContainer } = this.props;

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawPie(data, dataLength));
  }

  redraw(data) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawPie(data));
  }

  drawPie(data, dataLength) {
    const { pie, arc, colorScale, width, height } = this;
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
        .attr("fill", (d) => colorScale(+d.value))
        .attr("stroke", "none")
        .merge(paths)
        .transition()
        .duration(duration)
        .attr("opacity", 1);

      arcG
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "white")
        .text((d) => `${(100 / dataLength) * d.value}%`);
    };
  }

  handleChange(_, { value }) {
    const { setSelection } = this.props;

    setSelection(value);
  }

  render() {
    return <svg ref={this.ref} />;
  }
}

export default Pie;
