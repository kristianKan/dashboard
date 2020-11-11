import { call } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";
import { fetchData, requestMetaData } from "./data";

const suppliers = [
  {
    name: "Apple",
    product: "fruit",
    countries: ["156", "840"],
    governance: 1,
    tier: 4,
    risks: {
      rs_rm_geographic: 10,
      rs_rm_industry: 10,
      rs_rm_product: 10,
      rs_rm_employment: 10,
      rs_rm_total: 40,
    },
  },
];

const countries = {
  156: {
    name: "China",
    iso_code: "CHN",
    prevalance: 10,
    regulation: 10,
  },
  840: {
    name: "The United States of America",
    iso_code: "USA",
    prevalance: 10,
    regulation: 10,
  },
};

it("load mock data", () => {
  const fakeData = { countries, suppliers };

  return expectSaga(fetchData)
    .provide([[call(requestMetaData), fakeData]])
    .put({ type: "FETCH_DATA_SUCCESS", data: fakeData })
    .put({ type: "SET_SELECTION", risk: "geographic" })
    .run();
});
