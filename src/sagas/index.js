import { all } from 'redux-saga/effects'

import { dataSaga } from './data'

export function* rootSaga() {
  yield all([
    ...dataSaga,
  ])
}
