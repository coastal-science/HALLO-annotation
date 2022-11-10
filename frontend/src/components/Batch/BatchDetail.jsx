import React, { memo } from "react";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { Date } from "#ui/Date";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: grey[100],
  },
}));

export const spectrogramMap = new Map([
  [0, "MagSpectrogram"],
  [1, "MelSpectrogram"],
  [2, "PowerSpectrogram"],
  [3, "CQTSpectrogram"],
]);

const BatchDetail = memo(({ batch }) => {
  const classes = useStyles();

  const {
    batch_name,
    description,
    created_at,
    segments,
    window_length,
    step_size,
  } = batch;

  return (
    <Card className={classes.card} elevation={1}>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h6">
              {batch_name} - {description}
            </Typography>
          </Grid>
          <Grid container item spacing={1} xs={12}>
            <Grid item>
              <Typography>Window Length: {window_length}</Typography>
            </Grid>
            <Grid item>
              <Typography>Step size: {step_size}</Typography>
            </Grid>
            <Grid item>
              <Typography>Total segments: {segments.length}</Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={1} xs={12} justify="space-between">
            <Grid item>
              <Typography variant="subtitle1">
                Created At:{" "}
                <Date>{created_at}</Date>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

BatchDetail.propTypes = {
  batch: PropTypes.object.isRequired,
};

export default BatchDetail;
