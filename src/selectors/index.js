import { createSelector } from "reselect";

const getSelectedRisk = (state) => state.ui.selectedItem;
const getSuppliers = (state) => state.data.suppliers;

export const getSelectedRiskScore = createSelector(
  [getSelectedRisk, getSuppliers],
  (selectedRisk, suppliers) => {
    return suppliers.map((d) => {
      const reducedScores = Object.entries(d.risks.scores).reduce(
        (acc, [k, v]) => {
          return {
            ...acc,
            [k]: k === `ms_${selectedRisk}` ? v : 0,
          };
        },
        {}
      );

      const selectedRiskScore =
        selectedRisk === "total" ? d.risks.scores : reducedScores;

      return { ...d, risks: { scores: selectedRiskScore } };
    });
  }
);
