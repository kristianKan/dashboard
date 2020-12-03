import * as React from "react";
import * as d3 from "d3";

function getMapHeight({ projection, width, outline }) {
  const [[x0, y0], [x1, y1]] = d3
    .geoPath(projection.fitWidth(width, outline))
    .bounds(outline);

  const dy = Math.ceil(y1 - y0);
  const l = Math.min(Math.ceil(x1 - x0), dy);

  projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);

  return dy;
}

class Geo extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.tooltipRef = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);
    this.outline = { type: "Sphere" };
    this.rKey = "ms_prevalence_score";
    this.cKey = "risk";
  }

  componentDidMount() {
    const { ref, margin, rKey, cKey, projection, outline } = this;
    const {
      getContainerWidth,
      getContainerHeight,
      getColorScale,
      getLinearScale,
      data,
    } = this.props;

    const width = getContainerWidth(ref, margin);
    const containerHeight = getContainerHeight(ref, margin);
    const mapHeight = getMapHeight({ projection, width, outline });

    this.height = containerHeight > mapHeight ? containerHeight : mapHeight;
    this.width = width;

    this.rScale = getLinearScale({
      data: data.countries,
      key: rKey,
      range: [2, 10],
    });

    this.colorScale = getColorScale({ data: data.countries, key: cKey });

    this.draw(data);
  }

  componentDidUpdate() {
    const { data } = this.props;

    this.redraw(data);
  }

  getCentroids(data) {
    const { path } = this;

    return data.geo.features.reduce((acc, feature) => {
      const centroid = path.centroid(feature);
      const country = data.countries.find((d) => d.iso_code_num === feature.id);

      return country
        ? [
            ...acc,
            {
              ...country,
              centroid,
            },
          ]
        : acc;
    }, []);
  }

  draw(data) {
    const { ref, tooltipRef, margin, width, height } = this;
    const { drawContainer, drawTooltip } = this.props;

    d3.select(tooltipRef.current).call(drawTooltip());

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawMap(data.geo))
      .call(this.drawCircles(data));
  }

  redraw(data) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawCircles(data));
  }

  drawCircles(data) {
    const { rScale, cKey, rKey, colorScale } = this;
    const { duration } = this.props;
    const centroids = this.getCentroids(data);

    return (node) => {
      const g = node.select("g.container");

      const circles = g.selectAll(".circle").data(centroids);

      circles
        .exit()
        .transition()
        .duration(duration)
        .attr("opacity", 0)
        .attr("r", 0)
        .remove();

      const enterCircles = circles
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", (d) => colorScale(+d[cKey]))
        .attr("opacity", 1)
        .attr("stroke", "none")
        .attr("cx", (d) => d.centroid[0])
        .attr("cy", (d) => d.centroid[1]);

      circles
        .merge(enterCircles)
        .transition()
        .duration(duration)
        .attr("r", (d) => rScale(+d[rKey]));

      enterCircles
        .on("mouseover", this.mouseover())
        .on("mouseleave", this.mouseleave());
    };
  }

  drawMap(geo) {
    const { path } = this;

    return (node) => {
      const g = node.select("g.container");

      g.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "lightgrey")
        .attr("stroke", "lightgrey");
    };
  }

  mouseover() {
    const { tooltipRef } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function (event, d) {
      tooltip.html(`
          <span style="font-size: 14px">${d.name}</span>
          </br>
          <span style="font-size: 9px">${d.risk}</span>
          </br>
          <span style="font-size: 9px">${d.suppliers.length} suppliers</span>
        `);

      const node = d3.select(this);
      const { height, width } = tooltip.node().getBoundingClientRect();
      const parentWidth = tooltip.node().parentNode.getBoundingClientRect()
        .width;
      const margin = 2;
      const r = +node.attr("r");
      const x = +node.attr("cx");
      const y = +node.attr("cy") - height / 2;
      const isLeft = x + width > parentWidth;

      tooltip
        .style("left", `${isLeft ? x - r - width - margin : x + r + margin}px`)
        .style("top", `${y}px`)
        .style("opacity", 1)
        .style("z-index", 1);

      node.style("stroke", "black");
    };
  }

  mouseleave() {
    const { tooltipRef } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function () {
      tooltip.style("opacity", 0).style("z-index", -1);

      d3.select(this).style("stroke", "none");
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

export default Geo;
