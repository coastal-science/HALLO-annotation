import { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { grey } from "@material-ui/core/colors";
import Copyright from "#components/Layout/Copyright";
import { NavLink, useHistory } from "react-router-dom";
import validate from "validate.js";
import { login } from "#reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { adminURL } from "#components/Layout/Header";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: grey[900],
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const schema = {
  email: {
    presence: { allowEmpty: false, message: "is required" },
    email: true,
    length: {
      maximum: 300,
    },
  },
  password: {
    presence: { allowEmpty: false, message: "is required" },
    length: {
      minimum: 8,
    },
  },
};

export default function SignIn() {
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });

  useEffect(() => {
    const errors = validate(formState.values, schema);

    setFormState((formState) => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {},
    }));
  }, [formState.values]);

  const handleChange = (event) => {
    event.persist();
    setFormState((formState) => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === "checkbox"
            ? event.target.checked
            : event.target.value,
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formState.isValid) {
      dispatch(
        login({
          email: formState.values.email,
          password: formState.values.password,
        })
      );
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    history.push("/batch-dashboard");
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const hasError = (field) =>
    formState.touched[field] && formState.errors[field] ? true : false;

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            helperText={hasError("email") ? formState.errors.email[0] : null}
            error={hasError("email")}
            onChange={handleChange}
            value={formState.values.email || ""}
            data-cy="input-email"
          />
          <TextField
            placeholder="Password"
            label="Password *"
            variant="outlined"
            size="medium"
            name="password"
            fullWidth
            helperText={
              hasError("password") ? formState.errors.password[0] : null
            }
            error={hasError("password")}
            onChange={handleChange}
            type="password"
            value={formState.values.password || ""}
            data-cy="input-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
            data-cy="button-submit"
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href={adminURL} variant="body2" target="_blank">
                Login to Admin Portal
              </Link>
            </Grid>
            <Grid item>
              <Link
                component={NavLink}
                to="/sign-up"
                variant="body2"
                data-cy="link-sign-up"
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
