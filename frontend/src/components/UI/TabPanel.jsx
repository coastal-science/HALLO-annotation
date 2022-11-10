import { Box } from "@material-ui/core";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`batch-tabpanel-${index}`}
      aria-labelledby={`batch-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3} bgcolor={"white"} overflow={"auto"}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
