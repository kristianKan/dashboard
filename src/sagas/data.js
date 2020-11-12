import { call, put, takeLatest } from "redux-saga/effects";
import { csv, json } from "d3";
import axios from "axios";
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

  return emptyArray.map((_, i) => {
    const id = new Date().getTime().toString() + i;
    const name = Math.random().toString(36).substring(7);
    const product = Math.floor(Math.random() * products.length);
    const tier = getRandomInt(0, 4);
    const governance = getRandomInt(0, 3);
    const governanceMs = getRandomInt(10, 30);
    const geographicRs = getRandomInt(10, 20);
    const industryRs = getRandomInt(20, 40);
    const productRs = getRandomInt(40, 60);
    const employmentRs = getRandomInt(60, 90);

    const rm = {
      governance: governanceMs,
    };
    const rs = {
      geographic: geographicRs,
      industry: industryRs,
      product: productRs,
      employment: employmentRs,
    };

    const emptyCountries = new Array(getRandomInt(0, 4)).fill("");
    const countries = emptyCountries.map(
      () => codes[Math.floor(Math.random() * codes.length)]["country-code"]
    );

    return {
      id,
      name,
      countries,
      product,
      governance,
      rs,
      rm,
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
      const total = Object.values(d.rs).reduce((sum, v) => v + sum, 0);
      return total + acc;
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

export function requestData() {
  return axios.request({
    method: "GET",
    url: "https://rdd-be001.appspot.com/client/api/supplier-dashboard/",
  });
}

export function* fetchData() {
  try {
    const metaData = yield call(requestMetaData);
    const { data } = yield call(requestData);
    console.log(data, metaData);
    yield put({ type: types.FETCH_DATA_SUCCESS, data: metaData });
  } catch (error) {
    yield put({ type: types.FETCH_DATA_FAILURE, error });
  }
}

export const dataSaga = [takeLatest(types.FETCH_DATA_REQUEST, fetchData)];
