import { call, put, takeLatest } from 'redux-saga/effects'
import { csv } from 'd3'

import * as types from '../constants/actionTypes'

export function* fetchData() {
  const data = yield call(requestData)
  yield put({ type: types.FETCH_DATA_SUCCESS, data })
}

export async function requestData() {
  const data = await csv('../../data.csv')

  return data
}

export const dataSaga = [
  takeLatest(types.FETCH_DATA_REQUEST, fetchData)
]
