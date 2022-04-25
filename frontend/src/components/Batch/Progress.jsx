import { Box, Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import ProgressItem from "./ProgressItem";
import PropTypes from "prop-types";
import Moment from "react-moment";

const useStyles = makeStyles(() => ({
  paper: {
    height: "100%",
    padding: 10,
    overflow: "auto",
  },
}));

const Progress = ({ batchId }) => {
  const classes = useStyles();

  const { isPowerUser, id } = useSelector((state) => state.user);
  const { batches } = useSelector((state) => state.batch);

  const { annotators, segments, created_at } = batches[batchId];

  return (
    <Box height={200} mb={1.5}>
      <Paper className={classes.paper}>
        <Grid container spacing={1}>
          <Grid item>
            <Typography variant="subtitle1">
              Created at:{" "}
              <Moment date={created_at} format="YYYY/MM/DD"></Moment>
            </Typography>
          </Grid>
          {annotators.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Total segments: {segments.length}
              </Typography>
            </Grid>
          )}
          {annotators.length !== 0 && (
            <Grid item>
              <Typography variant="subtitle1">Progress:</Typography>
            </Grid>
          )}
          {isPowerUser ? (
            <Grid item container>
              {annotators.length > 0 &&
                annotators.map((userId, index) => {
                  return (
                    <ProgressItem
                      userId={userId}
                      batchId={batchId}
                      key={index}
                    />
                  );
                })}
            </Grid>
          ) : (
            <Grid item>
              <ProgressItem userId={id} batchId={batchId} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

Progress.propTypes = {
  batchId: PropTypes.number.isRequired,
};

export default Progress;
