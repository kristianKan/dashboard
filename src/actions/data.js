import * as types from '../constants/actionTypes'

export const fetchDataRequest = () => ({
  type: types.FETCH_DATA_REQUEST,
})

export const fetchDataSuccess = data => ({
  type: types.FETCH_DATA_SUCCESS,
  data,
})

export const fetchDataFailure = error => ({
  type: types.FETCH_DATA_FAILURE,
  error,
})
