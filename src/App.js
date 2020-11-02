import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, ThemeProvider } from "@material-ui/styles";

import theme from "./lib/theme";
import { Graphics } from "./containers/Graphics";

const useStyles = makeStyles(() => ({
  "@global": {
    body: {
      minWidth: "320px",
      top: "320px",
      left: "410px",
      width: "900px",
      height: "433px",
      margin: "0 auto",
    },
  },
}));

function App() {
  useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Graphics />
    </ThemeProvider>
  );
}

export default App;
