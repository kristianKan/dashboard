import * as React from 'react'
import { makeStyles } from "@material-ui/styles";
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import { Bar } from '../components/Bar'
import { Geo } from '../components/Geo'
import { Quadrant } from '../components/Quadrant'

const useStyles = makeStyles(() => ({
  box: {
    margin: '64px 0 0 64px',
    paddingTop: '20px',
  },
  paper: {
    padding: '20px'
  }
}));

export function Graphics(props) {
  const classes = useStyles();

  return (
    <div className={classes.box}>
      <h1>Dashboard</h1>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Paper className={classes.paper}>
            <h3>Supplier Risk Summary</h3>
            <Bar {...props} />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <h3>Geographic Risk Map</h3>
            <Geo {...props} />
          </Paper>
        </Grid>
        <Grid item sm={6}>
          <Paper className={classes.paper}>
            <h3>Geographic Risk Quadrant</h3>
            <Quadrant {...props} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
