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
import React, { useState, useRef, useEffect } from "react";
import BatchDetail from "../Batch/BatchDetail";
import Spectrogram from "./Spectrogram";
import Annotation from "./Annotation";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addProgress,
  clearRegion,
  fetchBatchProgress,
  markAsMarked,
  markAsNotCompleted,
  setProgressLoading,
} from "../../reducers/annotationSlice";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../UI/ErrorFallback";
import SkipNextOutlinedIcon from "@material-ui/icons/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@material-ui/icons/SkipPreviousOutlined";

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

const AnnotationPanel = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const { id } = useSelector((state) => state.user);
  const { currentBatch, batches } = useSelector((state) => state.batch);
  const { segments } = useSelector((state) => state.segment);
  const { files } = useSelector((state) => state.file);
  const {
    annotation,
    currentAnnotations,
    currentAnnotationIds,
    progressMap,
    progressMapLoading,
    pending,
    selectedRegion,
    latestTab,
  } = useSelector((state) => state.annotation);

  const tabInit = currentBatch
    ? Math.min(...batches[currentBatch].segments)
    : 0;

  const [tab, setTab] = useState(tabInit);
  const [currentTime, setCurrentTime] = useState(0);
  const [audio, setAudio] = useState(null);
  const [isCompleted, setIsCompleted] = useState(true);
  const [isMarked, setIsMarked] = useState(false);
  const [filterSwitch, setFilterSwitch] = useState(false);
  const audioRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [indexSegment, setIndexSegment] = useState(null);
  const [timer, setTimer] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(false);
  const [audioError, setAudioError] = useState(false);

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

  const handleStopTimer = () => {
    clearInterval(timer);
  };

  const handleStartTimer = () => {
    if (!audioRef.current) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentTime(audioRef.current.audio.current.currentTime);
    }, 100);
    setTimer(interval);
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
    if (currentBatch) {
      const { audio } = segments[tab];
      setAudio(audio);
      setCurrentTime(0);
    }
    // eslint-disable-next-line
  }, [tab]);

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
    if(latestTab) setTab(latestTab)
  },[latestTab])

  return !!currentBatch ? (
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

          {batches[currentBatch].segments
            .filter(filterMarked)
            .map((segmentId) => {
              return (
                <TabPanel value={tab} key={segmentId} index={segmentId}>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Spectrogram
                      segmentId={segmentId}
                      currentTime={currentTime}
                      setAudio={setAudio}
                      zoomLevel={zoomLevel}
                      audioError={audioError}
                      setAudioError={setAudioError}
              
                    />
                  </ErrorBoundary>
                </TabPanel>
              );
            })}
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
                    {audio && !audioError ? (
                      <AudioPlayer
                        src={audio}
                        ref={audioRef}
                        layout='horizontal'
                        autoPlayAfterSrcChange={false}
                        onPlay={handleStartTimer}
                        onPause={handleStopTimer}
                        onEnded={handleStopTimer}
                        onError={(e) => setAudioError(true)}
                      />
                    ) : (
                      <CircularProgress />
                    )}
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
        {currentAnnotationIds.length > 0 && pending ? (
          <CircularProgress />
        ) : (
          currentAnnotationIds.map((id) => {
            return (
              <Annotation
                key={"annotation" + id}
                annotation={currentAnnotations[id]}
                newBatch={false}
                editable={id * 1 === selectedRegion * 1}
              />
            );
          })
        )}
        {annotation && (
          <Annotation
            annotation={annotation}
            newBatch={true}
          />
        )}
      </Grid>
    </Grid>
  ) : (
    <Box>Please go back and select a bach</Box>
  );
};

export default AnnotationPanel;
