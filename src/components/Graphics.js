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
                <InfoPopper info="test popper test popper test popper test popper test popper test popper test popper test popper" />
              </div>
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
              <InfoPopper info="test popper" />
            </div>
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
            <div className={classes.title}>
              <h3>Geographic Risk Quadrant</h3>
              <InfoPopper info="test popper" />
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
              <InfoPopper info="test popper" />
            </div>
            <Table {...props} />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <div className={classes.title}>
              <h3>Product and Service Risk Treemap</h3>
              <InfoPopper info="test popper" />
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
              <InfoPopper info="test popper" />
            </div>
            <Bars
              drawContainer={drawContainer}
              drawLegend={drawLegend}
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
              <InfoPopper info="test popper" />
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
