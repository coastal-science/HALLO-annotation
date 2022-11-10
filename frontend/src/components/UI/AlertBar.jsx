import React from "react";

import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

import { useSelector, useDispatch } from "react-redux";
import { closeAlert } from "#reducers/errorSlice";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

//severity: error, warning, info, success
//autoHideDuration: null or number
//onclose (event, reason) => {}  reason: timeout, clickaway
const AlertBar = () => {
  const { isAlertOpen, alertMessage, alertSeverity, alertTimer } = useSelector(
    (state) => state.error
  );
  const dispatch = useDispatch();

  const handleClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(closeAlert());
  };
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      open={isAlertOpen}
      autoHideDuration={alertTimer}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={alertSeverity}>
        {alertMessage}
      </Alert>
    </Snackbar>
  );
};

export default AlertBar;
