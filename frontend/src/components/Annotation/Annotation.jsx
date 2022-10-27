import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  CardHeader,
  Avatar,
  IconButton,
} from "@material-ui/core";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import BackupOutlinedIcon from "@material-ui/icons/BackupOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import {
  cancelEditAnnotation,
  deleteAnnotation,
  fetchCurrentAnnotations,
  updateAnnotation,
  clearHistory,
} from "#reducers/annotationSlice";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import convert from "convert-units";
import { DateTime } from "#ui/Date";

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

const Annotation = ({ annotation, newBatch = false, editable = true, persistField }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(formInit);
  const [formDataCopy, setFormDataCopy] = useState(null);

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

  const handleSaveChange = () => {
    const updatedFromdata = {
      ...formData,
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
  };

  useEffect(() => {
    setFormData(annotation);
  }, [annotation]);

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
        style={{ border: editable ? `2px solid ${grey[900]}` : "" }}
        id={`annotation-${annotation.id}`}
        tabIndex='-1'
      >
        <CardHeader
          avatar={<Avatar className={classes.avatar}>{id}</Avatar>}
          title={batches[batch]?.batch_name}
          subheader={
            <DateTime>{created_at}</DateTime>
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
                {editable ? (
                  <TextField
                    variant='outlined'
                    name='sound_id_species'
                    value={sound_id_species}
                    onChange={persistField}
                  />
                ) : (
                  <Typography>{sound_id_species}</Typography>
                )}
              </Grid>
              <Grid item xs={3} container direction='column'>
                <Typography variant='subtitle1'>KW ecotype:</Typography>
                {editable ? (
                  <TextField
                    variant='outlined'
                    name='kw_ecotype'
                    value={kw_ecotype}
                    onChange={persistField}
                  />
                ) : (
                  <Typography>{kw_ecotype}</Typography>
                )}
              </Grid>
              <Grid item xs={3} container direction='column'>
                <Typography variant='subtitle1'>Call Type:</Typography>
                {editable ? (
                  <TextField
                    variant='outlined'
                    name='call_type'
                    value={call_type}
                    onChange={persistField}
                  />
                ) : (
                  <Typography>{call_type}</Typography>
                )}
              </Grid>
              <Grid item container xs={3} direction='column'>
                <Typography variant='subtitle1'>Pod:</Typography>
                {editable ? (
                  <TextField
                    variant='outlined'
                    name='pod'
                    value={pod}
                    onChange={persistField}
                  />
                ) : (
                  <Typography>{pod}</Typography>
                )}
              </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
              <Grid item xs={4}>
                <Typography variant='subtitle1'>Confidence level:</Typography>
                {editable ? (
                  <TextField
                    variant='outlined'
                    value={confidence_level}
                    name='confidence_level'
                    onChange={persistField}
                    fullWidth
                  />
                ) : (
                  <Typography>{confidence_level}</Typography>
                )}
              </Grid>

              <Grid item xs={8} container direction='column'>
                <Typography variant='subtitle1'>Comments:</Typography>
                {editable ? (
                  <TextField
                    variant='outlined'
                    name='comments'
                    value={comments}
                    onChange={persistField}
                    fullWidth
                  />
                ) : (
                  <Typography>{comments}</Typography>
                )}
              </Grid>
            </Grid>

            {editable && (
              <Grid item container xs={12} justify='center' spacing={1}>
                <Grid item>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<BackupOutlinedIcon />}
                    onClick={_ => handleSaveChange}
                  >
                    Save
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant='contained'
                    color='primary'
                    startIcon={<DeleteForeverOutlinedIcon />}
                    onClick={_ => handleDelete}
                  >
                    Delete
                  </Button>
                </Grid>
                <Grid item>
                  {annotationHistory && (
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<ClearIcon />}
                      onClick={handleClearHistory}
                    >
                      Clear Form
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
