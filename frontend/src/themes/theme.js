import { createMuiTheme } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

export const theme = createMuiTheme({
  typography: {
    fontFamily: "\"Roboto\"",
    fontSize: 12,
    subtitle1: {
      fontWeight: 500
    }
  },
  palette: {
    primary: {
      main: grey[800]
    }
  },
});