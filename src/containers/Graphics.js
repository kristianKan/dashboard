import * as React from "react";
import { connect } from "react-redux";

import { getSelectedRiskScore } from "../selectors";
import { fetchDataRequest, setSelection } from "../actions";
import Graphics from "../components/Graphics";

class Container extends React.Component {
  componentDidMount() {
    const { getData } = this.props;

    getData();
  }

  render() {
    const { data } = this.props;
    const isData =
      Object.entries(data.suppliers).length > 0 &&
      Object.entries(data.countries).length > 0 &&
      Object.entries(data.geo).length > 0;
    return isData ? <Graphics {...this.props} /> : false;
  }
}

const mapStateToProps = (state) => ({
  data: state.data,
  means: state.means,
  selectedItem: state.ui.selectedItem,
  selectedRiskScore: getSelectedRiskScore(state),
});

const mapDispatchToProps = (dispatch) => ({
  getData: () => dispatch(fetchDataRequest()),
  setSelection: (selection) => dispatch(setSelection(selection.target.value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Container);
