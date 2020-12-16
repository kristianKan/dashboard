import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import StackedBars from "./StackedBars";
import Geo from "./Geo";
import Quadrant from "./Quadrant";
import Treemap from "./Treemap";
import Bars from "./Bars";
import Pie from "./Pie";
import Table from "./Table";
import InfoPopper from "./InfoPopper";

import {
  drawContainer,
  drawLegend,
  drawTooltip,
  getContainerHeight,
  getContainerWidth,
  getColorScale,
  getOrdinalColorScale,
  getLinearScale,
} from "./utils";

import { drawCircleLegend } from "./CircleLegend";

const useStyles = makeStyles(() => ({
  box: {
    margin: "64px 0 0 64px",
    paddingTop: "20px",
  },
  paper: {
    padding: "20px",
  },
  title: {
    display: "flex",
    alignItems: "center",
  },
}));

const duration = 1200;

export default function Graphics(props) {
  const classes = useStyles();
  const {
    setSelection,
    selectedItem,
    selectedRiskScore,
    data,
    ...rest
  } = props;

  return (
    <div className={classes.box}>
      <h1>Dashboard</h1>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Paper className={classes.paper}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className={classes.title}>
                <h3>Supplier Risk Summary</h3>
                <InfoPopper info="The ranking shows your 20 highest risk suppliers based on their total slavery risk score. Use the drop down box on the right to sort suppliers by specific risk scores." />
              </div>
              <Select
                style={{ width: "180px" }}
                value={selectedItem}
                onChange={setSelection}
              >
                <MenuItem value="total">Net Risk</MenuItem>
                <MenuItem value="geographic">Geographic Risk</MenuItem>
                <MenuItem value="industry">Industry Risk</MenuItem>
                <MenuItem value="product">Product/Service Risk</MenuItem>
                <MenuItem value="employment">Employment Risk</MenuItem>
              </Select>
            </div>
            <StackedBars
              drawContainer={drawContainer}
              drawLegend={drawLegend}
              drawTooltip={drawTooltip}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              duration={duration}
              data={{ ...data, suppliers: selectedRiskScore }}
              {...rest}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Geographic Risk Map</h3>
              <InfoPopper
                info="The world map shows the prevalence of slavery in the countries your suppliers are operating in. Hover over the risk points to find out the estimated number of victims of slavery per 1,000 of population. The size of the risk point reflects the number of suppliers in a given country.
"
              />
            </div>
            <Geo
              drawTooltip={drawTooltip}
              drawContainer={drawContainer}
              drawLegend={drawCircleLegend}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              getColorScale={getColorScale}
              getLinearScale={getLinearScale}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Geographic Risk Quadrant</h3>
              <InfoPopper info="The risk quadrant represents the degree of slavery risk in your suppliers’ countries of operation. The x axis shows prevalence of victims per 1,000 of population ranging from lowest  (left) to highest prevalence (right). The y axis indicates the strength of governance response to tackle slavery ranging from weakest regulation (top) to strongest (bottom)." />
            </div>
            <Quadrant
              drawTooltip={drawTooltip}
              drawContainer={drawContainer}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              getColorScale={getColorScale}
              getLinearScale={getLinearScale}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Product and Service Risk Table</h3>
              <InfoPopper info="The table shows the 25 highest risk products/services in your supply chain and the number of suppliers involved in their production. Hover over the country code to find out where your highest risk products/services are produced." />
            </div>
            <Table {...props} />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Product and Service Risk Treemap</h3>
              <InfoPopper info="Each product/ service supplied to you is categorized into one of five risk tiers. The size and colour of the box indicate the level of risk. Hover over a box to see which products/ services you purchase are categorised in the relevant tier." />
            </div>
            <Treemap
              drawTooltip={drawTooltip}
              drawContainer={drawContainer}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              getColorScale={getOrdinalColorScale}
              getLinearScale={getLinearScale}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Employment Mode Risk</h3>
              <InfoPopper info="Suppliers are categorized into one of five risk tiers based on the risk their workers are exposed to through their recruitment practices and type of employment relationship. The risk tiers are ranked from highest to lowest risk." />
            </div>
            <Bars
              drawContainer={drawContainer}
              drawLegend={drawLegend}
              drawTooltip={drawTooltip}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              getColorScale={getOrdinalColorScale}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Governance Performance</h3>
              <InfoPopper info="Each supplier has been given a risk mitigation score which is calculated on the basis of the scope and strengths of the risk mitigation measures implemented by the supplier. Suppliers are grouped into one out of three tiers ranging from strongest to weakest governance performance. Suppliers which failed to meet the threshold for analysis fall into the ‘below threshold’ category." />
            </div>
            <Pie
              drawContainer={drawContainer}
              drawLegend={drawLegend}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              getColorScale={getColorScale}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
