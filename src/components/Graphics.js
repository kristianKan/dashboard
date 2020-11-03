import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import Bar from "./Bar";
import Geo from "./Geo";
import Quadrant from "./Quadrant";
import Treemap from "./Treemap";

import {
  drawContainer,
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

  return (
    <div className={classes.box}>
      <h1>Dashboard</h1>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Paper className={classes.paper}>
            <h3>Supplier Risk Summary</h3>
            <Bar
              drawContainer={drawContainer}
              getContainerHeight={getContainerHeight}
              getContainerWidth={getContainerWidth}
              duration={duration}
              {...props}
            />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <h3>Geographic Risk Map</h3>
            <Geo
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
      </Grid>
    </div>
  );
}
