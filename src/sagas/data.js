import { call, put, takeLatest } from "redux-saga/effects";
import { csv, json } from "d3";
import axios from "axios";
import * as topojson from "topojson-client";

import * as types from "../constants/actionTypes";

function getUniqueCountries(suppliers, countries, codes) {
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

    const countryMeta = codes.find((d) => d["alpha-3"] === code);
    const country = countries.find(
      (d) => d.country_code === countryMeta["alpha-2"]
    );

    const risk = countrySuppliers.reduce((acc, d) => {
      return d.risks.total + acc;
    }, 0);

    return {
      ...country,
      iso_code_num: countryMeta["country-code"],
      risk,
      suppliers: countrySuppliers,
    };
  });
}

function getUniqueProducts(suppliers, products) {
  const uniqueProducts = suppliers.reduce((acc, d) => {
    const supplierProducts = d.products.reduce((acc2, product) => {
      const { name } = products.find((v) => v.value === product.id);
      return acc.find((v) => v.id === product.id)
        ? acc2
        : [...acc2, { ...product, name }];
    }, []);
    return [...acc, ...supplierProducts];
  }, []);

  return uniqueProducts.map((product) => {
    const productSuppliers = suppliers.filter((d) => {
      return d.products.find((v) => v.id === product.id);
    });

    const countries = productSuppliers.reduce((acc, d) => {
      const supplierCountries = d.countries.reduce((acc2, country) => {
        return acc.includes(country) ? acc2 : [...acc2, country];
      }, []);
      return [...acc, ...supplierCountries];
    }, []);

    return {
      ...product,
      countries,
      suppliers: productSuppliers,
    };
  });
}

export async function requestMetaData() {
  const world = await json(`${process.env.PUBLIC_URL}/countries-110m.json`);
  const isoCodeIndex = await csv(`${process.env.PUBLIC_URL}/iso-codes.csv`);
  const productIndex = await json(`${process.env.PUBLIC_URL}/products.json`);
  const countriesIndex = await json(`${process.env.PUBLIC_URL}/countries.json`);

  const geo = topojson.feature(world, world.objects.countries);

  return { geo, isoCodeIndex, productIndex, countriesIndex };
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
    url:
      "https://test-app-dot-rdd-be001.appspot.com/client/api/supplier-dashboard/",
  });
}

export function* fetchData() {
  try {
    const { geo, isoCodeIndex, productIndex, countriesIndex } = yield call(
      requestMetaData
    );
    const { data } = yield call(requestSuppliersData);

    const suppliers = processSuppliersData(data).sort(
      (a, b) => a.risks.total - b.risks.total
    );

    const countries = getUniqueCountries(
      suppliers,
      countriesIndex,
      isoCodeIndex
    );

    const products = getUniqueProducts(suppliers, productIndex);

    yield put({
      type: types.FETCH_DATA_SUCCESS,
      data: { geo, suppliers, countries, products },
    });
  } catch (error) {
    yield put({ type: types.FETCH_DATA_FAILURE, error });
  }
}

export const dataSaga = [takeLatest(types.FETCH_DATA_REQUEST, fetchData)];
