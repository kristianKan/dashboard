import * as React from "react";
import * as d3 from "d3";

const colors = ["#F4D166", "#F7A144", "#EF701B", "#CE4E22", "#9E3A26"];
const labelFormat = ["Lowest", "Low", "Medium", "High", "Highest"];

function makeHierarchy(data) {
  const dataGroup = d3.group(data.suppliers, (d) => d.tier.ms_employment);
  const childrenAccessorFn = ([, value]) => value.size && Array.from(value);

  return d3
    .hierarchy([null, dataGroup], childrenAccessorFn)
    .sum(([, value]) =>
      value.size
        ? Array.from(value)
        : value.reduce((sum, d) => sum + d.risks.scores.ms_product, 0)
    )
    .sort((a, b) => b.value - a.value);
}

function getUniqueProducts(data) {
  return data.reduce((acc, supplier) => {
    supplier.products.forEach((product) => {
      return !acc.includes(product.name) && acc.push(product.name);
    });
    return acc;
  }, []);
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
    const {
      getContainerHeight,
      getContainerWidth,
      getColorScale,
      data,
    } = this.props;
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
        .text((d) => `Tier ${d.data[0] + 1} - ${labelFormat[d.data[0]]}`);
    };
  }

  mouseover() {
    const { ref } = this;

    return function (event, d) {
      const uniqueProducts = getUniqueProducts(d.data[1]);

      const tooltip = d3
        .select(ref.current)
        .append("foreignObject")
        .attr("width", "100%")
        .attr("overflow", "visible");

      const div = tooltip
        .append("xhtml:div")
        .attr("class", "container")
        .style("max-width", "fit-content")
        .style("background", "black")
        .style("padding", "6px");

      div
        .append("span")
        .style("font-size", "14px")
        .style("color", "white")
        .text(`Tier ${d.data[1][0].tier.ms_employment}`);

      const products = div.selectAll(".product").data(uniqueProducts);

      products
        .enter()
        .append("div")
        .attr("class", "product")
        .style("color", "white")
        .text((v) => v);

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
      const x = isLeft ? nodeX - width : nodeX + nodeWidth;

      tooltip
        .attr("x", `${x}`)
        .attr("y", `${y}`)
        .attr("height", height)
        .attr("width", width);
    };
  }

  mouseleave() {
    const { ref } = this;
    const tooltip = d3.select(ref.current);

    return function () {
      tooltip.selectAll("foreignObject").remove();
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
