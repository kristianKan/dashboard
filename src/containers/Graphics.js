import * as React from 'react'
import { connect } from 'react-redux'

import { fetchDataRequest, setRegion } from '../actions'
import { Graphics as GraphicsComponent } from '../components/Graphics'

class GraphicsContainer extends React.Component {
  componentDidMount() {
    this.props.getData()
	}

  render() {
    const isData = Object.entries(this.props.data.data).length > 0
			&& this.props.selectedRegion
    return (isData ? <GraphicsComponent {...this.props} /> : false)
  }
}

const mapStateToProps = state => ({
  data: state.data,
  means: state.means,
	selectedRegion: state.ui.selectedRegion
})

const mapDispatchToProps = dispatch => ({
  getData: () => dispatch(fetchDataRequest()),
	setRegion: region => dispatch(setRegion(region))
})

export const Graphics = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphicsContainer)
