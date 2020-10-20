import { call, put, takeLatest } from 'redux-saga/effects'
import { csv, json } from 'd3'
import * as topojson from 'topojson-client'

import * as types from '../constants/actionTypes'

export function* fetchData() {
  const data = yield call(requestData)
  const processedData = processData(data)
  yield put({ type: types.FETCH_DATA_SUCCESS, data: processedData })
}

export async function requestData() {
  const rights = await csv(`${process.env.PUBLIC_URL}/data.csv`)
  const map = await json(`${process.env.PUBLIC_URL}/countries-110m.json`)
  const codes = await csv(`${process.env.PUBLIC_URL}/iso-codes.csv`)

  return { rights, map, codes }
}

function processData(data) {
  const mesh = topojson.feature(data.map, data.map.objects.countries)
  const rights = data.rights.map(d => {
    const code = data.codes.find(code => code['alpha-3'] === d['ISO-3'])
    d['ISO-3'] = code ? code['country-code'] : d['ISO-3']
    return d
  })

  return [ rights, mesh ]
}

export const dataSaga = [
  takeLatest(types.FETCH_DATA_REQUEST, fetchData)
]
