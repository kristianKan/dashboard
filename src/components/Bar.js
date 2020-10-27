import * as React from 'react'
import * as d3 from 'd3'

const barColors = [
  '#DEEBF7',
  '#4292C6',
  '#9ECAE1',
  '#C6DBEF',
]
export class Bar extends React.Component {
  constructor(props) {
  	super(props)
    this.ref = React.createRef()
		this.xScale = d3.scaleLinear()
    this.yScale = d3.scaleBand()
		this.xAxis = d3.axisBottom()
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0])
    this.width = 0
    this.height = 0
		this.margin = { top: 20, right: 20, bottom: 30, left: 60 }
    this.duration = 1200
    this.color = d3.scaleOrdinal().range(barColors)
	}

  componentDidMount() {
    const data = this.props.data.supplier
    this.draw(data)
	}

  componentDidUpdate() {
    const data = this.props.data.supplier
    this.redraw(data)
	}

  getContainerHeight(data) {
    const { margin } = this
    this.height = data.length * 20 - margin.top - margin.bottom
  }

  processData(data) {
    return data.reduce((acc, d) => {
      const values = Object.entries(d)
        .map(([key, value]) => ({ name: d.name, key, value }))
        .sort((a, b) => b.value - a.value)

      return [...acc, ...values]
    }, [])
  }

  getContainerWidth(data) {
    const { margin, ref } = this
    const parent = ref.current.parentElement
    const container = parent.getBoundingClientRect()
    const { paddingLeft, paddingRight } = parent.currentStyle ||
      window.getComputedStyle(parent)

    this.width = container.width - margin.left - margin.right -
      (parseInt(paddingLeft) + parseInt(paddingRight))
  }

  draw(data) {
    const processedData = this.processData(data)
    this.getContainerWidth()
    this.getContainerHeight(data)

		this.yScale = this.yScale
      .domain(data.map(d => d.name))
      .range([this.height, 0])
      .padding(1.2)

		this.xScale = this.xScale
			.domain([0, d3.max(processedData, d => +d.value)])
			.range([0, this.width])
      .nice()

    this.color = this.color
      .domain(processedData.map(d => d.key))

		this.yAxis = this.yAxis.scale(this.yScale)
    this.xAxis = this.xAxis.scale(this.xScale)

    d3.select(this.ref.current)
      .call(this.drawContainer())
      .call(this.drawBars(processedData))
      .call(this.drawAxes())
	}

  redraw(data) {
    d3.select(this.ref.current)
      .call(this.drawBars(data))
      .call(this.drawAxes())
	}

  drawBars(data) {
    const { xScale, yScale, color, duration } = this
    const barHeight = 12

		return node => {
      const g = node.select('g.container')

    	const bars = g.selectAll('.bar')
				.data(data)
				.attr('class', 'bar')

			bars.exit()
				.transition().duration(duration)
        .attr('opacity', 0)
        .attr('r', 0)
        .remove()

			bars.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('fill', d => color(d.key))
        .attr('opacity', 1)
				.attr('stroke', 'none')
        .attr('height', barHeight)
				.attr('x', 0)
				.attr('y', d => yScale(d.name) - barHeight / 2)
				.merge(bars)
				.transition().duration(duration)
				.attr('width', d => xScale(d.value))
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
    const { height, xAxis, yAxis, duration } = this

    return node => {
      const g = node.select('g.container')
      const x = g.selectAll('.x.axis')
        .data(['dummy'])
      const y = g.selectAll('.y.axis')
        .data(['dummy'])

      x.enter().append('g')
        .attr('class','x axis')
        .attr('transform', `translate(0, ${height})`)
        .merge(x)
				.transition().duration(duration)
        .call(xAxis)

      y.enter().append('g')
        .attr('class','y axis')
        .merge(y)
				.transition().duration(duration)
        .call(yAxis)
        .call(n => n.select('.domain').remove())

      g.selectAll('.domain')
        .attr('stroke', '#CCCCCC')

      g.selectAll('.tick line')
        .attr('stroke', '#CCCCCC')

      g.selectAll('.y.axis text')
        .attr('transform', `translate(${-15}, 0)`)
    }
	}

  handleChange(_, { value }) {
		this.props.setRegion(value)
	}

  render() {
    return (
      <div>
        <svg ref={this.ref}/>
      </div>
    )
  }
}
