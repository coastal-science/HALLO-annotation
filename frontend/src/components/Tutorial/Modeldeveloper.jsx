import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";
import { Typography } from "@material-ui/core";
import batchSetting from ".././../images/Batch-Settings.png";
import developerWorkFlow from ".././../images/developer-work-flow.png";
import addNewSegments from ".././../images/add-new-segments.mp4";
import autoGenerateSegments from ".././../images/auto-generate-segments.mp4";

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

const Modeldeveloper = () => {
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
        <Tab label="File" {...a11yProps(2)} />
        <Tab label="Segment" {...a11yProps(3)} />
        <Tab label="Annotation" {...a11yProps(4)} />
        <Tab label="Contact" {...a11yProps(5)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Typography variant="h4" paragraph>
          Introduction
        </Typography>
        <Typography paragraph>
          <b>HALLO annotation tool (HAT)</b> provides a set of tools and
          interfaces to help model developers manage audio files and
          annotations.
        </Typography>
        <Typography paragraph>
          When a user logs in as a model developer, the user is presented with
          four subpages, <b>Batches, Files, Segments and Annotations</b>.
          HALLO's main workflow is to split audio files into segments of
          customizable length and add them to one or more batches. Each batch
          can be assigned to one or more annotators for annotation, and the
          results of the annotations can be exported through the{" "}
          <b>Annotations</b> page.
        </Typography>
        <Typography paragraph>
          <b>HAT</b> also supports importing annotations generated by machine
          learning and automatically generating corresponding segments and
          batches, which are assigned to annotators for review.
        </Typography>
        <Typography variant="h6" paragraph>
          User Interface for Model Developer
        </Typography>
        <img src={developerWorkFlow} alt="developer work flow" width={800} />
        <Typography variant="h6" paragraph>
          Architecture of the software
        </Typography>
        <Typography paragraph>
          The main structure of the software is composed of a web interface on
          the front-end and a database management module on the back-end.
        </Typography>
        <Typography paragraph>
          After the user logs in, the front-end will read the data from the
          back-end database and synchronize it locally. The data generated
          locally, such as batch, segment, etc., will also be synchronized and
          saved in the database. In addition, every time the user manually
          refreshes the page, it will trigger data synchronization.
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography variant="h4" paragraph>
          Batch Management
        </Typography>
        <Typography paragraph>
          A Batch is a collection of audio segments, created by the Model
          developer, that can be assigned to one or more annotators. In the
          Batch management interface you can browse all currently created Bathes
          (by all the developers) , and a Batch can only be deleted by its
          owner.
        </Typography>
        <Typography paragraph>
          Deleting a Batch does not delete the segments it contains, but it does{" "}
          <b>delete</b> the Annotations created based on the Batch. Make sure
          you have exported the needed annotations before deleting the Batch.
        </Typography>
        <Typography variant="h6" paragraph>
          Batch Settings interface
        </Typography>
        <img src={batchSetting} alt="batch setting" width={1000} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography variant="h4" paragraph>
          File Management
        </Typography>
        <Typography paragraph>
          When the audio files on the server are changed, the model developer
          (administrator) needs to perform the synchronization manually in order
          to ensure that the file information stored in the database and the
          files on the server are kept in sync. The File Management page
          provides the ability to <b>scan</b>, <b>verify</b> and <b>delete</b>{" "}
          data entries in the database.
        </Typography>

        <Typography paragraph variant="h6">
          Scan
        </Typography>
        <Typography paragraph>
          The scan function <b>traverses all files</b> on the server,
          synchronizes the information of newly added files to the database, and
          if a file is moved to a new location, the corresponding entry in the
          database will be updated with the new path. Note that the scan
          function does not handle files that have been deleted. If there is a
          situation where a file has been removed from the server, you need to
          perform the Verify operation.
        </Typography>

        <Typography paragraph variant="h6">
          Verify
        </Typography>
        <Typography paragraph>
          The verify function <b>iterates all file entries</b> in the database,
          scanning for files that have been deleted. If a deleted file is found,
          it will be marked as deleted in the database. This is to ensure that
          annotations and segments associated with this file will not be
          deleted.
        </Typography>
        <Typography paragraph>
          <b>
            In a nutshell, each time when audio files on the server change, two
            steps, Scan and Verify, can be performed to ensure the state of the
            database is synchronized.
          </b>
        </Typography>
        <Typography paragraph variant="h6">
          Delete
        </Typography>
        <Typography paragraph>
          The delete function will delete the selected file information from the
          database. Deleting file information will delete all segments and
          annotations associated with it, so please ensure that the information
          has been exported before performing the operation.
        </Typography>
        <Typography paragraph variant="h6">
          Include and Exclude
        </Typography>
        <Typography paragraph>
          <b>
            The user needs to mark the files that will be processed as Included
          </b>{" "}
          in order to work on them in the following Segments page. on the
          Segments page, only the included files will be shown in the drop-down
          option for creating segments.
        </Typography>
        <Typography paragraph variant="h6">
          Filters
        </Typography>
        <Typography paragraph>
          A set of filtering options is provided, which can be used alone or in
          combination to conveniently filter the files that the user needs to
          process.
        </Typography>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Typography variant="h4" paragraph>
          Segment Management
        </Typography>
        <Typography paragraph>
          Segment management page provides a set of tools for creating new
          segments, adding segments to a batch, importing, filtering and
          deleting.
        </Typography>
        <Typography paragraph variant="h6">
          Create new segments
        </Typography>
        <Typography paragraph>
          Segments can be created manually. The <b>NEW</b> option in the toolbar
          opens a pop-up window for creating Segments. The file drop-down menu
          contains all files marked as included. After selecting the file,
          manually enter the start and end time and click the <b>+</b> button to
          add the generated segment to the list of pending submissions.
        </Typography>
        <video autoPlay loop width={800}>
          <source src={addNewSegments} type="video/mp4" />
        </video>
        <Typography paragraph variant="h6">
          Import Segments
        </Typography>
        <Typography paragraph>
          The import function imports a csv containing segments into the
          database. The csv should contain
          <b> filename, start, end and tag</b> fields (tag is optional). During
          the import process, the program checks if each filename has a
          corresponding item in the database, and segments associated with
          filenames that are not retrieved from the database would not be
          imported. When importing, it also supports adding padding to each
          segment, sometimes the length of the segment is too short for
          annotation, so you can use the padding function to extend the segment
          to a suitable length.
        </Typography>
        <Typography paragraph variant="h6">
          Generate segments
        </Typography>
        <Typography paragraph>
          The auto-generate segments feature can be used to quickly generate
          segments in bulk by selecting the files to be processed, entering the
          parameters, and clicking <b>GENERATE</b> to get a list of the
          generated segments. If you need to modify the corresponding parameters
          or change the selected files, click <b>GENERATE</b> again and the list
          will be refreshed. Finally, click <b>SUBMIT</b> to submit the data and
          save it to the database.
        </Typography>
        <video autoPlay loop width={800}>
          <source src={autoGenerateSegments} type="video/mp4" />
        </video>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Typography variant="h4" paragraph>
          Annotation Management
        </Typography>
        <Typography paragraph>
          The Annotation Management pane provides the ability to import, export
          and delete annotations.
        </Typography>
        <Typography paragraph>
          Imported csv needs to have columns in the following order:{" "}
          <b>
            filename, start, end, freq_min, freq_max, sound_id_species,
            kw_ecotype, pod, call_type, and comments.
          </b>
        </Typography>
        <Typography paragraph></Typography>
        <Typography paragraph></Typography>
        <Typography paragraph></Typography>
      </TabPanel>
      <TabPanel value={value} index={5}>
        <Typography variant="h4" paragraph>
          Contact
        </Typography>
        <Typography paragraph>
          If you encounter any problems or have any ideas and suggestions,
          please feel free to contact us.
        </Typography>
        <Typography paragraph>yue.su@dal.ca</Typography>
        <Typography paragraph></Typography>
        <Typography paragraph></Typography>
        <Typography paragraph></Typography>
      </TabPanel>
    </div>
  );
};

export default Modeldeveloper;
