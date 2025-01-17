import React from "react";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  popover: {
    padding: theme.spacing(2),
  },
  list: {
    fontSize: "12px",
  },
}));

export default function TablePopper(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open, anchorEl, id } = props;

  if (!selectedValue) {
    return null;
  }
  const { countries, name } = selectedValue;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <div className={classes.popover}>
        <h3>{name}</h3>
        <div>
          <b>Countries</b>
        </div>
        {countries.map((d) => {
          return (
            <Typography className={classes.list} key={d.country_code}>
              {d.country_name}
            </Typography>
          );
        })}
      </div>
    </Popover>
  );
}
