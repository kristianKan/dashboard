import * as React from 'react'
import * as d3 from 'd3'

export class Geo extends React.Component {
 constructor(props) {
  	super(props)
    this.ref = React.createRef()
    this.width = 0
    this.height = 0
		this.margin = { top: 20, right: 20, bottom: 20, left: 20 }
    this.duration = 1200
    this.projection = d3.geoEqualEarth()
    this.path = d3.geoPath().projection(this.projection)
    this.outline = ({type: 'Sphere'})
    this.rScale = d3.scaleLinear()
    this.rKey = 'Prevalence'
	}

  componentDidMount() {
    const data = this.props.data
    this.draw(data)
	}

  componentDidUpdate() {
    const data = this.props.data.geo
    this.redraw(data)
	}

  draw(data) {
    console.log(data.rights)
    const parent = this.ref.current.parentElement
    const container = parent.getBoundingClientRect()
    const { paddingLeft, paddingRight } = parent.currentStyle ||
      window.getComputedStyle(parent)

    this.width = container.width - this.margin.left - this.margin.right -
      (parseInt(paddingLeft) + parseInt(paddingRight))
    this.height = this.getHeight()

		this.rScale = this.rScale
			.domain(
        [
          d3.min(data.rights, d => +d[this.rKey]),
          d3.max(data.rights, d => +d[this.rKey])
        ]
      )
      .range([2, 20])

    d3.select(this.ref.current)
      .call(this.drawContainer())
      .call(this.drawMap(data.geo))
      .call(this.drawCircles(data))
	}

  redraw(data) {
    d3.select(this.ref.current)
      .call(this.drawCircles(data))
	}

  getHeight() {
    const [[x0, y0], [x1, y1]] = d3.geoPath(
      this.projection.fitWidth(this.width, this.outline)
    ).bounds(this.outline)

    const dy = Math.ceil(y1 - y0)
    const l = Math.min(Math.ceil(x1 - x0), dy)

    this.projection.scale(this.projection.scale() * (l - 1) / l).precision(0.2)

    return dy
  }

  drawCircles(data) {
    const { path, rScale } = this

		return node => {
      const centroids = data.geo.features.map(feature => {
        const centroid = path.centroid(feature)
        const country = data.rights.find(d => d['ISO-3'] === feature.id)
        const value = country ? country[this.rKey] : 0

        return { centroid, value }
      })

      const g = node.select('g.container')

    	const circles = g.selectAll('.circle')
				.data(centroids)
				.attr('class', 'circle')

			circles.exit()
				.transition().duration(this.duration)
        .attr('opacity', 0)
        .attr('r', 0)
        .remove()

			circles.enter()
				.append('circle')
				.attr('class', 'circle')
				.attr('fill', 'black')
        .attr('opacity', 0.2)
				.attr('stroke', 'none')
				.attr('cx', d => d.centroid[0])
				.attr('cy', d => d.centroid[1])
				.merge(circles)
				.transition().duration(this.duration)
        .attr('r', d => rScale(d.value))
    }
	}

  drawMap(geoData) {
    const { path } = this

    return node => {
      const g = node.select('g.container')

      g.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
      	.attr('d', path)
      	.attr('fill', 'lightgrey')
      	.attr('stroke', 'lightgrey')
    }
	}

  drawContainer() {
    const { width, height, margin } = this

    return node => {
			const svg = node
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)

			svg.append('g')
				.attr('transform', `translate(${margin.left}, ${margin.top})`)
				.attr('class', 'container')
			}
  }

  handleChange(_, { value }) {
		this.props.setSelection(value)
	}

  render() {
    return (
      <svg ref={this.ref}/>
    )
  }
}
