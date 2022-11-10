import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";
import { Typography } from "@material-ui/core";
import annotationPanel from "#images/Annotation-panel.png";
import addNewAnnotation from "#images/add-new-annotation.mp4";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "80vh",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const Annotator = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab label="Introduction" {...a11yProps(0)} />
        <Tab label="Batch" {...a11yProps(1)} />
        <Tab label="Annotation" {...a11yProps(2)} />
        <Tab label="Contact" {...a11yProps(3)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Typography variant="h4" paragraph>
          Introduction
        </Typography>
        <Typography paragraph>
          <b>HALLO annotation tool</b> provides a set of tools and interfaces to
          help model developers manage audio files and annotations.
        </Typography>
        <Typography paragraph>
          When a user logs in as a annotator, the user is presented with two
          pages, <b>Batches and Annotation panel</b>. HALLO's main workflow is
          to split audio files into segments of customizable length and add them
          to one or more batches. Each batch can be assigned to one or more
          annotators for annotation. Annotator can annotate the spectrogram or
          play the audio clip.
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography variant="h4" paragraph>
          Batch Management
        </Typography>
        <Typography paragraph>
          A Batch is a collection of audio segments, created by the Model
          developer, that can be assigned to one or more annotators. In the
          Batch management interface you can browse the assigend batches.
        </Typography>
        <Typography paragraph>
          Depending on the settings of the batch, some of the parameters of the
          batch can be modified and regenerated into a new spectrogram, while
          others cannot be modified.
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography variant="h4" paragraph>
          Annotation Panel
        </Typography>
        <Typography paragraph>
          The Annotation Panel provides a user interface to help annotators
          quickly navigate through segments and related annotations.
        </Typography>
        <Typography variant="h6" paragraph>
          Annotation panel interface
        </Typography>
        <img src={annotationPanel} alt="Annotation Panel" width={1000} />
        <Typography variant="h6" paragraph>
          Add/Edit annotation
        </Typography>
        <Typography paragraph>
          Adding a new annotation, which can be created by clicking on a blank
          space on spectrogram with the mouse. The newly drawn area can be
          edited by clicking inside the area again.
        </Typography>
        <Typography paragraph>
          Editing an annotation, either by clicking on the region to activate
          it, or by clicking on the Edit button in the upper right corner of the
          annotation card. If you want to cancel the changes, click on any blank
          area on the spectrogram, or the Cancel button.
        </Typography>
        <video autoPlay loop width={1000}>
          <source src={addNewAnnotation} type="video/mp4" />
        </video>
      </TabPanel>
    </div>
  );
};

export default Annotator;
