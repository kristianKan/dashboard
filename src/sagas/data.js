import { call, put, takeLatest } from 'redux-saga/effects'
import { csv, json } from 'd3'
import * as topojson from 'topojson-client'

import * as types from '../constants/actionTypes'

export function* fetchData() {
  const data = yield call(requestData)
  const mesh = topojson.feature(data.map, data.map.objects.countries)
  yield put({ type: types.FETCH_DATA_SUCCESS, data: [data.rights, mesh] })
}

export async function requestData() {
  const rights = await csv(`${process.env.PUBLIC_URL}/data.csv`)
  const map = await json(`${process.env.PUBLIC_URL}/countries-110m.json`)

  return { rights, map }
}

export const dataSaga = [
  takeLatest(types.FETCH_DATA_REQUEST, fetchData)
]
