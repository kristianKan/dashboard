import * as React from "react";
import * as d3 from "d3";

class Geo extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);
    this.outline = { type: "Sphere" };
    this.rKey = "prevalence";
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
    const mapHeight = this.getMapHeight({ projection, width, outline });

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

  getMapHeight({ projection, width, outline }) {
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width, outline))
      .bounds(outline);

    const dy = Math.ceil(y1 - y0);
    const l = Math.min(Math.ceil(x1 - x0), dy);

    projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);

    return dy;
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
    const { ref, margin, width, height } = this;
    const { drawContainer } = this.props;

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

      const circles = g
        .selectAll(".circle")
        .data(centroids)
        .attr("class", "circle");

      circles
        .exit()
        .transition()
        .duration(duration)
        .attr("opacity", 0)
        .attr("r", 0)
        .remove();

      circles
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", (d) => colorScale(+d[cKey]))
        .attr("opacity", 1)
        .attr("stroke", "none")
        .attr("cx", (d) => d.centroid[0])
        .attr("cy", (d) => d.centroid[1])
        .merge(circles)
        .transition()
        .duration(duration)
        .attr("r", (d) => rScale(+d[rKey]));
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

  render() {
    return <svg ref={this.ref} />;
  }
}

export default Geo;
