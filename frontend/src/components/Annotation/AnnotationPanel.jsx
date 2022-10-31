import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  AppBar,
  Paper,
  Box,
  Checkbox,
  FormControlLabel,
  Switch,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, useEffect } from "react";
import BatchDetail from "#components/Batch/BatchDetail";
import { useDispatch, useSelector } from "react-redux";
import {
  addProgress,
  clearRegion,
  fetchBatchProgress,
  markAsMarked,
  markAsNotCompleted,
  setProgressLoading,
} from "#reducers/annotationSlice";
import SkipNextOutlinedIcon from "@material-ui/icons/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@material-ui/icons/SkipPreviousOutlined";
import * as Specviz from "#specviz/src/specviz-react.jsx";
import axiosWithAuth from "#utils/axiosWithAuth";
import { fetchCurrentAnnotations } from "#reducers/annotationSlice";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Paper>
          <Box p={3}>{children}</Box>
        </Paper>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
  tab: {
    padding: 0,
    margin: 1,
    minWidth: 5,
  },
  tabs: {
    padding: 0,
    margin: 0,
  },
}));

async function fetchImage(params) {
  const { data:segment } = await axiosWithAuth.get(
    `/batch/image/?batch=${params.batch_id}&segment=${params.segment_id}`
  );
  if (segment.length !== 0) return segment[0].image;
  const { data:init } = await axiosWithAuth({
    method: "get",
    url: "/hallo/image/",
    params,
  });
  const { data:image } = await axiosWithAuth.get(
    `/batch/image/?id=${init.id}`
  );
  return image[0].image;
};

async function fetchAudio(params) {
  const { data:segment } = await axiosWithAuth({
    method: "get",
    url: "/hallo/audio",
    params
  });
  const { data:result } = await axiosWithAuth.get(`/segment?id=${segment.id}`);
  return result[0].audio;
}

const spectrogramMap = new Map([
  [0, "MagSpectrogram"],
  [1, "MelSpectrogram"],
  [2, "PowerSpectrogram"],
  [3, "CQTSpectrogram"],
]);

function HalloSpectrogram({ segmentId }) {
  const { batches, currentBatch } = useSelector((state) => state.batch);
  const { files } = useSelector((state) => state.file);
  const { segments } = useSelector((state) => state.segment);
  const batch = batches[currentBatch];
  const segment = segments[segmentId];
  const filename = files[segment.file].filename;
  const filePath = files[segment.file].path;
  const [image, setImage] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetchImage({
      type: spectrogramMap.get(batch.spectrogram_type),
      window: batch.window_length,
      rate: batch.rate,
      step: batch.step_size,
      freq_min: batch.freq_min,
      freq_max: batch.freq_max,
      audio_file: filePath,
      spec_output: `/backend/media/spectrogram/${filename}_batch_${currentBatch}_segment_${segment.id}.png`,
      start: segment.start,
      end: segment.end,
      segment_id: segment.id,
      batch_id: currentBatch,
      image_url: `spectrogram/${filename}_batch_${currentBatch}_segment_${segment.id}.png`,
    })
      .then(href => { if (mounted) setImage(href); })
      .catch(console.error);
    return () => { mounted = false; };
  }, [
    spectrogramMap,
    filename,
    batch,
    segment,
    currentBatch,
    filePath
  ]);

  if (image == null) return <CircularProgress />;

  return <div className="specviz"><Specviz.Spectrogram
    height={400}
    data={image}
    duration={segment.end - segment.start}
    f_max={batch.freq_max}
    f_min={batch.freq_min}
  /></div>;
}

function HalloAudio({ segmentId }) {
  const { files } = useSelector((state) => state.file);
  const { segments } = useSelector((state) => state.segment);
  const [audio, setAudio] = useState(null);
  const segment = segments[segmentId];

  useEffect(() => {
    let mounted = true;
    fetchAudio({
      audio_file: files[segment.file].path,
      start: segment.start,
      end: segment.end,
      audio_clip_output: `/backend/media/audio_clips/${files[segment.file].filename}_segment_${segment.id}.flac`,
      segment_id: segment.id,
      audio_url: `audio_clips/${files[segment.file].filename}_segment_${segment.id}.flac`
    })
      .then(href => { if (mounted) setAudio(href); })
      .catch(console.error);
    return () => { mounted = false; };
  }, [segmentId, files[segment.file].path, files[segment.file].filename, segment.id, segment.start, segment.end]);

  if (audio == null) return <CircularProgress />;
  return <Specviz.Audio src={audio}>
    {({status, playpause, stop}) => (
      <div>
        <button onClick={playpause}>
          {status === "playing" ? "⏸" : "▶️" }
        </button>
        <button onClick={stop}>
          {"⏹"}
        </button>
      </div>
    )}
  </Specviz.Audio>;
}

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

const iso = {
  toSpecviz({ id, start, end, freq_min, freq_max, ...annotation }) {
    return {
      id,
      timeFreq: {
        startTime: Number.parseFloat(start),
        endTime: Number.parseFloat(end),
        startFreq: Number.parseFloat(freq_min),
        endFreq: Number.parseFloat(freq_max),
      },
      annotation
    };
  },
  toHallo({ id, timeFreq, annotation }) {
    return {
      ...annotation,
      id,
      start: String(timeFreq.startTime),
      end: String(timeFreq.endTime),
      freq_min: String(timeFreq.startFreq),
      freq_max: String(timeFreq.endFreq),
    };
  }
};

const AnnotationPanel = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { id } = useSelector((state) => state.user);
  const { currentBatch, batches } = useSelector((state) => state.batch);
  const { segments } = useSelector((state) => state.segment);
  const { files } = useSelector((state) => state.file);
  const {
    annotation: annotation_,
    currentAnnotations,
    currentAnnotationIds,
    progressMap,
    progressMapLoading,
    pending,
    selectedRegion: selectedRegion_,
    latestTab,
  } = useSelector((state) => state.annotation);
  const tabInit = currentBatch
    ? Math.min(...batches[currentBatch].segments)
    : 0;

  const [tab, setTab] = useState(tabInit);
  const [isCompleted, setIsCompleted] = useState(true);
  const [isMarked, setIsMarked] = useState(false);
  const [filterSwitch, setFilterSwitch] = useState(false);
  const [index, setIndex] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [indexSegment, setIndexSegment] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(false);

  const handleChange = (event, newValue) => {
    setTab(newValue);
    dispatch(clearRegion());
  };

  const handleMark = () => {
    const progressId = progressMap[tab].progressId;
    dispatch(markAsMarked({ progressId, isMarked: !isMarked }));
    setIsMarked((isMarked) => !isMarked);
  };

  const handleComplete = () => {
    const progressId = progressMap[tab].progressId;

    dispatch(markAsNotCompleted({ progressId, isCompleted: !isCompleted }));
    setIsCompleted((isCompleted) => !isCompleted);
  };

  const filterMarked = (segmentId) => {
    if (filterSwitch) {
      if (progressMap[segmentId]) {
        if (progressMap[segmentId].is_marked) return true;
      }
    } else return true;
  };

  const handleNext = () => {
    if (indexSegment[index + 1]) {
      const nextSegment = indexSegment[index + 1].segmentId;
      setTab(nextSegment);
      setIndex((index) => index + 1);
    }
  };

  const handlePrevious = () => {
    if (indexSegment[index - 1]) {
      const previousSegment = indexSegment[index - 1].segmentId;
      setTab(previousSegment);
      setIndex((index) => index - 1);
    }
  };

  useEffect(() => {
    if (!currentBatch) {
      return;
    }
    const segmentArr = batches[currentBatch].segments
      .filter(filterMarked)
      .sort((a, b) => a - b);
    setTotalSegments(segmentArr.length);
    const indexSegmentMap = {};
    segmentArr.forEach((segmentId, index) => {
      indexSegmentMap[index] = { index: index + 1, segmentId };
    });
    setIndexSegment(indexSegmentMap);
    const currentIndex = segmentArr.indexOf(tab);
    setIndex(currentIndex);

    // eslint-disable-next-line
  }, [currentBatch, filterSwitch]);

  useEffect(() => {
    dispatch(fetchBatchProgress({ batchId: currentBatch, userId: id }));

    return () => {
      dispatch(setProgressLoading());
    };
    // eslint-disable-next-line
  }, [currentBatch]);

  useEffect(() => {
    if (!currentBatch) return;

    if (progressMapLoading) return;

    if (!progressMap[tab]) {
      dispatch(
        addProgress({
          batchId: currentBatch,
          userId: id,
          segmentId: tab,
        })
      )
        .unwrap()
        .then(() => {
          setIsCompleted(true);
          setIsMarked(false);
        })
        .catch((error) => console.error(error));
    } else if (progressMap && progressMap[tab]) {
      setIsCompleted(progressMap[tab].is_completed);
      setIsMarked(progressMap[tab].is_marked);
    }

    // eslint-disable-next-line
  }, [tab, progressMapLoading]);

  useEffect(() => {
    // console.log(latestTab)
    if(latestTab) setTab(latestTab);
  },[latestTab]);

  useEffect(() => {
    dispatch(
      fetchCurrentAnnotations({
        batchId: currentBatch,
        segmentId: tab,
        annotator: id,
      })
    );
    // eslint-disable-next-line
  }, [currentBatch, tab, id]);

  if (currentBatch == null)
    return <Box>Please go back and select a batch</Box>;
  return <Specviz.Specviz>
    <Grid container spacing={1} wrap='nowrap'>
      <Grid item container xs={8} spacing={1} justify='center'>
        <Grid item xs={12} className={classes.root}>
          <AppBar position='static' color='default'>
            <Tabs
              value={tab}
              variant='scrollable'
              scrollButtons='on'
              indicatorColor='primary'
              textColor='primary'
              onChange={handleChange}
              className={classes.tabs}
            >
              {batches[currentBatch].segments
                .filter(filterMarked)
                .sort((a, b) => a - b)
                .map((id, index) => {
                  const { file, start, end } = segments[id];
                  return (
                    <Tab
                      label={`${files[file].filename} [${start} - ${end}]`}
                      key={id}
                      value={id}
                      onClick={() => setIndex(index)}
                    />
                  );
                })}
            </Tabs>
            <Toolbar>
              <IconButton color='primary' onClick={handlePrevious}>
                <SkipPreviousOutlinedIcon />
              </IconButton>
              <Typography>
                {index + 1} / {totalSegments}
              </Typography>
              <IconButton color='primary' onClick={handleNext}>
                <SkipNextOutlinedIcon />
              </IconButton>
              <Tabs
                value={tab}
                variant='scrollable'
                scrollButtons='on'
                indicatorColor='primary'
                textColor='secondary'
                onChange={handleChange}
              >
                {batches[currentBatch].segments
                  .filter(filterMarked)
                  .sort((a, b) => a - b)
                  .map((id, index) => {
                    let label = "◎";
                    if (progressMap[id]) {
                      if (progressMap[id].is_completed) label = "◉";
                      if (progressMap[id].is_marked) label = "★";
                    }
                    return (
                      <Tab
                        className={classes.tab}
                        label={label}
                        key={id}
                        value={id}
                        onClick={() => setIndex(index)}
                      />
                    );
                  })}
              </Tabs>
            </Toolbar>
          </AppBar>
          <TabPanel>
            <HalloSpectrogram segmentId={tab} />
          </TabPanel>
        </Grid>
        <Grid item xs={12} container justify='center'>
          <Card style={{ width: "100%" }}>
            <CardContent>
              <CardActions>
                <Grid
                  container
                  spacing={2}
                  alignItems='center'
                  justify='space-between'
                >
                  <Grid item container xs={5} spacing={2} alignItems='center'>
                    <Grid item container xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isMarked}
                            name='checkedA'
                            onChange={handleMark}
                          />
                        }
                        label='Marked'
                      />
                    </Grid>
                    <Grid item container xs={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isCompleted}
                            name='checkedA'
                            onChange={handleComplete}
                          />
                        }
                        label='Reviewed'
                      />
                    </Grid>
                    <Grid item container xs={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={filterSwitch}
                            name='checkedA'
                            onChange={() =>
                              setFilterSwitch((filterSwitch) => !filterSwitch)
                            }
                          />
                        }
                        label='Filter Marked'
                      />
                    </Grid>
                    <Grid item container xs={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={zoomLevel}
                            name='checkedA'
                            onChange={() =>
                              setZoomLevel((zoomLevel) => !zoomLevel)
                            }
                          />
                        }
                        label='Hover Zoom (2x)'
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    container
                    xs={7}
                    alignItems='center'
                    justify='center'
                    style={{ height: 80 }}
                  >
                    <HalloAudio segmentId={tab} />
                  </Grid>
                </Grid>
              </CardActions>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid
        item
        xs={4}
        container
        spacing={1}
        style={{
          overflowY: "scroll",
          maxHeight: "80vh",
        }}
        direction='column'
        wrap='nowrap'
      >
        <Grid item>
          <BatchDetail batch={batches[currentBatch]} />
        </Grid>
        { currentAnnotationIds.length > 0 && pending
          ? <CircularProgress />
          : <Specviz.Annotations preload={Object.values(currentAnnotations).map(iso.toSpecviz)} initState={formInit}>
            {(annotation, persistField) => (
              <Annotation
                key={"annotation" + annotation.id}
                annotation={iso.toHallo(annotation)}
                // editable={id * 1 === selectedRegion * 1}
                persistField={persistField}
              />
            )}
          </Specviz.Annotations>
        }
      </Grid>
    </Grid>
  </Specviz.Specviz>;
};

export default AnnotationPanel;
