import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@material-ui/data-grid";
import { CSVReader } from "react-papaparse";
import { fetchSegments } from "../../reducers/segmentSlice";
import { openAlert } from "../../reducers/errorSlice";
import {
  addBatch,
  fetchBatches,
  updateBatchSegments,
} from "../../reducers/batchSlice";
import { formInit as batchDefaultSettings } from "../Batch/BatchSettings";
import axiosWithAuth from "../../utils/axiosWithAuth";
import {
  addBatchAnnotations,
  fetchAnnotations,
} from "../../reducers/annotationSlice";
import { fetchUser, fetchUserList } from "../../reducers/userSlice";
import Annotators from "./Annotators";
import { includes } from "lodash";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    minWidth: 800,
  },
}));

const columns = [
  { field: "filename", headerName: "File Name", width: 250 },
  { field: "start", headerName: "Start", width: 100 },
  { field: "end", headerName: "End", width: 100 },
  { field: "duration", headerName: "Duration", width: 120 },
  { field: "freq_min", headerName: "Freq Min", width: 120 },
  { field: "freq_max", headerName: "Freq Max", width: 120 },
  { field: "offset", headerName: "Offset", width: 120 },
  { field: "sound_id_species", headerName: "Sound id species", width: 120 },
  { field: "kw_ecotype", headerName: "KW ecotype", width: 120 },
  { field: "pod", headerName: "Pod", width: 120 },
  { field: "call_type", headerName: "Call type", width: 120 },
  { field: "comments", headerName: "Comments", width: 120 },
];

const ImportAnnotations = ({ onClose, open }) => {
  const classes = useStyles();
  const { fileNames } = useSelector((state) => state.file);
  const { id, annotators, annotatorIds } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [newBatch, setNewBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const processedData = useRef(null);
  const processedDataArr = useRef(null);
  const selectedAnnotationsArr = useRef(null);
  const selectAnnotatorInit = {};

  annotatorIds.forEach((id) => {
    selectAnnotatorInit[id] = false;
  });

  const [selectedAnnotators, setSelectedAnnotators] =
    useState(selectAnnotatorInit);

  const sortByDate = (a, b) => a.data[1] - b.data[1];

  const processData = (data) => {
    // convert the data to a hash map with the filename as the key and annotation array as the value.

    const processed = {};

    data.forEach((annotation) => {
      const [fileName] = annotation.data;
      if (!fileNames[fileName]) return;

      if (!processed[fileName]) {
        processed[fileName] = [];
        processed[fileName].push(annotation);
      } else processed[fileName].push(annotation);
    });

    //make sure the array are sorted by the start time so it would be grouped properly in segments.
    for (const key of Object.keys(processed)) {
      processed[key].sort(sortByDate);
    }

    return processed;
  };

  const handleSelectAnnotator = (e, id) => {
    const updatedSelectedAnnotators = { ...selectedAnnotators };
    updatedSelectedAnnotators[id] = !updatedSelectedAnnotators[id];
    setSelectedAnnotators(updatedSelectedAnnotators);
  };

  const handleOnDrop = (data) => {
    //removed the first line of the csv
    data.splice(0, 1);

    processedData.current = processData(data);
    processedDataArr.current = Object.values(processedData.current).flat(1);

    const importedData = [];

    for (let i = 0; i < processedDataArr.current.length; i++) {
      const dataItem = processedDataArr.current[i].data;
      const [
        filename,
        start,
        end,
        freq_min,
        freq_max,
        offset,
        sound_id_species,
        kw_ecotype,
        pod,
        call_type,
        comments,
      ] = dataItem;

      const duration = (end - start).toFixed(3);

      importedData.push({
        id: i,
        filename,
        start,
        end,
        freq_min,
        freq_max,
        offset,
        sound_id_species,
        kw_ecotype,
        pod,
        call_type,
        comments,
        duration,
      });
    }
    //data that will be rendered in the data-grid
    setData(importedData);
    if (importedData.length === 0) {
      dispatch(
        openAlert({
          severity: "error",
          message:
            "No filenames were found in the database after parsing the csv or wrong format. ",
        })
      );
    }
  };

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  const handleOnRemoveFile = (data) => {
    console.log(data);
  };

  const handleSelectMultiple = (param) => {
    const { selectionModel } = param;
    selectedAnnotationsArr.current = selectionModel.map(
      (id) => processedDataArr.current[id]
    );
  };

  const handleSubmit = async () => {
    if (
      !selectedAnnotationsArr.current ||
      selectedAnnotationsArr.current.length === 0
    ) {
      dispatch(
        openAlert({
          severity: "error",
          message: "No annotations being selected",
        })
      );
      return;
    }

    if (!newBatch) {
      dispatch(
        openAlert({
          severity: "error",
          message: "The batchname is empty",
        })
      );
      return;
    }

    if (!includes(selectedAnnotators, true)) {
      dispatch(
        openAlert({
          severity: "error",
          message: "No annotators being selected",
        })
      );
      return;
    }

    //batch settings
    const settings = {
      ...batchDefaultSettings,
      batch_name: newBatch,
      model_developer: id,
    };

    const selectedAnnotations = processData(selectedAnnotationsArr.current);

    setLoading(true);

    const batchSegments = [];

    dispatch(
      addBatch({
        settings,
        selectedAnnotators,
        annotatorIds,
        annotators,
      })
    )
      .unwrap()
      .then(async (res) => {
        const batchId = res.data.id;

        for (const [fileName, annotations] of Object.entries(
          selectedAnnotations
        )) {
          const durations = [];
          const requests = [];

          let left = 0;
          let right = 0;

          while (left < annotations.length) {
            while (
              right < annotations.length &&
              annotations[right].data[2] - annotations[left].data[1] <= 60
            ) {
              right++;
            }
            durations.push({ left, right: right - 1 });
            left = right;
          }

          durations.forEach((duration) => {
            const { left, right } = duration;
            const start =
              annotations[left].data[1] * 1 - 1 > 0
                ? annotations[left].data[1] * 1 - 1
                : 0;
            const end = annotations[right].data[2] * 1 + 1;
            const file = fileNames[fileName];

            requests.push(
              axiosWithAuth.post(`/segment/`, [
                {
                  start: start.toFixed(3) * 1,
                  end: end.toFixed(3) * 1,
                  file,
                },
              ])
            );
          });

          await Promise.all(requests).then((res) => {
            const segmentsArr = [];
            res.forEach((item) => {
              segmentsArr.push(item.data[0].id);
              batchSegments.push(item.data[0].id);
            });

            const annotationsArr = [];

            durations.forEach((item, index) => {
              for (let i = item.left; i <= item.right; i++) {
                const [
                  ,
                  start,
                  end,
                  freq_min,
                  freq_max,
                  offset,
                  sound_id_species,
                  kw_ecotype,
                  pod,
                  call_type,
                  comments,
                ] = annotations[i].data;

                for (const annotator in selectedAnnotators) {
                  if (selectedAnnotators[annotator]) {
                    annotationsArr.push({
                      segment: segmentsArr[index],
                      batch: batchId,
                      annotator,
                      start,
                      end,
                      comments,
                      pod,
                      kw_ecotype,
                      call_type,
                      freq_min,
                      freq_max,
                      offset: offset ? offset : 0,
                      sound_id_species,
                    });
                  }
                }
              }
            });
            dispatch(addBatchAnnotations(annotationsArr));
          });
        }
        dispatch(updateBatchSegments({ segments: batchSegments, batchId }));
      })
      .then(() => dispatch(fetchUser(id)))
      .then(() => dispatch(fetchBatches()))
      .then(() => dispatch(fetchUserList()))
      .then(() => dispatch(fetchSegments()))
      .then(() => dispatch(fetchAnnotations()))
      .then(() => handleCancel())
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    setData([]);
    setNewBatch("");
    setLoading(false);
    onClose("import");
    selectedAnnotationsArr.current = [];
  };

  return (
    <Modal
      onClose={() => onClose("import")}
      aria-labelledby="segment-import"
      open={open}
      className={classes.modal}
    >
      <Paper>
        <Card className={classes.card}>
          <CardHeader title="Import Annotations" />
          <CardContent>
            {loading ? (
              <Grid container justify="center">
                <CircularProgress />
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={6}>
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
                {data.length > 0 && (
                  <Grid item xs={6} container spacing={2}>
                    <Grid item xs={6}>
                      <Typography>Created a new Batch</Typography>
                      <TextField
                        value={newBatch}
                        onChange={(e) => setNewBatch(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Annotators
                      selectedAnnotators={selectedAnnotators}
                      clickHandler={handleSelectAnnotator}
                    />
                  </Grid>
                )}
                {data.length > 0 && (
                  <Grid item container xs={6} spacing={1}>
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
                <Grid item xs={12} style={{ height: 500 }}>
                  {data.length > 0 && (
                    <DataGrid
                      rows={data}
                      columns={columns}
                      checkboxSelection
                      onSelectionModelChange={handleSelectMultiple}
                    />
                  )}
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Modal>
  );
};

export default ImportAnnotations;
