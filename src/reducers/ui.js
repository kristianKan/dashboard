import * as types from "../constants/actionTypes";

const initialState = {
  selectedItem: "total",
  selectedCountry: null,
};

const ui = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_SELECTION:
      return { ...state, selectedItem: action.selection };

    case types.SET_SELECTED_COUNTRY:
      return { ...state, selectedCountry: action.selection };

    default:
      return state;
  }
};

export default ui;
