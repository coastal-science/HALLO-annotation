import { TextField } from "@material-ui/core";
import { inputStopPropagation } from "../../utils/dataGridUtils";

const FilterTextField = ({ ...rest }) => {
  return (
    <TextField
      {...rest}
      variant="outlined"
      onKeyDown={inputStopPropagation}
      fullWidth
    />
  );
};

export default FilterTextField;
