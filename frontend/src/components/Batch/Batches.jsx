import {
  CircularProgress,
  Dialog,
  Grid,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@material-ui/core";
import Batch from "./Batch";
import BatchSettings from "./BatchSettings";
import { useSelector, useDispatch } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../UI/ErrorFallback";
import Page from "../UI/Page";
import { useState } from "react";
import { deleteBatch, fetchBatches } from "../../reducers/batchSlice";
import { fetchUser, fetchUserList } from "../../reducers/userSlice";
import { fetchSegments } from "../../reducers/segmentSlice";
import { fetchAnnotations } from "../../reducers/annotationSlice";
import AddIcon from "@material-ui/icons/Add";

const Batches = () => {
  const { batches, batchLoading, batchIds } = useSelector(
    (state) => state.batch
  );
  const { isPowerUser, assignedbatches, id } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [batchname, setBatchname] = useState("");
  const [batchId, setBatchId] = useState("");
  const [openBatchSetting, setOpenBatchSetting] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setBatchname("");
    setBatchId("");
  };

  const handleDelete = ({ id, batchname }) => {
    setBatchId(id);
    setBatchname(batchname);
    setOpen(true);
  };

  const handleOK = () => {
    dispatch(deleteBatch(batchId))
      .then(() => dispatch(fetchUser(id)))
      .then(() => dispatch(fetchUserList()))
      .then(() => dispatch(fetchBatches()))
      .then(() => dispatch(fetchSegments()))
      .then(() => dispatch(fetchAnnotations()));
    setOpen(false);
  };

  return (
    <Page>
      {batchLoading ? (
        <CircularProgress />
      ) : (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Grid container spacing={2}>
            {isPowerUser && (
              <Grid item container xs={12}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenBatchSetting(true)}
                  >
                    New Batch
                  </Button>
                </Grid>
              </Grid>
            )}
            <Grid
              item
              container
              spacing={3}
              style={{ height: "70vh", overflowY: "auto" }}
            >
              {isPowerUser
                ? batchIds
                    .filter(
                      (batchId) => batches[batchId].model_developer === id
                    )
                    .reverse()
                    .map((batchId) => {
                      return (
                        <Batch
                          key={batchId}
                          batch={batches[batchId]}
                          highlight={true}
                          handleDelete={handleDelete}
                        />
                      );
                    })
                : assignedbatches.map((batchId) => {
                    return <Batch key={batchId} batch={batches[batchId]} />;
                  })}
              {isPowerUser &&
                batchIds
                  .filter((batchId) => batches[batchId].model_developer !== id)
                  .reverse()
                  .map((batchId) => {
                    return <Batch key={batchId} batch={batches[batchId]} />;
                  })}
            </Grid>
          </Grid>
          {openBatchSetting && (
            <BatchSettings
              open={openBatchSetting}
              onClose={() => setOpenBatchSetting(false)}
              newBatch={true}
            />
          )}
          <Dialog open={open}>
            <DialogTitle>Deleting {batchname}..</DialogTitle>
            <DialogContent>
              <DialogContentText>
                The annotations that linked to this batch will be deleted too
                and can not be recovered. Please click OK if you want to
                proceed.
              </DialogContentText>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleOK} color="primary" autoFocus>
                  Ok
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>
      )}
    </Page>
  );
};

export default Batches;
