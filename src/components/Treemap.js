import * as React from "react";
import * as d3 from "d3";

class Treemap extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.cKey = "risk";
  }

  componentDidMount() {
    const { ref, margin, cKey } = this;
    const {
      getContainerHeight,
      getContainerWidth,
      getColorScale,
      data,
    } = this.props;

    this.height = getContainerHeight(ref, margin);
    this.width = getContainerWidth(ref, margin);

    this.colorScale = getColorScale({ data: data.countries, key: cKey });

    const stratify = d3
      .stratify()
      .id((d) => d.id)
      .parentId((d) => d.tier);

    const parents = new Array(6)
      .fill({})
      .map((_, i) => (i < 5 ? { tier: -1, id: i } : { tier: "", id: -1 }));

    const root = stratify([...data.suppliers, ...parents]);

    this.treemap = d3.treemap().size([this.width, this.height]).padding(4)(
      root
    );

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
    const { cKey, colorScale } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const rects = g.selectAll(".rect").data(data).attr("class", "rect");

      rects.exit().transition().duration(duration).attr("opacity", 0).remove();

      rects
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("fill", (d) => colorScale(+d.data[cKey]))
        .attr("opacity", 0)
        .attr("stroke", "none")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .merge(rects)
        .transition()
        .duration(duration)
        .attr("opacity", 1);
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
