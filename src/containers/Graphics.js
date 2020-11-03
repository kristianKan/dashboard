import * as React from "react";
import { connect } from "react-redux";

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
      Object.entries(data.rights).length > 0 &&
      Object.entries(data.geo).length > 0;
    return isData ? <Graphics {...this.props} /> : false;
  }
}

const mapStateToProps = (state) => ({
  data: state.data,
  means: state.means,
  selectedItem: state.ui.selectedItem,
});

const mapDispatchToProps = (dispatch) => ({
  getData: () => dispatch(fetchDataRequest()),
  setSelection: (selection) => dispatch(setSelection(selection)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Container);
