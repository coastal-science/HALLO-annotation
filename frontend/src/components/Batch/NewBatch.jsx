import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, Grid, Typography, CardActionArea } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import AddIcon from "@material-ui/icons/Add";
import BatchSettings from "./BatchSettings";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: grey[100],
    height: 400,
    width: 270,
  },
  actionArea: {
    textAlign: "center",
    height: "100%",
  },
}));

const NewBatch = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid item>
      <Card className={classes.card}>
        <CardActionArea
          className={classes.actionArea}
          onClick={handleClickOpen}
        >
          <AddIcon fontSize="large" />
          <Typography>Add New Batch</Typography>
        </CardActionArea>
      </Card>
      {open && (
        <BatchSettings open={open} onClose={handleClose} newBatch={true} />
      )}
    </Grid>
  );
};

export default NewBatch;
