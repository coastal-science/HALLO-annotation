import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  Paper,
  Typography,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  addSegmentsToBatches,
  fetchSegments,
} from "../../reducers/segmentSlice";
import DataGrid, { SelectColumn } from "react-data-grid";
import { fetchBatches } from "../../reducers/batchSlice";
import { useMemo } from "react";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const AddToBatch = ({ onClose, open, setSelectedRows }) => {
  const classes = useStyles();

  const [checkedBatches, setCheckedBatches] = useState(() => new Set());
  const dispatch = useDispatch();
  const { batches } = useSelector((state) => state.batch);
  const { checked } = useSelector((state) => state.segment);
  const { annotators, assignedbatches } = useSelector((state) => state.user);

  const handleSubmit = () => {
    const checkedBatchIds = [...checkedBatches];
    const checkedSegmentIds = checked;
    dispatch(
      addSegmentsToBatches({ checkedBatchIds, checkedSegmentIds, batches })
    )
      .then(() => dispatch(fetchSegments()))
      .then(() => dispatch(fetchBatches()));
    onClose("addToBatch");
    setSelectedRows(new Set());
    setCheckedBatches(new Set());
  };

  const handleCancel = () => {
    onClose("addToBatch");
  };

  const columns = [
    SelectColumn,
    { key: "batch_name", name: "Batch" },
    { key: "segmentsTotal", name: "Segments" },
    { key: "annotatorNames", name: "Annotators" },
  ];

  const batchList = useMemo(() => {
    return assignedbatches.length !== 0
      ? assignedbatches.map((id) => {
          const batch = batches[id];
          const { segments, annotators: users, ...rest } = batch;
          const segmentsTotal = segments.length;
          const annotatorNames = users.map(
            (user) => annotators[user].user_name
          );
          return { segmentsTotal, annotatorNames, ...rest };
        })
      : [];
  }, [annotators, assignedbatches, batches]);

  return (
    <Modal
      onClose={() => onClose("addToBatch")}
      aria-labelledby="add-to-batch-dialog"
      open={open}
      className={classes.modal}
    >
      <Paper>
        <Box width={500}>
          <Card>
            <CardHeader title="Add to batch" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Select batch name(s)</Typography>
                </Grid>
                <Grid item xs={12}>
                  <DataGrid
                    style={{ height: 350 }}
                    rowKeyGetter={(row) => row.id}
                    rows={batchList}
                    columns={columns}
                    selectedRows={checkedBatches}
                    onSelectedRowsChange={setCheckedBatches}
                  />
                </Grid>
                <Grid item></Grid>
                <Grid item container spacing={2} justify="center">
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                    >
                      Add
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Modal>
  );
};

export default AddToBatch;
