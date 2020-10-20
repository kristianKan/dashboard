import * as types from '../constants/actionTypes'

const initialState = {
  rights: {},
  geo: {},
  error: null,
  fetching: false,
}

const data = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_DATA_REQUEST:
      return { ...state, fetching: true, error: null }

    case types.FETCH_DATA_SUCCESS:
      return { ...state,
        fetching: false,
        rights: action.data[0],
        geo: action.data[1],
      }

    case types.FETCH_DATA_FAILURE:
      return { ...state, fetching: false, error: action.error }

    default:
      return state
  }
}

export default data
