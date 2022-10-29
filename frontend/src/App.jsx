import { MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { theme } from "#themes/theme";
import Header from "#components/Layout/Header";
import SignIn from "#pages/Signin";
import SignUp from "#pages/Signup";
import BatchDashboard from "#pages/BatchDashboard";
import NoAccess from "#pages/NoAccess";
import { store } from "./store";
import { Provider } from "react-redux";
import AlertBar from "#ui/AlertBar";

const basename = import.meta.env.REACT_APP_BASENAME ?? null;

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <MuiThemeProvider theme={theme}>
          <Header />
          <AlertBar />
          <Switch>
            <Route exact path="/">
              <Redirect to="/batch-dashboard" />
            </Route>
            <Route path="/batch-dashboard" component={BatchDashboard} />
            <Route path="/no-access" component={NoAccess} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/sign-in" component={SignIn} />
            <Route render={() => <Redirect to="/404" />} />
          </Switch>
        </MuiThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
