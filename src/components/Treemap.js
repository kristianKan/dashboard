import * as React from 'react'
import * as d3 from 'd3'

export class Treemap extends React.Component {
 constructor(props) {
  	super(props)
    this.ref = React.createRef()
		this.margin = { top: 0, right: 0, bottom: 0, left: 0 }
    this.xKey = 'Prevalence'
    this.yKey = 'Strength of government response'
	}

  componentDidMount() {
    const { ref, margin, xKey, yKey } = this
    const {
      getContainerHeight,
      getContainerWidth,
      getColorScale,
      data
    } = this.props

    this.height = getContainerHeight(ref, margin)
    this.width = getContainerWidth(ref, margin)

    this.colorScale = getColorScale({ data: data.rights, xKey, yKey })

    this.draw(data)
	}

  componentDidUpdate() {
    const { props } = this
    const data = props.data.rights

    this.redraw(data)
	}

  draw(data) {
    const { ref, margin, width, height } = this
    const { drawContainer } = this.props

    d3.select(ref.current)
      .call(drawContainer({ width, height, margin }))
      .call(this.drawRects(data))
	}

  redraw(data) {
    const { ref } = this

    d3.select(ref.current)
      .call(this.drawRects(data))
	}

  drawRects(data) {
    const { xKey, yKey, colorScale } = this
    const { duration } = this.props

		return node => {
      const g = node.select('g.container')

    	const rects = g.selectAll('.rect')
				.data(data)
				.attr('class', 'rect')

			rects.exit()
				.transition().duration(duration)
        .attr('opacity', 0)
        .remove()

			rects.enter()
				.append('rect')
				.attr('class', 'rect')
				.attr('fill', d => colorScale(+d[xKey] + +d[yKey]))
        .attr('opacity', 0)
				.attr('stroke', 'none')
				.merge(rects)
				.transition().duration(duration)
        .attr('opacity', 1)
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
