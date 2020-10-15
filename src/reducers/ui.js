import * as types from '../constants/actionTypes'

const initialState = {
  selectedRegion: null
}

const ui = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_REGION:
      return { ...state, selectedRegion: action.region }

    default:
      return state
  }
}

export default ui
