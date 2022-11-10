import { Typography, Box, CssBaseline } from "@material-ui/core";
import { useEffect } from "react";
import { fetchUser } from "#reducers/userSlice";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const NoAccess = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      history.push("/sign-in");
      return;
    }

    dispatch(fetchUser(userId))
      .unwrap()
      .then((res) => {
        const { groups } = res;
        if (groups.length !== 0) {
          history.push("batch-dashboard");
        }
      });
    // eslint-disable-next-line
  }, []);
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
