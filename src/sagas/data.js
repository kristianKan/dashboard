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
  const productTypes = ["clothes", "electronics", "fruit"];

  return emptyArray.map((_, i) => {
    const id = new Date().getTime().toString() + i;
    const name = Math.random().toString(36).substring(7);
    const governanceMs = getRandomInt(10, 30);
    const geographicMs = getRandomInt(10, 20);
    const industryMs = getRandomInt(20, 40);
    const productMs = getRandomInt(40, 60);
    const employmentMs = getRandomInt(60, 90);
    const totalMs = geographicMs + industryMs + productMs + employmentMs;

    const tier = {
      ms_employment: getRandomInt(0, 4),
      ms_governance: getRandomInt(0, 3),
    };

    const mitigations = [
      {
        ms_governance: governanceMs,
      },
    ];

    const risks = [
      {
        ms_geographic: geographicMs,
        ms_industry: industryMs,
        ms_product: productMs,
        ms_employment: employmentMs,
        ms_total: totalMs,
      },
    ];

    const emptyCountries = new Array(getRandomInt(1, 4)).fill("");
    const countries = emptyCountries.map(
      () => codes[Math.floor(Math.random() * codes.length)]["alpha-3"]
    );
    const emptyProducts = new Array(getRandomInt(1, 4)).fill("");
    const products = emptyProducts.map(() => {
      return {
        name: productTypes[Math.floor(Math.random() * productTypes.length)],
        countries,
      };
    });

    return {
      id,
      name,
      country: countries[0],
      products,
      risks,
      mitigations,
      tier,
    };
  });
}

function mockCountriesData(codes) {
  return codes.reduce((acc, code) => {
    const countryCode = code["country-code"];
    const alpha3Code = code["alpha-3"];

    return {
      ...acc,
      [alpha3Code]: {
        name: code.name,
        iso_code: alpha3Code,
        iso_code_num: countryCode,
        prevalence: getRandomInt(1, 30),
        regulation: getRandomInt(1, 30),
      },
    };
  }, {});
}

function getCountrySuppliers(suppliers, countries) {
  const uniqueCountries = suppliers.reduce((acc, d) => {
    const supplierCountries = d.countries.reduce((acc2, country) => {
      return acc.includes(country) ? acc2 : [...acc2, country];
    }, []);
    return [...acc, ...supplierCountries];
  }, []);

  return uniqueCountries.map((code) => {
    const countrySuppliers = suppliers.filter((d) => {
      return d.countries.includes(code);
    });
    const country = countries[code];
    const risk = countrySuppliers.reduce((acc, d) => {
      return d.risks.total + acc;
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

  const geo = topojson.feature(map, map.objects.countries);

  return { geo, codes };
}

export function processSuppliersData(data) {
  return data.map((d) => {
    const { ms_total, ...scores } = d.risks[0];
    const risk = {
      total: ms_total,
      mean: ms_total / Object.keys(scores).length,
      scores,
    };

    const countries = d.products.reduce((acc, product) => {
      return [...acc, ...product.countries];
    }, []);

    return {
      ...d,
      risks: risk,
      mitigations: d.mitigations[0],
      countries,
    };
  });
}

export function requestSuppliersData() {
  return axios.request({
    method: "GET",
    url: "https://rdd-be001.appspot.com/client/api/supplier-dashboard/",
  });
}

export function* fetchData() {
  try {
    const { geo, codes } = yield call(requestMetaData);
    // const { data } = yield call(requestSuppliersData);
    // const suppliers = processSuppliersData(data)
    //   .sort((a, b) => a.risks.total - b.risks.total);
    const data = mockSuppliersData(codes);
    const suppliers = processSuppliersData(data);
    const mockCountries = mockCountriesData(codes);
    const countries = getCountrySuppliers(suppliers, mockCountries);

    yield put({
      type: types.FETCH_DATA_SUCCESS,
      data: { geo, suppliers, countries },
    });
  } catch (error) {
    yield put({ type: types.FETCH_DATA_FAILURE, error });
  }
}

export const dataSaga = [takeLatest(types.FETCH_DATA_REQUEST, fetchData)];
