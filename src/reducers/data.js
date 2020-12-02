import * as types from "../constants/actionTypes";

const initialState = {
  suppliers: [],
  countries: [],
  products: [],
  geo: {},
  error: null,
  fetching: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_DATA_REQUEST:
      return { ...state, fetching: true, error: null };

    case types.FETCH_DATA_SUCCESS:
      return {
        ...state,
        fetching: false,
        suppliers: action.data.suppliers,
        countries: action.data.countries,
        products: action.data.products,
        geo: action.data.geo,
      };

    case types.FETCH_DATA_FAILURE:
      return { ...state, fetching: false, error: action.error };

    default:
      return state;
  }
};

export default data;
