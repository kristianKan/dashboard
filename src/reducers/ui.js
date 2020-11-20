import * as types from "../constants/actionTypes";

const initialState = {
  selectedItem: "total",
};

const ui = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_SELECTION:
      return { ...state, selectedItem: action.selection };

    default:
      return state;
  }
};

export default ui;
