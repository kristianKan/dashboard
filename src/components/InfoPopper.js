import * as React from "react";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import Popper from "@material-ui/core/Popper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: "300px",
    minHeight: "60px",
    borderRadius: "7px",
    padding: theme.spacing(1),
    backgroundColor: "black",
    color: "white",
  },
  popper: {
    zIndex: 1,
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 1em 1em 0",
        borderColor: `transparent #000000 transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 0 1em 1em",
        borderColor: `transparent transparent transparent #000000`,
      },
    },
  },
  arrow: {
    position: "absolute",
    fontSize: 7,
    width: "3em",
    height: "3em",
    "&::before": {
      content: '""',
      margin: "auto",
      display: "block",
      width: 0,
      height: 0,
      borderStyle: "solid",
    },
  },
}));

export default function InfoPopper({ info }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [arrowRef, setArrowRef] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClick = (event) => {
    setOpen(true);
    setAnchorEl(event.target.parentNode);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const id = open ? "info-popper" : undefined;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        <InfoIcon
          fontSize="small"
          aria-describedby={id}
          onClick={handleClick}
        />
        <Popper
          className={classes.popper}
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="right"
          disablePortal={true}
          modifiers={{
            flip: {
              enabled: true,
            },
            preventOverflow: {
              enabled: true,
              boundariesElement: "viewport",
            },
            arrow: {
              enabled: true,
              element: arrowRef,
            },
          }}
        >
          <div className={classes.paper}>{info}</div>
          <span className={classes.arrow} ref={setArrowRef} />
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
