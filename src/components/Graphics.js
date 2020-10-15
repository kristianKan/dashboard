import * as React from 'react'
import * as d3 from 'd3'
import Grid from '@material-ui/core/Grid'

const gridStyle = {
  height: '100vh',
  fontSize: '18px'
}

export class Graphics extends React.Component {
  constructor(props) {
  	super(props)
    this.ref = React.createRef()
		this.xScale = d3.scaleLinear()
    this.yScale = d3.scaleLinear()
		this.xAxis = d3.axisBottom()
    this.yAxis = d3.axisLeft()
    this.width = 0
    this.height = 0
		this.margin = { top: 20, right: 20, bottom: 30, left: 40 }
    this.duration = 1200
    this.xKey = `Strength of government response`
    this.yKey = `Prevalence`
	}

  componentDidMount() {
    const data = this.props.data.data
    this.draw(data)
	}

  componentDidUpdate() {
    const data = this.props.data.data
    this.redraw(data)
	}

  draw(data) {
    const parent = this.ref.current.parentElement
    const container = parent.getBoundingClientRect()
    const { paddingLeft, paddingRight } = parent.currentStyle ||
      window.getComputedStyle(parent)

    this.width = container.width - this.margin.left - this.margin.right -
      (parseInt(paddingLeft) + parseInt(paddingRight))
    this.height = container.height - this.margin.top - this.margin.bottom

		this.yScale = this.yScale
			.domain([0, d3.max(data, d => +d[this.yKey])])
      .range([this.height, 0])
		this.xScale = this.xScale
			.domain([0, d3.max(data, d => +d[this.xKey])])
			.range([0, this.width])

		this.yAxis = this.yAxis.scale(this.yScale)
    this.xAxis = this.xAxis.scale(this.xScale)

    d3.select(this.ref.current)
      .call(this.drawContainer())
      .call(this.drawCircles(data))
      .call(this.drawAxes())
	}

  redraw(data) {
		this.yScale = this.yScale
			.domain([0, d3.max(data, d => +d[this.yKey])])
      .range([this.height, 0])

		this.yAxis = this.yAxis.scale(this.yScale)

    d3.select(this.ref.current)
      .call(this.drawCircles(data))
      .call(this.drawAxes())
	}

  drawCircles(data) {
    const { xScale, yScale, xKey, yKey } = this

		return node => {
      const g = node.select('g.container')

    	const circles = g.selectAll('.circle')
				.data(data)
				.attr('class', 'circle')

			circles.exit()
				.transition().duration(this.duration)
        .attr('opacity', 0)
        .attr('r', 0)
        .remove()

			circles.enter()
				.append('circle')
				.attr('class', 'circle')
				.attr('fill', 'white')
        .attr('opacity', 1)
				.attr('stroke', 'none')
				.attr('cx', d => xScale(d[xKey]))
				.attr('cy', d => yScale(d[yKey]))
				.merge(circles)
				.transition().duration(this.duration)
				.attr('cx', d => xScale(d[xKey]))
				.attr('cy', d => yScale(d[yKey]))
        .attr('r', 5)
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

  drawAxes() {
    const { height, xAxis, yAxis } = this

    return node => {
      const g = node.select('g.container')
      const x = g.selectAll('.x.axis')
        .data(['dummy'])
      const y = g.selectAll('.y.axis')
        .data(['dummy'])

      x.enter().append('g')
        .attr('class','x axis')
        .attr('stroke', 'white')
        .attr('transform', `translate(0, ${height})`)
        .merge(x)
				.transition().duration(this.duration)
        .call(xAxis)

      y.enter().append('g')
        .attr('class','y axis')
        .attr('stroke', 'white')
        .merge(y)
				.transition().duration(this.duration)
        .call(yAxis)

    }
	}

  handleChange(_, { value }) {
		this.props.setRegion(value)
	}

  render() {
    return (
      <Grid container style={gridStyle}>
          <svg ref={this.ref}/>
      </Grid>
    )
  }
}
