import { Typography, Box, CssBaseline } from "@material-ui/core";
import React from "react";

const NoAccess = () => {
  return (
    <Box
      height="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <CssBaseline />
      <Typography variant="h5">
        You currently do not have access, please wait while we are granting your
        permissions.
      </Typography>
    </Box>
  );
};

export default NoAccess;
