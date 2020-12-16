import * as React from "react";
import * as d3 from "d3";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

const legendData = [
  {
    value: 1,
  },
  {
    value: 5,
  },
  {
    value: 10,
  },
];

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
    this.margin = { top: 0, right: 0, bottom: 30, left: 0 };
    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);
    this.outline = { type: "Sphere" };
    this.rKey = "suppliers.length";
    this.cKey = "ms_prevalence_score";
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
    const height = containerHeight > mapHeight ? containerHeight : mapHeight;

    this.width = width;
    this.height = height;

    const centroids = this.getCentroids(data);

    this.xScale = d3.scaleLinear().domain([0, width]).range([0, width]);

    this.yScale = d3.scaleLinear().domain([0, height]).range([0, height]);

    this.rScale = getLinearScale({
      data: data.countries,
      key: rKey,
      range: [5, 15],
    });

    this.colorScale = getColorScale({ data: data.countries, key: cKey });

    this.zoom = d3
      .zoom()
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on("zoom", this.zoomed.bind(this));

    this.draw(data, centroids);
  }

  componentDidUpdate() {
    const { data } = this.props;
    const centroids = this.getCentroids(data);

    this.redraw(centroids);
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

  zoomed(event) {
    const { ref, xScale, yScale } = this;
    const { transform } = event;
    const xScaleZoomed = transform.rescaleX(xScale);
    const yScaleZoomed = transform.rescaleY(yScale);

    d3.select(ref.current)
      .selectAll(".map")
      .attr("transform", event.transform)
      .attr("stroke-width", 1 / transform.k)
      .transition()
      .duration(300)
      .attr("stroke", transform.k > 1 ? "white" : "lightgrey");

    d3.select(ref.current)
      .selectAll(".circle")
      .attr("cx", (d) => xScaleZoomed(d.centroid[0]))
      .attr("cy", (d) => yScaleZoomed(d.centroid[1]));
  }

  draw(data, centroids) {
    const { ref, tooltipRef, margin, width, height, zoom } = this;
    const { drawContainer, drawTooltip, drawLegend } = this.props;

    d3.select(tooltipRef.current).call(drawTooltip());

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawMap(data.geo))
      .call(this.drawCircles(centroids))
      .call(
        drawLegend({
          data: legendData,
          height,
          margin: { left: 0, bottom: 10 },
          scale: this.rScale,
        })
      )
      .call(zoom);
  }

  redraw(centroids) {
    const { ref } = this;

    d3.select(ref.current).call(this.drawCircles(centroids));
  }

  drawCircles(data) {
    const { rScale, cKey, colorScale } = this;
    const { duration } = this.props;

    return (node) => {
      const g = node.select("g.container");

      const circles = g.selectAll(".circle").data(data);

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
        .attr("opacity", 0.8)
        .attr("stroke", "none")
        .attr("cx", (d) => d.centroid[0])
        .attr("cy", (d) => d.centroid[1]);

      circles
        .merge(enterCircles)
        .transition()
        .duration(duration)
        .attr("r", (d) => rScale(+d.suppliers.length));

      enterCircles
        .on("mouseover", this.mouseover())
        .on("mouseleave", this.mouseleave());
    };
  }

  drawMap(geo) {
    const { path, height } = this;

    return (node) => {
      const g = node.select("g.container");

      g.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", path)
        .attr("fill", "lightgrey")
        .attr("stroke", "lightgrey");

      const gHeight = g.node().getBBox().height;

      g.attr("transform", `translate(0, ${height / 2 - gHeight / 2})`);
    };
  }

  mouseover() {
    const { tooltipRef } = this;
    const tooltip = d3.select(tooltipRef.current);

    return function (event, d) {
      const prevalence = Math.round(d.ms_prevalence_score * 10) / 10;

      tooltip.html(`
          <span style="font-size: 14px">${d.country_name}</span>
          </br>
          <div style="font-size: 9px">Victims per 1,000 of population: ${prevalence}</div>
          <div style="font-size: 9px">${d.suppliers.length} suppliers</div>
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

  zoomIn() {
    const { ref, zoom } = this;

    const svg = d3.select(ref.current);
    zoom.scaleBy(svg.transition().duration(750), 2);
  }

  zoomOut() {
    const { ref, zoom } = this;

    const svg = d3.select(ref.current);
    zoom.scaleBy(svg.transition().duration(750), 0.5);
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div ref={this.tooltipRef} />
        <svg ref={this.ref} />
        <IconButton
          size="small"
          variant="outlined"
          onClick={() => this.zoomOut()}
        >
          <RemoveIcon />
        </IconButton>
        <IconButton
          size="small"
          variant="outlined"
          onClick={() => this.zoomIn()}
        >
          <AddIcon />
        </IconButton>
      </div>
    );
  }
}

export default Geo;
