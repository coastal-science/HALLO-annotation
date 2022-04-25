import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Box,
  Typography,
} from "@material-ui/core";

const FileDownloading = ({ open, progress }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Downloading {}..</DialogTitle>
      {progress ? (
        <DialogContent>
          <DialogContentText>
            Downloading in progress. Please keep the browser open and refresh
            the page if you want to abort it.
          </DialogContentText>
          <LinearProgressWithLabel value={progress} />
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogContentText>
            Preparing the downloading process..
          </DialogContentText>
          <LinearProgress />
        </DialogContent>
      )}
    </Dialog>
  );
};

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default FileDownloading;
