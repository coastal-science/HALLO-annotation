import { Box } from "@material-ui/core";
import React from "react";

const Page = ({ children }) => {
  return <Box minHeight="80vh">{children}</Box>;
};

export default Page;
