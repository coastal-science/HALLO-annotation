import { useEffect, useState } from "react";
import { grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Batches from "../components/Batch/Batches";
import AnnotationPanel from "../components/Annotation/AnnotationPanel";
import { fetchUser, fetchUserList, switchTab } from "../reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../reducers/fileSlice";
import { fetchBatches } from "../reducers/batchSlice";
import { fetchSegments } from "../reducers/segmentSlice";
import { useHistory } from "react-router-dom";
import { clearRegion, fetchAnnotations } from "../reducers/annotationSlice";
import Tutorial from "../components/Tutorial/Tutorial";
import TabPanel from "../components/UI/TabPanel";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from "@material-ui/core";
import FilesGrid from "../components/File/FilesGrid";
import SegmentsGrid from "../components/Segment/SegmentsGrid";
import AnnotationsGrid from "../components/Annotation/AnnotationsGrid";

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    "aria-controls": `dashboard-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: "white",
    color: grey[900],
    borderRadius: 5,
  },
  tabs: {
    backgroundColor: grey[500],
  },
  tab: {
    backgroundColor: "white",
    marginRight: 2,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
}));

const BatchDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const { isPowerUser, tab } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const handleChange = (e, newValue) => {
    dispatch(switchTab(newValue));
    dispatch(clearRegion());
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      history.push("/sign-in");
      return;
    }
    setLoading(true);
    dispatch(fetchUser(userId))
      .unwrap()
      .then(async (res) => {
        if (res.groups.length === 0) {
          setLoading(false);
          history.push("no-access");
        } else if (
          res.groups.includes("Model Developer") ||
          res.groups.includes("Admin")
        ) {
          setInfo("Loading annotations");
          await dispatch(fetchAnnotations());
        }
      })
      .then(async () => {
        setInfo("Loading annotator list");
        await dispatch(fetchUserList());
      })
      .then(async () => {
        setInfo("Loading file list");
        await dispatch(fetchFiles());
      })
      .then(async () => {
        setInfo("Loading batches");
        await dispatch(fetchBatches());
      })
      .then(async () => {
        setInfo("Loading segments");
        await dispatch(fetchSegments());
      })
      .then(() => {
        setInfo("");
        setLoading(false);
      })
      .catch((error) => console.error(error));

    // eslint-disable-next-line
  }, []);

  return (
    <Box bgcolor={grey[500]} p={2}>
      <Box width="100%" minHeight="91vh">
        <AppBar position="static" className={classes.appBar} elevation={0}>
          <Tabs
            value={tab}
            onChange={handleChange}
            aria-label="batch dashboard tabs"
            indicatorColor={"primary"}
            className={classes.tabs}
          >
            <Tab className={classes.tab} label="batches" {...a11yProps(0)} />

            <Tab
              className={classes.tab}
              label={isPowerUser ? "files" : "Annotation panel"}
              {...a11yProps(1)}
            />

            {isPowerUser && (
              <Tab className={classes.tab} label="segments" {...a11yProps(2)} />
            )}
            {isPowerUser && (
              <Tab
                className={classes.tab}
                label="annotations"
                {...a11yProps(3)}
              />
            )}
            <Tab className={classes.tab} label="tutorial" {...a11yProps(4)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <Batches />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          {isPowerUser ? <FilesGrid /> : <AnnotationPanel />}
        </TabPanel>
        <TabPanel value={tab} index={2}>
          {isPowerUser ? <SegmentsGrid /> : <Tutorial />}
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <AnnotationsGrid />
        </TabPanel>
        {isPowerUser && (
          <TabPanel value={tab} index={4}>
            <Tutorial />
          </TabPanel>
        )}
      </Box>
      <Dialog open={loading}>
        <DialogTitle>{"Syncing database"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fetching data from the server...
          </DialogContentText>
          <DialogContentText>{info}</DialogContentText>
          <LinearProgress color="primary" />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BatchDashboard;
