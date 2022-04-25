import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Modal,
  Paper,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const FileScanResult = ({ onClose, open, filename, count, updated }) => {
  const classes = useStyles();

  return (
    <Modal onClose={() => onClose()} open={open} className={classes.modal}>
      <Paper>
        <Box width={800}>
          <Card>
            <CardHeader
              title="Syncing files with database..."
              subheader="The process may take a few minutes depending on the number of files."
            />

            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  <Typography>{count} files has been processed</Typography>
                </Grid>
                {updated !== 0 && (
                  <Grid item>
                    <Typography>{updated} files has been updated</Typography>
                  </Grid>
                )}
                <Grid item>
                  <Typography>{filename}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onClose()}
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Modal>
  );
};

export default FileScanResult;
