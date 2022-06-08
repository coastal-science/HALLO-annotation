import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Grid, Typography, LinearProgress } from "@material-ui/core";
import { fetchProgress } from "../../reducers/batchSlice";
import { withStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import PropTypes from "prop-types";

const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 12,
    width: 150,
    borderRadius: 2,
    border: `1px solid ${grey[300]}`,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[200],
  },
  bar: {
    borderRadius: 2,
    backgroundColor: grey[600],
  },
}))(LinearProgress);

const ProgressItem = ({ userId, batchId }) => {
  const { annotators: users } = useSelector((state) => state.user);
  const { batches } = useSelector((state) => state.batch);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [value, setValue] = useState(0);
  const { segments } = batches[batchId];

  useEffect(() => {
    dispatch(fetchProgress({ batchId, userId }))
      .unwrap()
      .then(({ data }) => {
        setLoading(false);
        setCompleted(data.length);
        setValue(Math.floor((data.length * 100) / segments.length));
      });
    // eslint-disable-next-line
  }, [userId]);

  if (segments.length === 0) return <></>;
  else
    return loading ? (
      <Box>loading</Box>
    ) : (
      <Grid item>
        <Typography>{users[userId]?.user_name}</Typography>
        <BorderLinearProgress variant="determinate" value={value} />
        <Typography variant="subtitle2">
          {completed} / {segments.length} segments completed
        </Typography>
      </Grid>
    );
};

ProgressItem.propTypes = {
  userId: PropTypes.number.isRequired,
  batchId: PropTypes.number.isRequired,
};

export default ProgressItem;
