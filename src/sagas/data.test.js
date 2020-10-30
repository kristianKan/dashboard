import { call } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";
import { fetchData, requestData } from "./data";

it("just works!", () => {
  const fakeData = { texas: [{ Year: 2018 }, { Year: 2019 }] };

  return expectSaga(fetchData)
    .provide([[call(requestData), fakeData]])
    .put({ type: "FETCH_DATA_SUCCESS", data: fakeData })
    .put({ type: "SET_REGION", region: "texas" })
    .run();
});
