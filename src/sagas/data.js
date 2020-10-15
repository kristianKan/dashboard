import { call, put, takeLatest } from 'redux-saga/effects'
import { csv } from 'd3'

import * as types from '../constants/actionTypes'

export function* fetchData() {
  const data = yield call(requestData)
  yield put({ type: types.FETCH_DATA_SUCCESS, data })
  yield put({ type: types.SET_REGION, region: Object.keys(data)[0] })
}

export async function requestData() {
  const data = [
    ...await csv('../../data/data.csv'),
  ].reduce((acc, cur) => {
    const regionName = cur.State.toLowerCase()
    const region = acc[regionName] || []
    return { ...acc, ...{ [regionName]: [...region, cur]}}
  }, {})

  return data
}

export const dataSaga = [
  takeLatest(types.FETCH_DATA_REQUEST, fetchData)
]
