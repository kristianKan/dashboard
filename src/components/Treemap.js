import * as React from "react";
import * as d3 from "d3";

class Treemap extends React.Component {
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

    const reduceFn = (iterable) =>
      d3.sum(iterable, (d) => d.risks.scores.ms_product);
    const dataRollup = d3.rollup(
      data.suppliers,
      reduceFn,
      (d) => d.tier.ms_employment
    );

    const childrenAccessorFn = ([, value]) => value.size && Array.from(value);
    const root = d3
      .hierarchy([null, dataRollup], childrenAccessorFn)
      .sum(([, value]) => value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([this.width, this.height]).padding(0)(root);

    this.colorScale = getColorScale({ data: root.children, key: "value" });

    this.draw(root);
  }

  componentDidUpdate() {
    const { props } = this;
    const data = props.data.rights;

    this.redraw(data);
  }

  draw(root) {
    const { ref, margin, width, height } = this;
    const { drawContainer } = this.props;

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawRects(root.leaves()));
  }

  redraw(data) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawRects(data));
  }

  drawRects(data) {
    const { colorScale } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const rects = g.selectAll(".leaf").data(data).attr("class", "leaf");

      rects.exit().transition().duration(duration).attr("opacity", 0).remove();

      const leaf = rects
        .enter()
        .append("g")
        .attr("class", "leaf")
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

      leaf
        .append("rect")
        .attr("fill", (d) => colorScale(+d.value))
        .attr("opacity", 0)
        .attr("stroke", "none")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .merge(rects)
        .transition()
        .duration(duration)
        .attr("opacity", 1);

      const riskLevel = ["Highest", "High", "Medium", "Low", "Lowest"];
      leaf
        .append("text")
        .attr("x", 6)
        .attr("y", 18)
        .attr("fill", "white")
        .text((d, i) => `Tier ${d.data[0]} - ${riskLevel[i]}`);
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

export default Treemap;
