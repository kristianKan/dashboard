import { all } from "redux-saga/effects";

import { dataSaga } from "./data";

export default function* rootSaga() {
  yield all([...dataSaga]);
}
