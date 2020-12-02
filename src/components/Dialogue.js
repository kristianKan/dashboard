import React from "react";
import Popover from "@material-ui/core/Popover";

export default function Dialogue(props) {
  const { onClose, selectedValue, open, anchor, id, countries } = props;

  console.log(anchor);
  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Popover
      id={id}
      open={open}
      anchor={anchor}
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
      {countries.join()}
    </Popover>
  );
}
