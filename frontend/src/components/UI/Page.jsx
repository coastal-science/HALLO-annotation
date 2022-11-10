import { Box } from "@material-ui/core";

const Page = ({ children }) => {
  return <Box minHeight="80vh">{children}</Box>;
};

export default Page;
