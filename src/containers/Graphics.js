import * as React from 'react'
import { connect } from 'react-redux'

import { fetchDataRequest, setSelection } from '../actions'
import { Graphics as GraphicsComponent } from '../components/Graphics'

class GraphicsContainer extends React.Component {
  componentDidMount() {
    this.props.getData()
	}

  render() {
    const isData = Object.entries(this.props.data.rights).length > 0 &&
      Object.entries(this.props.data.geo).length > 0
    return (isData ? <GraphicsComponent {...this.props} /> : false)
  }
}

const mapStateToProps = state => ({
  data: state.data,
  means: state.means,
	selectedItem: state.ui.selectedItem
})

const mapDispatchToProps = dispatch => ({
  getData: () => dispatch(fetchDataRequest()),
	setSelection: selection => dispatch(setSelection(selection))
})

export const Graphics = connect(
  mapStateToProps,
  mapDispatchToProps
)(GraphicsContainer)
