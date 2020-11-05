import { call, put, takeLatest } from "redux-saga/effects";
import { csv, json } from "d3";
import * as topojson from "topojson-client";

import * as types from "../constants/actionTypes";

function getRandomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

function mockSuppliersData(codes) {
  const emptyArray = new Array(20).fill("");
  const products = ["clothes", "electronics", "fruit"];

  return emptyArray.map(() => {
    const name = Math.random().toString(36).substring(7);
    const product = Math.floor(Math.random() * products.length);
    const tier = getRandomInt(0, 4);
    const rsGeographic = getRandomInt(10, 20);
    const rsIndustry = getRandomInt(20, 40);
    const rsProduct = getRandomInt(40, 60);
    const rsEmployment = getRandomInt(60, 90);
    const rsGovernance = getRandomInt(1, 30);

    const risks = {
      rs_ms_geographic: rsGeographic,
      rs_ms_industry: rsIndustry,
      rs_ms_product: rsProduct,
      rs_ms_employment: rsEmployment,
      rs_ms_governance: rsGovernance,
      rs_ms_total:
        rsGeographic + rsIndustry + rsProduct + rsEmployment + rsGovernance,
    };

    const emptyCountries = new Array(getRandomInt(0, 4)).fill("");
    const countries = emptyCountries.map(
      () => codes[Math.floor(Math.random() * codes.length)]["country-code"]
    );

    return {
      name,
      countries,
      product,
      risks,
      tier,
    };
  });
}

function mockCountriesData(codes) {
  return codes.reduce((acc, code) => {
    const countryCode = code["country-code"];

    return {
      ...acc,
      [countryCode]: {
        name: code.name,
        iso_code: code["alpha-3"],
        iso_code_num: countryCode,
        prevalence: getRandomInt(1, 30),
        regulation: getRandomInt(1, 30),
      },
    };
  }, {});
}

function getCountrySuppliers(suppliers, countries) {
  const uniqueCountries = suppliers.reduce((acc, d) => {
    const supplierCountries = d.countries.reduce((unique, country) => {
      return acc.includes(country) ? unique : [...unique, country];
    }, []);

    return supplierCountries.length > 0 ? [...acc, ...supplierCountries] : acc;
  }, []);

  return uniqueCountries.map((code) => {
    const countrySuppliers = suppliers.filter((d) => {
      return d.countries.includes(code);
    });
    const country = countries[code];
    const risk = countrySuppliers.reduce((acc, d) => {
      return d.risks.rs_ms_total + acc;
    }, 0);

    return {
      ...country,
      risk,
      suppliers: countrySuppliers,
    };
  });
}

export async function requestMetaData() {
  const map = await json(`${process.env.PUBLIC_URL}/countries-110m.json`);
  const codes = await csv(`${process.env.PUBLIC_URL}/iso-codes.csv`);

  const suppliers = mockSuppliersData(codes);
  const countries = mockCountriesData(codes);
  const uniqueCountries = getCountrySuppliers(suppliers, countries);
  const geo = topojson.feature(map, map.objects.countries);

  return { geo, suppliers, countries: uniqueCountries };
}

export function* fetchData() {
  const data = yield call(requestMetaData);

  yield put({ type: types.FETCH_DATA_SUCCESS, data });
}

export const dataSaga = [takeLatest(types.FETCH_DATA_REQUEST, fetchData)];
