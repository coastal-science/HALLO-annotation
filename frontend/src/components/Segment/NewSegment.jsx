import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
  IconButton,
  List,
  ListItemText,
  ListItem,
  ListItemIcon,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { useDispatch, useSelector } from "react-redux";
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
  },
  table: {
    border: `1px solid ${grey[400]}`,
    borderRadius: 5,
    width: 500,
  },
  formControl: {
    minWidth: 150,
  },
}));

const startEndInit = {
  start: 0,
  end: 0,
};

const NewSegment = ({ onClose, open }) => {
  const classes = useStyles();

  const [fileId, setFileId] = useState("");
  const [startEnd, setStartEnd] = useState(startEndInit);
  const [durations, setDurations] = useState([]);
  const [addButtonDissabled, setAddButtonDissabled] = useState(true);

  const { files, fileIds } = useSelector((state) => state.file);
  const { id } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (fileId) {
      setAddButtonDissabled(false);
    }
  }, [fileId]);

  const handleFileSelect = (e) => {
    setFileId(e.target.value);
  };

  const handleStartEndChange = (e) => {
    setStartEnd({
      ...startEnd,
      [e.target.name]: Number(e.target.value),
    });
  };

  const handleAdd = () => {
    const { start, end } = startEnd;

    if (start >= end) {
      dispatch(
        openAlert({
          severity: "error",
          message: "End time can not be less or equal to start time",
        })
      );
      return;
    }
    const newDuration = {
      file: fileId,
      ...startEnd,
    };
    setDurations([...durations, newDuration]);
    setStartEnd(startEndInit);
  };

  const handleRemove = (index) => {
    const updatedDurations = [...durations];
    updatedDurations.splice(index, 1);
    setDurations(updatedDurations);
  };

  const handleSubmit = () => {
    if (!fileId) {
      dispatch(
        openAlert({
          severity: "error",
          message: "Please select a file",
        })
      );
      return;
    }

    if (durations.length === 0) {
      dispatch(
        openAlert({
          severity: "error",
          message: "Please add at least one segment",
        })
      );
      return;
    }

    dispatch(addSegments({ durations }))
      .then(() => {
        dispatch(fetchSegmentsByCreater(id));
        setDurations([]);
        setFileId("");
        setStartEnd(startEndInit);
        onClose("newSegment");
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    setDurations([]);
    setFileId("");
    setStartEnd(startEndInit);
    onClose("newSegment");
  };

  return (
    <Modal
      onClose={() => onClose("newSegment")}
      aria-labelledby="segment-create-dialog"
      open={open}
      className={classes.modal}
    >
      <Paper>
        <Box width={500}>
          <Card>
            <CardHeader title="New Segments" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid
                  item
                  container
                  spacing={2}
                  id="select-file"
                  alignItems="center"
                >
                  <Grid item>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel id="select-a-file">Select a file</InputLabel>
                      <Select
                        labelId="select-a-file"
                        value={fileId}
                        onChange={handleFileSelect}
                        label="Select a file"
                      >
                        {fileIds
                          .filter((id) => files[id].is_included)
                          .map((id) => {
                            return (
                              <MenuItem key={id} value={id}>
                                {files[id].filename}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item container id="segments">
                  {durations.length > 0 && (
                    <Grid item xs={12} className={classes.table}>
                      <List disablePadding dense>
                        <ListItem dense divider>
                          <ListItemText primary="File" style={{ width: 200 }} />
                          <ListItemText primary="Start" />
                          <ListItemText primary="End" />
                          <ListItemIcon>Delete</ListItemIcon>
                        </ListItem>
                        {durations.map((duration, index) => {
                          return (
                            <ListItem key={index} dense>
                              <ListItemText
                                primary={files[duration.file].filename}
                                style={{ width: 200 }}
                              />
                              <ListItemText primary={duration.start} />
                              <ListItemText primary={duration.end} />
                              <ListItemIcon>
                                <ClearOutlinedIcon
                                  onClick={(index) => handleRemove(index)}
                                />
                              </ListItemIcon>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Grid>
                  )}
                </Grid>
                <Grid item container>
                  <Grid item container spacing={2} alignItems="flex-end">
                    <Grid item xs={5}>
                      <Typography gutterBottom>Start</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography gutterBottom>End</Typography>
                    </Grid>
                  </Grid>
                  <Grid item container spacing={2} alignItems="center">
                    <Grid item xs={5}>
                      <TextField
                        variant="outlined"
                        id="start"
                        name="start"
                        value={startEnd.start}
                        onChange={handleStartEndChange}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        variant="outlined"
                        name="end"
                        id="end"
                        value={startEnd.end}
                        onChange={handleStartEndChange}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        variant="contained"
                        color="primary"
                        disabled={addButtonDissabled}
                        onClick={handleAdd}
                      >
                        <AddOutlinedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item container spacing={2} justify="center">
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
        </Box>
      </Paper>
    </Modal>
  );
};

export default NewSegment;
