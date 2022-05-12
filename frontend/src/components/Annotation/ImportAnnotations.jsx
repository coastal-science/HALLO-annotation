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
import {
  addSegments,
  fetchSegments,
  updateSegment,
} from "../../reducers/segmentSlice";
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
  { field: "sound_id_species", headerName: "Sound id species", width: 120 },
  { field: "kw_ecotype", headerName: "KW ecotype", width: 120 },
  { field: "pod", headerName: "Pod", width: 120 },
  { field: "call_type", headerName: "Call type", width: 120 },
  { field: "comments", headerName: "Comments", width: 120 },
];

const ImportAnnotations = ({ onClose, open }) => {
  const classes = useStyles();
  const { fileNames, files } = useSelector((state) => state.file);
  const { id, annotators, annotatorIds } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [newBatch, setNewBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [segmentLength, setSegmentLength] = useState(60);
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

    dispatch(
      addBatch({
        settings,
        selectedAnnotators,
        annotatorIds,
        annotators,
      })
    )
      .unwrap()
      .then((res) => res.data.id)
      .then(async (batchId) => {
        const createdSegmentsIds = [];
        //iterate the annotations objects, the key of the object is the filename
        //and the value is the annotation array associated with the file
        for (const [fileName, annotations] of Object.entries(
          selectedAnnotations
        )) {
          //create segments for the file with the length
          const fileId = fileNames[fileName];
          const fileLength = files[fileId].duration;
          const segmentsNumber = Math.trunc(fileLength / segmentLength) + 1;

          //generate segments according to the segmentlength and file
          const generatedSegments = [];

          let i = 0;

          while (i < segmentsNumber) {
            generatedSegments.push({
              file: fileId,
              start: segmentLength * i,
              end: segmentLength * i + segmentLength * 1,
              model_developer: id,
            });
            i++;
          }
          const generatedAnnotations = [];

          await dispatch(addSegments({ durations: generatedSegments }))
            .unwrap()
            .then(async (createdSegments) => {
              //get ids from the created segments
              createdSegments.forEach((segment) =>
                createdSegmentsIds.push(segment.id)
              );

              let currentSegmentIndex = 0;

              annotations.forEach(async (annotation) => {
                const [
                  ,
                  start,
                  end,
                  freq_min,
                  freq_max,
                  sound_id_species,
                  kw_ecotype,
                  pod,
                  call_type,
                  comments,
                ] = annotation.data;

                while (currentSegmentIndex < createdSegments.length) {
                  if (+start > +createdSegments[currentSegmentIndex].end) {
                    //skip to the next segment
                    currentSegmentIndex++;
                  } else if (
                    +start >= +createdSegments[currentSegmentIndex].start &&
                    +end <= +createdSegments[currentSegmentIndex].end
                  ) {
                    //do something
                    for (const annotator in selectedAnnotators) {
                      if (selectedAnnotators[annotator]) {
                        generatedAnnotations.push({
                          segment: createdSegments[currentSegmentIndex].id,
                          batch: batchId,
                          annotator,
                          start: (+start).toFixed(3),
                          end: (+end).toFixed(3),
                          comments,
                          pod,
                          kw_ecotype,
                          call_type,
                          freq_min: (+freq_min).toFixed(3),
                          freq_max: (+freq_max).toFixed(3),
                          sound_id_species,
                        });
                      }
                    }
                    break;
                  } else if (
                    +start >= +createdSegments[currentSegmentIndex].start &&
                    +end > +createdSegments[currentSegmentIndex].end
                  ) {
                    //edge case when the end of the annotation exceeds the segment's
                    //update the segment with the annotation's end time
                    const edgeCases = [];
                    await dispatch(
                      updateSegment({
                        end: (+end).toFixed(3),
                        segmentId: createdSegments[currentSegmentIndex].id,
                      })
                    )
                      .unwrap()
                      .then((segment) => segment.id)
                      .then((segmentId) => {
                        for (const annotator in selectedAnnotators) {
                          if (selectedAnnotators[annotator]) {
                            edgeCases.push({
                              segment: segmentId,
                              batch: batchId,
                              annotator,
                              start: (+start).toFixed(3),
                              end: (+end).toFixed(3),
                              comments,
                              pod,
                              kw_ecotype,
                              call_type,
                              freq_min: (+freq_min).toFixed(3),
                              freq_max: (+freq_max).toFixed(3),
                              sound_id_species,
                            });
                          }
                        }
                      })
                      .then(() => dispatch(addBatchAnnotations(edgeCases)));
                    currentSegmentIndex++;
                    break;
                  }
                }
              });
              return generatedAnnotations;
            })
            .then((generatedAnnotations) => {
              dispatch(addBatchAnnotations(generatedAnnotations));
            });
        }
        return { createdSegmentsIds, batchId };
      })
      .then(({ createdSegmentsIds, batchId }) => {
        dispatch(
          updateBatchSegments({ segments: createdSegmentsIds, batchId })
        );
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
                    <Grid item container xs={6} spacing={1}>
                      <Grid item xs={12}>
                        <Typography>Created a new Batch</Typography>
                        <TextField
                          value={newBatch}
                          onChange={(e) => setNewBatch(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>Segment Length(s):</Typography>
                        <TextField
                          value={segmentLength}
                          onChange={(e) => setSegmentLength(e.target.value)}
                          variant="outlined"
                          type="number"
                        />
                      </Grid>
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
