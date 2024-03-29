import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  CardHeader,
  Avatar,
  Select,
  Input,
  MenuItem,
  IconButton,
  Checkbox,
  ListItemText,
} from "@material-ui/core";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import BackupOutlinedIcon from "@material-ui/icons/BackupOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import {
  cancelEditAnnotation,
  clearRegion,
  deleteAnnotation,
  editAnnotation,
  fetchCurrentAnnotations,
  saveAnnotation,
  updateAnnotation,
  clearHistory,
} from "../../reducers/annotationSlice";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import convert from "convert-units";
import Moment from "react-moment";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import {
  SIS_options,
  kw_ecotype_options,
  pod_options,
  call_type_options,
  confidence_options,
} from "./annotationFields";

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: grey[800],
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: 12,
  },
  timeFreq: {
    backgroundColor: grey[200],
    borderRadius: 3,
  },
}));

const formInit = {
  id: "",
  batch: "",
  start: "",
  end: "",
  freq_max: "",
  freq_min: "",
  sound_id_species: "",
  kw_ecotype: "",
  pod: "",
  call_type: "",
  confidence_level: "",
  comments: "",
  created_at: "",
};
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Annotation = ({ annotation, newBatch, editable }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(formInit);
  const [formDataCopy, setFormDataCopy] = useState(null);
  const [species, setSpecies] = useState([]);

  const { selectedRegion, currentRegions, annotationHistory } = useSelector(
    (state) => state.annotation
  );

  const { segments } = useSelector((state) => state.segment);
  const { batches } = useSelector((state) => state.batch);

  const {
    id,
    batch,
    start,
    end,
    freq_max,
    freq_min,
    sound_id_species,
    kw_ecotype,
    pod,
    call_type,
    confidence_level,
    comments,
    created_at,
  } = formData;

  const handleChange = (e, formValue, reason, field) => {
    if (reason === "select-option") {
      const { value } = formValue;
      setFormData({
        ...formData,
        [field]: value,
      });
    }

    if (reason === "create-option") {
      setFormData({
        ...formData,
        [field]: formValue,
      });
    }
    if (reason === "clear") {
      setFormData({
        ...formData,
        [field]: "",
      });
    }
  };

  const handleFilterOptions = (options, params) => {
    const filtered = filter(options, params);

    if (params.inputValue !== "") {
      filtered.push({
        inputValue: params.inputValue,
        value: `Press Enter to add "${params.inputValue}"`,
      });
    }

    return filtered;
  };

  const handleGetOptionLabel = (option) => {
    // Value selected with enter, right from the input
    if (typeof option === "string") {
      return option;
    }
    // Add "xxx" option created dynamically
    if (option.inputValue) {
      return option.inputValue;
    }
    // Regular option
    return option.value;
  };

  const handleRenderInput = (params) => (
    <TextField variant='outlined' {...params} />
  );

  const handleSubmit = () => {
    const annotationData = {
      ...formData,
      sound_id_species: species.join("/"),
      start: (formData.start * 1).toFixed(3),
      end: (formData.end * 1).toFixed(3),
      freq_min: (formData.freq_min * 1).toFixed(3),
      freq_max: (formData.freq_max * 1).toFixed(3),
    };

    dispatch(saveAnnotation(annotationData));
  };

  const handleEdit = () => {
    setFormDataCopy({ ...formData });
    dispatch(editAnnotation(id));
  };

  const handleCancelChange = () => {
    setFormData({ ...formDataCopy });
    dispatch(cancelEditAnnotation(id));
  };

  const handleSaveChange = () => {
    const updatedFromdata = {
      ...formData,
      sound_id_species: species.join("/"),
      start: (formData.start * 1).toFixed(3),
      end: (formData.end * 1).toFixed(3),
      freq_min: (formData.freq_min * 1).toFixed(3),
      freq_max: (formData.freq_max * 1).toFixed(3),
    };
    dispatch(updateAnnotation({ id, formData: updatedFromdata }));
    setFormDataCopy(null);
    dispatch(cancelEditAnnotation(id));
  };

  const handleDelete = async () => {
    const { batch: batchId, segment: segmentId, annotator } = annotation;
    await dispatch(deleteAnnotation({ ids: [id] }));
    await dispatch(fetchCurrentAnnotations({ batchId, segmentId, annotator }));
  };

  const handleClearHistory = () => {
    dispatch(clearHistory());
    setFormData({
      ...formData,
      sound_id_species: "",
      kw_ecotype: "",
      pod: "",
      call_type: "",
      confidence_level: "",
      comments: "",
    });
    setSpecies([]);
  };

  useEffect(() => {
    setFormData(annotation);
    if (annotation.sound_id_species)
      setSpecies(annotation.sound_id_species.split("/"));
    else setSpecies([]);
  }, [annotation]);

  const handleSpeciesSelect = (e) => {
    setSpecies(e.target.value);
  };

  useEffect(() => {
    const { id, segment, batch } = annotation;
    if (selectedRegion * 1 === id) {
      const { x, y, width, height } = currentRegions[annotation.id];
      const currentSegment = segments[segment];
      const { start, end } = currentSegment;
      const duration = end - start;
      const canvasWidth = duration * 40;
      const canvasHeight = 400;
      const batchFreqMax = batches[batch].freq_max;

      const annotationStart =
        ((duration * x) / canvasWidth).toFixed(3) * 1 + start * 1;
      const annotationEnd =
        ((duration * (x + width)) / canvasWidth).toFixed(3) * 1 + start * 1;
      const freq_min =
        ((batchFreqMax * (canvasHeight - y - height)) / canvasHeight).toFixed(
          3
        ) * 1;
      const freq_max =
        ((batchFreqMax * (canvasHeight - y)) / canvasHeight).toFixed(3) * 1;

      setFormData({
        ...formData,
        start: annotationStart,
        end: annotationEnd,
        freq_max: freq_max,
        freq_min: freq_min,
      });
    }
    // eslint-disable-next-line
  }, [selectedRegion, currentRegions[annotation.id]]);

  return (
    <Grid item>
      <Card
        style={{ border: editable || newBatch ? `2px solid ${grey[900]}` : "" }}
        id={newBatch ? `annotation-new` : `annotation-${annotation.id}`}
        tabIndex='-1'
      >
        <CardHeader
          avatar={<Avatar className={classes.avatar}>{id}</Avatar>}
          action={
            !newBatch &&
            (!editable ? (
              <IconButton onClick={handleEdit}>
                <EditOutlinedIcon />
              </IconButton>
            ) : (
              <IconButton onClick={handleCancelChange}>
                <CloseOutlinedIcon />
              </IconButton>
            ))
          }
          title={batches[batch]?.batch_name}
          subheader={
            <Moment date={created_at} format='YYYY/MM/DD - hh:mm:ss'></Moment>
          }
        />
        <CardContent>
          <Grid container spacing={1}>
            <Grid
              item
              container
              xs={12}
              spacing={1}
              className={classes.timeFreq}
            >
              <Grid item xs={3}>
                <Typography variant='subtitle1'>
                  Start(s): {(start * 1).toFixed(3)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant='subtitle1'>
                  End(s): {(end * 1).toFixed(3)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant='subtitle1'>
                  Max(kHz):{" "}
                  {convert(freq_max * 1)
                    .from("Hz")
                    .to("kHz")
                    .toFixed(3)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant='subtitle1'>
                  Min(kHz):{" "}
                  {convert(freq_min * 1)
                    .from("Hz")
                    .to("kHz")
                    .toFixed(3)}
                </Typography>
              </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
              <Grid item xs={3}>
                <Typography variant='subtitle1'>SIS:</Typography>
                {editable || newBatch ? (
                  <Select
                    multiple
                    value={species}
                    onChange={handleSpeciesSelect}
                    input={<Input />}
                    renderValue={(selected) => selected.join("/")}
                    MenuProps={MenuProps}
                    fullWidth
                  >
                    {SIS_options.map((item) => (
                      <MenuItem key={item.id} value={item.value}>
                        <Checkbox checked={species.indexOf(item.value) > -1} />
                        <ListItemText primary={item.value} />
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Typography>{sound_id_species}</Typography>
                )}
              </Grid>
              <Grid item xs={3} container direction='column'>
                <Typography variant='subtitle1'>KW ecotype:</Typography>
                {editable || newBatch ? (
                  <Autocomplete
                    freeSolo
                    handleHomeEndKeys
                    options={kw_ecotype_options}
                    onChange={(e, value, reason) =>
                      handleChange(e, value, reason, "kw_ecotype")
                    }
                    value={kw_ecotype || ""}
                    filterOptions={handleFilterOptions}
                    getOptionLabel={handleGetOptionLabel}
                    renderOption={(option) => option.value}
                    renderInput={handleRenderInput}
                  />
                ) : (
                  <Typography>{kw_ecotype}</Typography>
                )}
              </Grid>
              <Grid item xs={3} container direction='column'>
                <Typography variant='subtitle1'>Call Type:</Typography>
                {editable || newBatch ? (
                  <Autocomplete
                    freeSolo
                    handleHomeEndKeys
                    options={call_type_options}
                    onChange={(e, value, reason) =>
                      handleChange(e, value, reason, "call_type")
                    }
                    value={call_type || ""}
                    filterOptions={handleFilterOptions}
                    getOptionLabel={handleGetOptionLabel}
                    renderOption={(option) => option.value}
                    renderInput={handleRenderInput}
                  />
                ) : (
                  <Typography>{call_type}</Typography>
                )}
              </Grid>
              <Grid item container xs={3} direction='column'>
                <Typography variant='subtitle1'>Pod:</Typography>
                {editable || newBatch ? (
                  <Autocomplete
                    freeSolo
                    handleHomeEndKeys
                    options={pod_options}
                    onChange={(e, value, reason) =>
                      handleChange(e, value, reason, "pod")
                    }
                    value={pod || ""}
                    filterOptions={handleFilterOptions}
                    getOptionLabel={handleGetOptionLabel}
                    renderOption={(option) => option.value}
                    renderInput={handleRenderInput}
                  />
                ) : (
                  <Typography>{pod}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
              <Grid item xs={4}>
                <Typography variant='subtitle1'>Confidence level:</Typography>
                {editable || newBatch ? (
                  <Autocomplete
                    freeSolo
                    handleHomeEndKeys
                    options={confidence_options}
                    onChange={(e, value, reason) =>
                      handleChange(e, value, reason, "confidence_level")
                    }
                    value={confidence_level || ""}
                    filterOptions={handleFilterOptions}
                    getOptionLabel={handleGetOptionLabel}
                    renderOption={(option) => option.value}
                    renderInput={handleRenderInput}
                  />
                ) : (
                  <Typography>{confidence_level}</Typography>
                )}
              </Grid>

              <Grid item xs={8} container direction='column'>
                <Typography variant='subtitle1'>Comments:</Typography>
                {editable || newBatch ? (
                  <TextField
                    variant='outlined'
                    name='comments'
                    value={comments || ""}
                    onChange={(e) =>
                      handleChange(
                        e,
                        e.target.value,
                        "create-option",
                        "comments"
                      )
                    }
                    fullWidth
                  />
                ) : (
                  <Typography>{comments}</Typography>
                )}
              </Grid>
            </Grid>

            {(editable || newBatch) && (
              <Grid item container xs={12} justify='center' spacing={1}>
                <Grid item>
                  {newBatch ? (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<BackupOutlinedIcon />}
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<BackupOutlinedIcon />}
                      onClick={handleSaveChange}
                    >
                      Save
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  {newBatch ? (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={() => dispatch(clearRegion())}
                    >
                      Clear Region
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                </Grid>
                <Grid item>
                  {annotationHistory && (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<ClearIcon />}
                      onClick={handleClearHistory}
                    >
                      Clear History
                    </Button>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

Annotation.propTypes = {
  annotation: PropTypes.object,
  newBatch: PropTypes.bool,
};

export default Annotation;
