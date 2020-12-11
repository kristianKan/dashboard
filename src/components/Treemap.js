import * as React from "react";
import * as d3 from "d3";

const colors = ["#F4D166", "#F7A144", "#EF701B", "#CE4E22", "#9E3A26"];
const labelFormat = ["Lowest", "Low", "Medium", "High", "Highest"];

function makeHierarchy(data) {
  const dataGroup = d3.group(data.products, (d) => d.tier);
  const childrenAccessorFn = ([, value]) => value.size && Array.from(value);

  return d3
    .hierarchy([null, dataGroup], childrenAccessorFn)
    .sum(([, value]) =>
      value.size
        ? Array.from(value)
        : value.reduce((sum, d) => sum + d.risk_score, 0)
    )
    .sort((a, b) => b.value - a.value);
}

class Treemap extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.tooltipRef = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
  }

  componentDidMount() {
    const { ref, margin } = this;
    const { getContainerHeight, getContainerWidth, data } = this.props;
    const root = makeHierarchy(data);

    this.height = getContainerHeight(ref, margin);
    this.width = getContainerWidth(ref, margin);

    d3.treemap().size([this.width, this.height]).padding(0)(root);

    this.draw(root);
  }

  componentDidUpdate() {
    const { data } = this.props;
    const root = makeHierarchy(data);

    d3.treemap().size([this.width, this.height]).padding(0)(root);

    this.redraw(root);
  }

  draw(root) {
    const { ref, tooltipRef, margin, width, height } = this;
    const { drawContainer, drawTooltip } = this.props;

    d3.select(tooltipRef.current).call(drawTooltip());

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawRects(root.leaves()));
  }

  redraw(root) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawRects(root.leaves()));
  }

  drawRects(data) {
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const leaves = g.selectAll(".leaf").data(data);

      leaves.exit().transition().duration(duration).attr("opacity", 0).remove();

      const enterLeaf = leaves
        .enter()
        .append("g")
        .attr("class", "leaf")
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

      enterLeaf
        .append("rect")
        .attr("fill", (d) => colors[d.data[0]])
        .attr("opacity", 0)
        .attr("stroke", "none")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .merge(enterLeaf)
        .transition()
        .duration(duration)
        .attr("opacity", 1);

      enterLeaf
        .on("mouseover", this.mouseover())
        .on("mouseleave", this.mouseleave());

      enterLeaf
        .append("text")
        .attr("x", 6)
        .attr("y", 18)
        .attr("fill", "white")
        .text((d) => `Tier ${d.data[0] + 1}`)
        .text(function (d) {
          const n = d3.select(this).node();
          const r = d3.select(this.parentNode).select("rect").node();
          const textWidth = n.getBBox().width;
          const rectWidth = r.getBBox().width;
          return textWidth < rectWidth ? `Tier ${d.data[0] + 1}` : ``;
        });

      enterLeaf
        .append("text")
        .attr("x", 6)
        .attr("y", 36)
        .attr("fill", "white")
        .text((d) => `${labelFormat[d.data[0]]}`)
        .text(function (d) {
          const n = d3.select(this).node();
          const r = d3.select(this.parentNode).select("rect").node();
          const textWidth = n.getBBox().width;
          const rectWidth = r.getBBox().width;
          return textWidth < rectWidth ? `${labelFormat[d.data[0]]}` : ``;
        });
    };
  }

  mouseover() {
    const { tooltipRef } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function (event, d) {
      const div = tooltip
        .append("div")
        .attr("class", "container")
        .style("max-width", "200px")
        .style("max-height", "300px")
        .style("overflow", "scroll")
        .style("background", "black")
        .style("padding", "6px");

      div
        .append("div")
        .style("font-size", "14px")
        .style("color", "white")
        .text(`Tier ${d.data[1][0].tier + 1}`);

      div
        .append("div")
        .style("font-size", "14px")
        .style("color", "white")
        .style("margin-bottom", "10px")
        .text(`${labelFormat[d.data[0]]}`);

      const products = div.selectAll(".product").data(d.data[1], (v) => v.id);

      const product = products
        .enter()
        .append("div")
        .attr("class", "product")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("flex-wrap", "wrap")
        .style("width", "100%")
        .style("margin-top", "6px");

      product
        .append("div")
        .style("font-size", "10px")
        .style("color", "white")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("flex-basis", "100%")
        .style("flex", "1")
        .text((v) => v.name);

      product
        .append("div")
        .style("font-size", "10px")
        .style("color", "white")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("flex-basis", "100%")
        .style("flex", "1")
        .style("text-align", "right")
        .text((v) => v.risk_score);

      const node = d3.select(this).select("rect");
      const { width, height } = div.node().getBoundingClientRect();
      const parentWidth = tooltip.node().parentNode.getBoundingClientRect()
        .width;
      const nodeWidth = +node.attr("width");
      const nodeHeight = +node.attr("height");
      const nodeX = d.x0;
      const nodeY = d.y0 + nodeHeight;
      const isLeft = nodeX + nodeWidth + width > parentWidth;
      const y = nodeY / 2 - height / 2;
      const x = isLeft ? nodeX - width - 10 : nodeX + nodeWidth;

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

export default Treemap;
