function getRandomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function mockSuppliersData(codes) {
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

export function mockCountriesData(codes) {
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
