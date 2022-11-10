import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useEffect, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector, useDispatch } from "react-redux";
import {
  addBatch,
  editBatch,
  fetchBatchesByIds,
} from "#reducers/batchSlice";
import axiosWithAuth from "#utils/axiosWithAuth";
import DataGrid from "react-data-grid";
import { openAlert } from "#reducers/errorSlice";
import PropTypes from "prop-types";
import { fetchUser, fetchUserList } from "#reducers/userSlice";
import Annotators from "#components/Annotation/Annotators";

const useStyles = makeStyles(() => ({
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    wdith: 1000,
    maxHeight: "100vh",
    overflow: "auto",
  },
}));

export const formInit = {
  batch_name: "",
  description: "",
  model_developer: "",
  spectrogram_type: 0,
  window_length: 0.051,
  step_size: 0.01955,
  zoom_level: 2,
  clip_extension: 0,
  color_map: 0,
  allow_change_settings: false,
  rate: 24000,
  freq_min: 0,
  freq_max: 10000,
};

const BatchSettings = ({ onClose, open, batchId, newBatch }) => {
  const classes = useStyles();
  const [form, setForm] = useState(formInit);
  const [allowEdit, setAllowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const { annotators, annotatorIds, id, isPowerUser } = useSelector(
    (state) => state.user
  );
  const { segments } = useSelector((state) => state.segment);
  const { batches, batchIds } = useSelector((state) => state.batch);
  const { files } = useSelector((state) => state.file);

  const dispatch = useDispatch();

  //set up a hashmap for handling the check status of each annotator
  const selectAnnotatorInit = {};

  annotatorIds.forEach((id) => {
    selectAnnotatorInit[id] = false;
  });

  const [selectedAnnotators, setSelectedAnnotators] =
    useState(selectAnnotatorInit);

  const segmentList = useMemo(() => {
    return batchId
      ? batches[batchId].segments.map((id) => {
          const segment = segments[id];
          const { file, ...rest } = segment;
          return {
            filename: files[file].filename,
            ...rest,
          };
        })
      : [];
  }, [batchId, batches, files, segments]);

  const handleChange = (e) => {
    const updatedValue = {
      ...form,
      [e.target.name]: e.target.value,
    };
    setForm(updatedValue);
  };

  const handleCheckbox = () => {
    setForm({ ...form, allow_change_settings: !form.allow_change_settings });
  };

  const handleSelectAnnotator = (e, id) => {
    const updatedSelectedAnnotators = { ...selectedAnnotators };
    updatedSelectedAnnotators[id] = !updatedSelectedAnnotators[id];
    setSelectedAnnotators(updatedSelectedAnnotators);
  };

  const handleSubmit = async () => {
    const settings = { ...form, model_developer: id };
    if (!form.batch_name) {
      dispatch(
        openAlert({
          severity: "error",
          message: "Batch name can not be empty",
        })
      );
    } else {
      try {
        const { data } = await dispatch(
          addBatch({ settings, selectedAnnotators, annotatorIds, annotators })
        ).unwrap();

        dispatch(fetchBatchesByIds([data.id, ...batchIds]));
        dispatch(fetchUser(id));
        dispatch(fetchUserList());
        setForm(formInit);
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSave = () => {
    const settings = { ...form };
    dispatch(
      editBatch({ settings, selectedAnnotators, annotatorIds, annotators })
    )
      .then(() => {
        axiosWithAuth.get(`/batch/image/?batch=${batchId}`).then((res) => {
          res.data.forEach((item) => {
            axiosWithAuth.delete(`/batch/image/${item.id}`);
          });
        });
      })
      .then(() => dispatch(fetchUserList()))
      .then(() => dispatch(fetchBatchesByIds(batchIds)))
      .catch((error) => console.error(error));
    setForm(formInit);
    onClose();
  };

  const fetchBatch = async (id) => {
    try {
      setLoading(true);
      const { data } = await axiosWithAuth.get(`/batch/${id}/`);
      setForm(data);
      const updatedSelectedAnnotator = {};
      data.annotators.forEach((id) => {
        updatedSelectedAnnotator[id] = true;
      });
      setSelectedAnnotators(updatedSelectedAnnotator);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!batchId) {
      return;
    }
    fetchBatch(batchId);
    // eslint-disable-next-line
  }, [batchId]);

  useEffect(() => {
    if (isPowerUser) setAllowEdit(true);
    else if (form.allow_change_settings) setAllowEdit(true);
    else setAllowEdit(false);
    // eslint-disable-next-line
  }, [form]);

  const columns = [
    { key: "filename", name: "File Name" },
    { key: "start", name: "Start", width: 100 },
    { key: "end", name: "End", width: 100 },
  ];

  return (
    <Modal
      onClose={onClose}
      aria-labelledby="batch-settings-dialog"
      open={open}
    >
      <Paper className={classes.modal}>
        {loading ? (
          <Box
            width={1000}
            height={500}
            display="flex"
            justifyContent="center"
            alignItems="center"
            className={classes.modal}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box width={1000} p={5}>
            <Grid item container spacing={2} direction="column">
              <Grid item container xs={12}>
                <Grid item xs={2}>
                  <Typography>Batch Name:</Typography>
                </Grid>
                <Grid item>
                  {allowEdit ? (
                    <TextField
                      name="batch_name"
                      value={form.batch_name}
                      variant="outlined"
                      onChange={handleChange}
                      data-cy="input-batch_name"
                    />
                  ) : (
                    <Typography variant="subtitle1">
                      {form.batch_name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item container xs={12}>
                <Grid item xs={2}>
                  <Typography>Description:</Typography>
                </Grid>
                <Grid item xs={10}>
                  {allowEdit ? (
                    <TextField
                      fullWidth
                      name="description"
                      variant="outlined"
                      value={form.description}
                      onChange={handleChange}
                      data-cy="input-batch_description"
                    />
                  ) : (
                    <Typography variant="subtitle1">
                      {form.description}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item container xs={12} spacing={4}>
                <Grid
                  item
                  container
                  xs={6}
                  direction="column"
                  justify="flex-start"
                  spacing={1}
                >
                  <Grid item container alignItems="center">
                    <Grid item xs={6}>
                      <Typography>Window length(s):</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {allowEdit ? (
                        <TextField
                          name="window_length"
                          value={form.window_length}
                          onChange={handleChange}
                          variant="outlined"
                          type="number"
                          data-cy="input-batch_window_length"
                        />
                      ) : (
                        <Typography variant="subtitle1">
                          {form.window_length}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item container alignItems="center">
                    <Grid item xs={6}>
                      <Typography>Step size(s):</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {allowEdit ? (
                        <TextField
                          variant="outlined"
                          name="step_size"
                          value={form.step_size}
                          onChange={handleChange}
                          type="number"
                          data-cy="input-batch_step_size"
                        />
                      ) : (
                        <Typography variant="subtitle1">
                          {form.step_size}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item container alignItems="center">
                    {isPowerUser && (
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              name="allow_change_settings"
                              checked={form.allow_change_settings}
                              onClick={handleCheckbox}
                            />
                          }
                          label="Allow bioacoustician to change spectrogram settings"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                <Grid
                  item
                  container
                  xs={6}
                  direction="column"
                  spacing={1}
                  justify="flex-end"
                >
                  <Grid item container alignItems="center">
                    <Grid item xs={6}>
                      <Typography>Frequency min:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {allowEdit ? (
                        <TextField
                          name="freq_min"
                          value={form.freq_min}
                          onChange={handleChange}
                          variant="outlined"
                          type="number"
                        />
                      ) : (
                        <Typography variant="subtitle1">
                          {form.freq_min}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item container alignItems="center">
                    <Grid item xs={6}>
                      <Typography>Frequency max:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {allowEdit ? (
                        <TextField
                          name="freq_max"
                          value={form.freq_max}
                          onChange={handleChange}
                          variant="outlined"
                          type="number"
                        />
                      ) : (
                        <Typography variant="subtitle1">
                          {form.freq_max}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item container alignItems="center">
                    <Grid item xs={6}>
                      <Typography>Rate:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {allowEdit ? (
                        <TextField
                          name="rate"
                          value={form.rate}
                          onChange={handleChange}
                          variant="outlined"
                          type="number"
                        />
                      ) : (
                        <Typography variant="subtitle1">{form.rate}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item container xs={12}>
                {isPowerUser && (
                  <Annotators
                    selectedAnnotators={selectedAnnotators}
                    clickHandler={handleSelectAnnotator}
                  />
                )}
                {segmentList.length > 0 && (
                  <Grid item xs={7}>
                    <DataGrid
                      style={{ height: 200 }}
                      rows={segmentList}
                      columns={columns}
                    />
                  </Grid>
                )}
              </Grid>
              {allowEdit ? (
                <Grid item container xs={12} justify="center" spacing={2}>
                  <Grid item xs={2}>
                    {newBatch ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        data-cy="button-submit"
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => onClose()}
                      data-cy="button-batch_cancel"
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid item container xs={12} justify="center" spacing={2}>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => onClose()}
                      data-cy="button-batch_ok"
                    >
                      OK
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

BatchSettings.propTypes = {
  batchId: PropTypes.number,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  newBatch: PropTypes.bool.isRequired,
};

export default BatchSettings;
