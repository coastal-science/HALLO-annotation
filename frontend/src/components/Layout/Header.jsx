import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { NavLink, useHistory } from "react-router-dom";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import { Avatar, Box } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { logout } from "#reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: "white",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    marginLeft: "auto",
  },
  toolbar: {
    display: "flex",
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: grey[900],
    marginLeft: theme.spacing(3),
  },
  title: {
    marginLeft: theme.spacing(1.5),
  },
}));

export const adminURL =
  process.env.REACT_APP_ADMIN_LOGIN || "http://localhost:8000/admin/";

function Header() {
  const classes = useStyles();
  const { id, username, isPowerUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogout = () => {
    dispatch(logout());
    history.push("/sign-in");
    localStorage.clear();
  };

  return (
    <>
      <CssBaseline />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        className={classes.appBar}
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography variant="h5" color="inherit" noWrap>
            <Link
              component={NavLink}
              to="/"
              underline="none"
              color="textPrimary"
            >
              HALLO
            </Link>
          </Typography>
          {id && (
            <Box display="flex" flexGrow="1" alignItems="center">
              <Avatar className={classes.avatar}>
                {username[0].toUpperCase()}
              </Avatar>
              <Typography className={classes.title} variant="subtitle1">
                {username.toUpperCase()}
              </Typography>
              <Box mx={2}>
                {isPowerUser && (
                  <Typography>
                    <Link href={adminURL} target="_blank">
                      Admin Portal
                    </Link>
                  </Typography>
                )}
              </Box>
              <Button
                color="primary"
                variant="contained"
                className={classes.link}
                onClick={handleLogout}
                data-cy="button-logout"
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Header;
