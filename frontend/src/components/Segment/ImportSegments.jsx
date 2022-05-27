import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  Paper,
  Typography,
  Button,
  TextField,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import DataGrid from "react-data-grid";
import { CSVReader } from "react-papaparse";
import {
  addSegments,
  fetchSegmentsByCreater,
} from "../../reducers/segmentSlice";
import { openAlert } from "../../reducers/errorSlice";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: "100vh",
    overflow: "auto",
  },
}));

const ImportSegments = ({ onClose, open }) => {
  const classes = useStyles();
  const { fileNames } = useSelector((state) => state.file);
  const { id } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [segments, setSegments] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [padding, setPadding] = useState(0);

  const originalImported = useRef(null);

  const handleOnDrop = (data) => {
    const submitData = [];
    const errorData = [];

    for (let i = 1; i < data.length; i++) {
      const dataItem = data[i].data;
      const file = fileNames[dataItem[0]];
      const filename = dataItem[0];
      const start = (dataItem[1] * 1).toFixed(3);
      const end = (dataItem[2] * 1).toFixed(3);
      const label = dataItem[3];
      const duration = (dataItem[2] - dataItem[1]).toFixed(3);

      if (fileNames[dataItem[0]]) {
        submitData.push({
          id: i,
          file,
          filename,
          start,
          end,
          label,
          duration,
        });
      } else {
        errorData.push(filename);
      }
    }
    setSegments(submitData);
    setErrorList(errorData);
    originalImported.current = submitData;
  };

  useEffect(() => {
    if (errorList.length === 0) return;

    dispatch(
      openAlert({
        severity: "error",
        message:
          "The entries that could not be imported are as follows: " +
          `"${errorList.join(", ")}"`,
        timer: 30000,
      })
    );
  }, [errorList, dispatch]);

  const applyPadding = () => {
    const updatedSegments = originalImported.current.map((segment) => {
      const { start, end } = segment;
      const updatedStart =
        start * 1 - padding * 1 <= 0 ? 0 : start * 1 - padding * 1;
      const updatedEnd = end * 1 + padding * 1;
      const duration = (updatedEnd - updatedStart).toFixed(3);
      return {
        ...segment,
        start: updatedStart.toFixed(3),
        end: updatedEnd.toFixed(3),
        duration,
      };
    });

    setSegments(updatedSegments);
  };

  const resetPadding = () => {
    setSegments(originalImported.current);
    setPadding(0);
  };

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  const handleOnRemoveFile = (data) => {
    setSegments([]);
    setErrorList([]);
    setPadding(0);
  };

  const handleSubmit = () => {
    dispatch(addSegments({ durations: segments })).then(() => {
      dispatch(fetchSegmentsByCreater(id));
      setSegments([]);
      onClose("import");
      setErrorList([]);
      setPadding(0);
    });
  };

  const handleCancel = () => {
    setSegments([]);
    onClose("import");
    setErrorList([]);
    setPadding(0);
  };

  const columns = [
    { key: "filename", name: "File Name" },
    { key: "start", name: "Start", width: 100 },
    { key: "end", name: "End", width: 100 },
    { key: "duration", name: "Duration", width: 150 },
    { key: "label", name: "Tag" },
  ];

  return (
    <Modal
      onClose={() => onClose("import")}
      aria-labelledby="segment-import"
      open={open}
      className={classes.modal}
    >
      <Paper>
        <Card>
          <CardHeader title="Import segments" />
          <CardContent>
            <Grid container spacing={2} justify="center">
              <Grid item xs={8}>
                <CSVReader
                  onDrop={handleOnDrop}
                  onError={handleOnError}
                  addRemoveButton
                  onRemoveFile={handleOnRemoveFile}
                >
                  <Typography>
                    Drop CSV file here or click to upload.
                  </Typography>
                </CSVReader>
              </Grid>
              {segments.length > 0 && (
                <Grid
                  item
                  container
                  xs={4}
                  spacing={1}
                  alignItems="center"
                  justify="center"
                >
                  <Grid item container xs={12}>
                    <Grid item xs={3}>
                      <Typography>Padding(s):</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        type="number"
                        variant="outlined"
                        value={padding}
                        onChange={(e) => setPadding(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption">
                      * Extending the segments both at the start and end.
                    </Typography>
                  </Grid>
                  <Grid item container xs={12} spacing={1}>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={applyPadding}
                      >
                        Apply
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={resetPadding}
                      >
                        Reset
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid item xs={12}>
                {segments.length > 0 && (
                  <DataGrid
                    rows={segments}
                    columns={columns}
                    style={{ height: 300 }}
                  />
                )}
              </Grid>
              {segments.length > 0 && (
                <Grid item container xs={12} spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                    >
                      Submit
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
              )}
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Modal>
  );
};

export default ImportSegments;
