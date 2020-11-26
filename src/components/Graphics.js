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

import {
  drawContainer,
  drawLegend,
  drawTooltip,
  getContainerHeight,
  getContainerWidth,
  getColorScale,
  getLinearScale,
} from "./utils";

const useStyles = makeStyles(() => ({
  box: {
    margin: "64px 0 0 64px",
    paddingTop: "20px",
  },
  paper: {
    padding: "20px",
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
              <h3>Supplier Risk Summary</h3>
              <Select
                style={{ width: "180px" }}
                value={selectedItem}
                onChange={setSelection}
              >
                <MenuItem value="total">Total Risk</MenuItem>
                <MenuItem value="geographic">Geographic Risk</MenuItem>
                <MenuItem value="industry">Industry Risk</MenuItem>
                <MenuItem value="product">Product/Service Risk</MenuItem>
                <MenuItem value="employment">Employment Risk</MenuItem>
              </Select>
            </div>
            <StackedBars
              drawContainer={drawContainer}
              drawLegend={drawLegend}
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
            <h3>Geographic Risk Map</h3>
            <Geo
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
            <h3>Geographic Risk Quadrant</h3>
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
            <h3>Product and Service Risk Treemap</h3>
            <Treemap
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
            <h3>Employment Mode Risk</h3>
            <Bars
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
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <h3>Governance Performance</h3>
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
