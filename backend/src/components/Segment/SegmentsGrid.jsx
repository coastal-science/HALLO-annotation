import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog,
} from "@material-ui/core";
import { useState, useEffect, createContext, useContext, useMemo } from "react";
import Page from "../UI/Page";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import { useDispatch, useSelector } from "react-redux";
import DataGrid, { SelectColumn, TextEditor } from "react-data-grid";
import { useFocusRef } from "../../hooks/useFocusRef";
import { openAlert } from "../../reducers/errorSlice";
import Moment from "react-moment";
import {
  fetchSegments,
  handleSelect,
  removeSegments,
} from "../../reducers/segmentSlice";
import ImportSegments from "./ImportSegments";
import { fetchAnnotations } from "../../reducers/annotationSlice";
import NewSegment from "./NewSegment";
import AddToBatch from "./AddToBatch";
import AutoGenerate from "./AutoGenerate";
import AddIcon from "@material-ui/icons/Add";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import PlaylistAddOutlinedIcon from "@material-ui/icons/PlaylistAddOutlined";
import AutorenewOutlinedIcon from "@material-ui/icons/AutorenewOutlined";
import ExportButton from "../UI/ExportButton";
import { exportToCsv } from "../../utils/exportUtils";
import FilterTextField from "../UI/FilterTextField";
import { fetchBatches } from "../../reducers/batchSlice";

const openInit = {
  newSegment: false,
  import: false,
  addToBatch: false,
  autoGenerate: false,
};

const filtersInit = {
  filename: "",
  batch: "",
  label: "",
  enabled: false,
};

const FilterContext = createContext(filtersInit);

const FilterRenderer = ({ isCellSelected, column, children }) => {
  const filters = useContext(FilterContext);
  const { ref, tabIndex } = useFocusRef(isCellSelected);
  return (
    <Box mt={1}>
      <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
        {column.name}
      </Typography>
      {filters.enabled && <Box>{children({ ref, tabIndex, filters })}</Box>}
    </Box>
  );
};

const SegmentsGrid = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(openInit);
  const [filters, setFilters] = useState(filtersInit);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [deleteComfirmation, setDeleteConfirmation] = useState(false);

  const { files } = useSelector((state) => state.file);
  const { segments, segmentIds, checked, loading } = useSelector(
    (state) => state.segment
  );
  const { batches } = useSelector((state) => state.batch);

  const dispatch = useDispatch();

  const handleClose = (name) => {
    setOpen({
      ...open,
      [name]: false,
    });
  };

  const handleOpen = (e, name) => {
    setOpen({
      ...open,
      [name]: true,
    });
  };

  const handleDeleteSegments = () => {
    dispatch(removeSegments({ checked }))
      .unwrap()
      .then(() => dispatch(fetchSegments()))
      .then(() => dispatch(fetchAnnotations()))
      .then(() => dispatch(fetchBatches()))
      .then(() => setSelectedRows(() => new Set()))
      .catch((error) => console.error(error));

    setDeleteConfirmation(false);
  };

  const handleDeleteConfirmation = () => {
    if (checked.length === 0) {
      dispatch(
        openAlert({
          severity: "error",
          message: "no segments selected",
        })
      );
    } else {
      setDeleteConfirmation(true);
    }
  };

  const handleSelectRowsChange = (param) => {
    setSelectedRows(param);
    dispatch(handleSelect([...param]));
  };

  const toggleFilters = () => {
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled,
    }));
  };

  const clearFilters = () => {
    setFilters({ ...filtersInit, enabled: filters.enabled });
  };

  const columns = useMemo(() => {
    return [
      SelectColumn,
      {
        key: "filename",
        name: "File Name",
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.filename}
                onChange={(e) =>
                  setFilters({ ...filters, filename: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
        summaryFormatter({ row }) {
          return <>Total: {row.totalSegments} segments</>;
        },
      },
      { key: "start", name: "Start", width: 100 },
      { key: "end", name: "End", width: 100 },
      { key: "duration", name: "Duration", width: 100 },
      {
        key: "batchNames",
        name: "Batch",
        formatter({ row }) {
          return row.batchNames === "NA" ? (
            <Chip label="NA" />
          ) : (
            row.batchNames.split(",").map((name, index) => {
              return (
                <Chip
                  key={index}
                  color="primary"
                  label={name}
                  style={{ marginRight: 5 }}
                />
              );
            })
          );
        },
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.batch}
                onChange={(e) =>
                  setFilters({ ...filters, batch: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "label",
        name: "Tag",
        width: 100,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.label}
                onChange={(e) =>
                  setFilters({ ...filters, label: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "created_at",
        name: "Created At",
        width: 200,
        formatter({ row }) {
          return (
            <Moment date={row.created_at} format="YYYY/MM/DD-HH:MM:SS"></Moment>
          );
        },
      },
    ];
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (
        (filters.filename
          ? row.filename.toLowerCase().includes(filters.filename.toLowerCase())
          : true) &&
        (filters.batch
          ? row.batchNames.toLowerCase().includes(filters.batch.toLowerCase())
          : true) &&
        (filters.label
          ? row.label.toLowerCase().includes(filters.label.toLowerCase())
          : true)
      );
    });
  }, [rows, filters]);

  const summaryRows = useMemo(() => {
    const summaryRow = {
      totalSegments: filteredRows.length,
    };
    return [summaryRow];
  }, [filteredRows]);

  const gridElement = (
    <DataGrid
      rowKeyGetter={(row) => row.id}
      style={{ height: "75vh" }}
      rows={filteredRows}
      columns={columns}
      headerRowHeight={filters.enabled ? 100 : undefined}
      selectedRows={selectedRows}
      onSelectedRowsChange={handleSelectRowsChange}
      summaryRows={summaryRows}
      defaultColumnOptions={{
        resizable: true,
      }}
    />
  );

  useEffect(() => {
    const formatedArr = segmentIds.map((id) => {
      const segment = segments[id];
      const { file, start, end, ...rest } = segment;
      const filename = files[file].filename;
      const duration = (end * 1 - start * 1).toFixed(2);
      let batchNames = segment.batches.map(
        (batchId) => batches[batchId].batch_name
      );
      batchNames = batchNames.length > 0 ? batchNames.join(", ") : "NA";

      return { start, end, filename, duration, batchNames, ...rest };
    });

    setRows(formatedArr);
    // eslint-disable-next-line
  }, [segments]);

  return (
    <Page title="Segments">
      <Grid container spacing={2}>
        <Grid item container xs={12} wrap="nowrap">
          <Grid item container spacing={1} wrap="nowrap">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={(e) => handleOpen(e, "newSegment")}
              >
                New
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverOutlinedIcon />}
                onClick={handleDeleteConfirmation}
              >
                Delete
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadOutlinedIcon />}
                onClick={(e) => handleOpen(e, "import")}
              >
                Import
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlaylistAddOutlinedIcon />}
                onClick={(e) => handleOpen(e, "addToBatch")}
              >
                Add to Batch
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutorenewOutlinedIcon />}
                onClick={(e) => handleOpen(e, "autoGenerate")}
              >
                Auto Generate
              </Button>
            </Grid>
          </Grid>
          <Grid
            item
            container
            spacing={1}
            wrap="nowrap"
            justify="center"
            xs={5}
          >
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={toggleFilters}
              >
                Toggle Filter
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={clearFilters}
              >
                Clear Filter
              </Button>
            </Grid>
          </Grid>
          <Grid item container wrap="nowrap" justify="flex-end" xs={1}>
            <Grid item>
              <ExportButton
                onExport={() => exportToCsv(gridElement, "segments.csv")}
              >
                Export
              </ExportButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <FilterContext.Provider value={filters}>
            {loading ? <CircularProgress /> : gridElement}
          </FilterContext.Provider>
        </Grid>
      </Grid>
      <NewSegment onClose={handleClose} open={open.newSegment} />
      <AddToBatch
        onClose={handleClose}
        open={open.addToBatch}
        setSelectedRows={setSelectedRows}
      />
      <AutoGenerate onClose={handleClose} open={open.autoGenerate} />
      <ImportSegments onClose={handleClose} open={open.import} />
      <Dialog open={deleteComfirmation}>
        <DialogTitle>Deleting segments</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The annotations that associated with the segments will be removed
            too. To continue, click OK to proceed.
          </DialogContentText>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteSegments} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default SegmentsGrid;
