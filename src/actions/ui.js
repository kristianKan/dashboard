import * as types from "../constants/actionTypes";

export const setSelection = (selection) => ({
  type: types.SET_SELECTION,
  selection,
});

export const setSelectedCountry = (selection) => ({
  type: types.SET_SELECTED_COUNTRY,
  selection,
});
