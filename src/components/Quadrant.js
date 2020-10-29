import * as React from 'react'
import * as d3 from 'd3'

export class Quadrant extends React.Component {
 constructor(props) {
  	super(props)
    this.ref = React.createRef()
		this.margin = { top: 20, right: 10, bottom: 30, left: 10 }
		this.xAxis = d3.axisBottom().ticks(0).tickSize([0, 0])
    this.yAxis = d3.axisLeft().ticks(0).tickSize([0, 0])
    this.xKey = 'Prevalence'
    this.yKey = 'Strength of government response'
	}

  componentDidMount() {
    const { ref, margin, xKey, yKey } = this
    const {
      getContainerWidth,
      getContainerHeight,
      getColorScale,
      getLinearScale,
      data
    } = this.props

    this.height = getContainerHeight(ref, margin)
    this.width = getContainerWidth(ref, margin)

    this.xScale = getLinearScale({
      data: data.rights,
      key: xKey,
      range: [0, this.width]
    })

    this.yScale = getLinearScale({
      data: data.rights,
      key: yKey,
      range: [this.height, 0]
    })

    this.colorScale = getColorScale({ data: data.rights, xKey, yKey })

		this.yAxis = this.yAxis.scale(this.yScale)
    this.xAxis = this.xAxis.scale(this.xScale)

    this.draw(data.rights)
	}

  componentDidUpdate() {
    const { data } = this.props

    this.redraw(data.rights)
	}

  draw(data) {
    const { ref, margin, width, height } = this
    const { drawContainer } = this.props

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawAxes())
      .call(this.drawQuads())
      .call(this.drawCircles(data))
	}

  redraw(data) {
    const { ref } = this

    d3.select(ref.current)
      .call(this.drawCircles(data))
	}

  drawCircles(data) {
    const { xScale, yScale, xKey, yKey, colorScale } = this
    const { duration } = this.props

		return node => {
      const g = node.select('g.container')

    	const circles = g.selectAll('.circle')
				.data(data)
				.attr('class', 'circle')

			circles.exit()
				.transition().duration(duration)
        .attr('opacity', 0)
        .attr('r', 0)
        .remove()

			circles.enter()
				.append('circle')
				.attr('class', 'circle')
				.attr('fill', d => colorScale(+d[xKey] + +d[yKey]))
        .attr('opacity', 1)
				.attr('stroke', 'none')
				.attr('cx', d => xScale(d[xKey]))
				.attr('cy', d => yScale(d[yKey]))
				.merge(circles)
				.transition().duration(duration)
        .attr('r', 5)
    }
	}

  drawQuads() {
    const { xScale, yScale } = this
    const origin = 0
    const xRange = xScale.range()[1]
    const yRange = yScale.range()[0]
    const margin = 3
    const quadsData = [
      {
        x: origin - margin,
        y: origin - margin,
        color: '#FFF4E5',
        text: 'Low Prevalence, Weak Regulation'
      },
      {
        x: xRange / 2 + margin,
        y: origin - margin,
        color: '#FEECEB',
        text: 'High Risk, High Prevalence, Weak Regulation'
      },
      {
        x: origin - margin,
        y: yRange / 2 + margin,
        color: '#FFFDEB',
        text: 'Low Risk, Low Prevalence, Strong Regulation'
      },
      {
        x: xRange / 2 + margin,
        y: yRange / 2 + margin,
        color: '#FFF4E5',
        text: 'High Prevalence, Strong Regulation'
      },
    ]

    return node => {
      const g = node.select('g.container')

      const quads = g.selectAll('.quad')
        .data(quadsData)

      quads.enter().append('rect')
        .attr('width', d => xRange / 2)
        .attr('height', d => yRange / 2)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('fill', d => d.color)

      quads.enter().append('text')
        .attr('x', (d, i) => i > 1 ? d.x : d.x)
        .attr('y', (d, i) => i > 1 ? yRange + 10 * 2 : d.y - 10)
        .attr('font-size', '8px')
        .text(d => d.text)
    }
  }

  drawAxes() {
    const { xScale, yScale, xAxis, yAxis, duration } = this

    return node => {
      const g = node.select('g.container')
      const x = g.selectAll('.x.axis')
        .data(['dummy'])
      const y = g.selectAll('.y.axis')
        .data(['dummy'])

      x.enter().append('g')
        .attr('class','x axis')
        .attr('transform', `translate(0, ${yScale.range()[0] / 2})`)
        .merge(x)
				.transition().duration(duration)
        .call(xAxis)

      y.enter().append('g')
        .attr('class','y axis')
        .attr('transform', `translate(${xScale.range()[1] / 2}, 0)`)
        .merge(y)
				.transition().duration(duration)
        .call(yAxis)

      g.selectAll('.domain')
        .attr('stroke', '#CCCCCC')
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
