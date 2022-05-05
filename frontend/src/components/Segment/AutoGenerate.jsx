import { useState, useMemo } from "react";
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
  Checkbox,
  Button,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import DataGrid, { SelectColumn } from "react-data-grid";
import { addSegments, fetchSegments } from "../../reducers/segmentSlice";
import { openAlert } from "../../reducers/errorSlice";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto",
  },
  formControl: {
    minWidth: 150,
  },
}));

const AutoGenerate = ({ onClose, open }) => {
  const classes = useStyles();
  const [selectedFileIds, setSelectedFileIds] = useState(() => new Set());
  const [length, setLength] = useState(60);
  const [step, setStep] = useState(60);
  const [label, setLabel] = useState("");
  const [pad, setPad] = useState(false);
  const [segments, setSegments] = useState([]);
  const [durations, setDurations] = useState([]);

  const { files, fileIds } = useSelector((state) => state.file);
  const { id: model_developer } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const segmentColumns = useMemo(() => {
    return [
      { key: "filename", name: "File Name" },
      { key: "start", name: "Start", width: 100 },
      { key: "end", name: "End", width: 100 },
      { key: "duration", name: "Duration", width: 100 },
      { key: "label", name: "Tag" },
    ];
  }, []);

  const fileColumns = [
    SelectColumn,
    { key: "filename", name: "File" },
    { key: "duration", name: "Duration" },
    { key: "dirname", name: "Path" },
  ];

  const fileList = useMemo(() => {
    return fileIds.length !== 0
      ? fileIds
          .filter((id) => files[id].is_included)
          .map((id) => {
            const { filename, duration, dirname } = files[id];
            return { id, filename, duration, dirname };
          })
      : [];
  }, [fileIds, files]);

  const handleGenerate = () => {
    if ([...selectedFileIds].length === 0) {
      dispatch(
        openAlert({
          severity: "error",
          message: "Please select at least one file",
        })
      );
    }

    const generatedArr = [];
    const generatedDurations = [];
    let index = 0;

    [...selectedFileIds].forEach((selectedFileId) => {
      const filename = files[selectedFileId].filename;
      const fileDuration = files[selectedFileId].duration;

      let segmentsNumber = Math.trunc(fileDuration / length);
      if (step !== length) segmentsNumber = Math.trunc(fileDuration / step);
      let i = 0;

      while (i < segmentsNumber && i * step < fileDuration) {
        generatedArr.push({
          id: index++,
          filename,
          start: step * i,
          end: step * i + length * 1,
          duration: length * 1,
          label,
        });
        generatedDurations.push({
          file: selectedFileId,
          start: step * i,
          end: step * i + length * 1,
          label,
          model_developer,
        });
        i++;
      }
      if (pad) {
        generatedArr.push({
          id: index++,
          filename,
          start: step * segmentsNumber,
          end: step * segmentsNumber + length,
          duration: length * 1,
          label,
        });
        generatedDurations.push({
          file: selectedFileId,
          start: step * segmentsNumber,
          end: step * segmentsNumber + length,
          label,
          model_developer,
        });
      }
    });

    setSegments(generatedArr);
    setDurations(generatedDurations);
  };

  const handleSubmit = () => {
    if (durations.length > 0) {
      dispatch(addSegments({ durations })).then(() =>
        dispatch(fetchSegments())
      );
      setDurations([]);
      onClose("autoGenerate");
      setSelectedFileIds(new Set());
      setLength(60);
      setStep(60);
      setPad(false);
      setSegments([]);
      setLabel("");
    }
  };

  const handleCancel = () => {
    setSegments([]);
    setDurations([]);
    setSelectedFileIds(new Set());
    setLabel("");
    setLength(60);
    setStep(60);
    setPad(false);
    onClose("autoGenerate");
  };

  return (
    <Modal
      onClose={() => onClose("autoGenerate")}
      aria-labelledby="segment-auto-generate-dialog"
      open={open}
      className={classes.modal}
    >
      <Paper style={{ width: 900 }}>
        <Card>
          <CardHeader title="Generate segments" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DataGrid
                  style={{ height: 200 }}
                  rows={fileList}
                  columns={fileColumns}
                  rowKeyGetter={(row) => row.id}
                  selectedRows={selectedFileIds}
                  onSelectedRowsChange={setSelectedFileIds}
                />
              </Grid>
              <Grid item xs={12} container spacing={2}>
                <Grid item xs={3} container>
                  <Grid item xs={4}>
                    <Typography>Length:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      variant="outlined"
                      type="number"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={3} container>
                  <Grid item xs={4}>
                    <Typography>Step:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      variant="outlined"
                      type="number"
                      value={step}
                      onChange={(e) => setStep(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={2} container alignItems="flex-start">
                  <Grid item xs={6}>
                    <Typography>Pad:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Checkbox
                      checked={pad}
                      onChange={() => setPad((pad) => !pad)}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={3} container>
                  <Grid item xs={4}>
                    <Typography>Tag:</Typography>
                    <Typography variant="caption">(optional)</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      variant="outlined"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {segments.length > 0 && (
                <Grid item xs={12}>
                  <DataGrid
                    rows={segments}
                    columns={segmentColumns}
                    style={{ height: 200 }}
                  />
                </Grid>
              )}
              <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption">
                    * If you are add or change the tag, make sure to click
                    generate button again to refresh the data.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption">
                    * It only shows the files that are labeled as included.
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container xs={12} spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerate}
                  >
                    Generate
                  </Button>
                </Grid>
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
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Modal>
  );
};

export default AutoGenerate;
