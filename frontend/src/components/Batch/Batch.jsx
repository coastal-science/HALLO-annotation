import { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import Progress from "./Progress";
import BatchSettings from "./BatchSettings";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentBatch } from "#reducers/batchSlice";
import { cleanProgressMap, clearRegion, resetLatestTab } from "#reducers/annotationSlice";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: grey[100],
    height: 400,
    width: 270,
  },
}));

const Batch = ({ batch, highlight, handleDelete }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const { isPowerUser, loading } = useSelector((state) => state.user);

  const { batch_name, id } = batch;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (e, id) => {
    dispatch(setCurrentBatch(id));
    dispatch(clearRegion());
    dispatch(cleanProgressMap());
    dispatch(resetLatestTab());
  };

  return (
    <Grid item>
      <Card
        className={classes.card}
        style={{ backgroundColor: highlight ? grey[300] : grey[100] }}
      >
        <CardContent>
          <Typography align="center" variant="subtitle1" gutterBottom>
            {batch_name}
          </Typography>

          <Divider />
          <Box mt={1.5} display="flex" flexDirection="column" height={300}>
            {loading ? <CircularProgress /> : <Progress batchId={id} />}
            <Divider />
            <Box mt={1.5} textAlign="center">
              <Box mb={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickOpen}
                  data-cy="button-batch_settings"
                >
                  Settings
                </Button>
              </Box>
              {isPowerUser ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDelete({ id, batchname: batch_name })}
                  data-cy="button-batch_delete"
                  disabled={!!!highlight}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => handleClick(e, id)}
                  disabled={batch.segments.length === 0}
                >
                  resume annotations
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      {open && (
        <BatchSettings
          batchId={batch.id}
          open={open}
          onClose={handleClose}
          newBatch={false}
        />
      )}
    </Grid>
  );
};

export default Batch;
