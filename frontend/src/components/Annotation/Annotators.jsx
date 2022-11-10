import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Checkbox,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  list: {
    border: `1px solid ${grey[400]}`,
    borderRadius: 5,
    width: "80%",
    backgroundColor: grey[400],
  },
  listItem: {
    backgroundColor: "white",
  },
}));

const Annotators = ({ selectedAnnotators, clickHandler }) => {
  const classes = useStyles();
  const { annotators, annotatorIds } = useSelector((state) => state.user);

  return (
    <Grid item container xs={5} direction="column" spacing={1}>
      <Grid item>
        <Typography>Assign Bioacousticians to this batch</Typography>
      </Grid>
      <Grid item>
        <List className={classes.list}>
          <ListItem role={undefined} dense className={classes.listTitle}>
            <ListItemIcon></ListItemIcon>
            <ListItemText primary={`Bioacoustician`} />
          </ListItem>
          <Divider component="li" />
          {annotatorIds.map((id) => {
            return (
              <div key={id}>
                <ListItem role={undefined} dense className={classes.listItem}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      color="primary"
                      checked={!!selectedAnnotators[id]}
                      onClick={(e) => clickHandler(e, id)}
                      className={"annotator"}
                    />
                  </ListItemIcon>
                  <ListItemText primary={annotators[id].user_name} />
                </ListItem>
                <Divider component="li" />
              </div>
            );
          })}
        </List>
      </Grid>
    </Grid>
  );
};

export default Annotators;
