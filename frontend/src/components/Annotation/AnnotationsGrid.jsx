import {
  Box,
  Button,
  Chip,
  Grid,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog,
} from "@material-ui/core";
import { useState, createContext, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import ImportAnnotations from "./ImportAnnotations";
import Page from "#ui/Page";
import { deleteAnnotation } from "#reducers/annotationSlice";
import { openAlert } from "#reducers/errorSlice";
import DataGrid, { SelectColumn, TextEditor } from "react-data-grid";
import ExportButton from "#ui/ExportButton";
import { exportToCsv } from "#utils/exportUtils";
import { useFocusRef } from "#hooks/useFocusRef";
import { DateTime } from "#ui/Date";
import FilterTextField from "#ui/FilterTextField";

const openInit = {
  import: false,
};

const filtersInit = {
  filename: "",
  batchname: "",
  sound_id_species: "",
  kw_ecotype: "",
  pod: "",
  call_type: "",
  annotator: "",
  comments: "",
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

const AnnotationsGrid = () => {
  const { annotations, annotationIds } = useSelector(
    (state) => state.annotation
  );
  const { files } = useSelector((state) => state.file);
  const { annotators } = useSelector((state) => state.user);
  const { segments } = useSelector((state) => state.segment);
  const { batches } = useSelector((state) => state.batch);
  const [filters, setFilters] = useState(filtersInit);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const [open, setOpen] = useState(openInit);

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

  const toggleFilters = () => {
    setFilters((filters) => ({
      ...filters,
      enabled: !filters.enabled,
    }));
  };

  const clearFilters = () => {
    setFilters({ ...filtersInit, enabled: filters.enabled });
  };

  const handleDeleteConfirmation = () => {
    const selectedAnnotations = [...selectedRows];

    if (!selectedAnnotations || selectedAnnotations.length === 0) {
      dispatch(
        openAlert({
          severity: "error",
          message: "no annotations being selected",
        })
      );
    } else {
      setDeleteConfirmation(true);
    }
  };

  const handleDeleteAnnotations = async () => {
    const ids = [...selectedRows];

    await dispatch(deleteAnnotation({ ids }));
    dispatch(
      openAlert({
        message: `${ids.length} annotations has been deleted`,
      })
    );

    setSelectedRows(new Set());
    setDeleteConfirmation(false);
  };

  const rows = useMemo(() => {
    return annotationIds.length !== 0
      ? annotationIds.map((id) => {
        const annotation = annotations[id];
        const { batch, annotator, segment, ...rest } = annotation;
        const filename = files[segments[segment].file].filename;
        const batchname = batches[batch].batch_name;
        const annotatorName = annotators[annotator].user_name;
        return {
          filename,
          batchname,
          annotatorName,
          ...rest,
        };
      })
      : [];
  }, [annotationIds, annotations, annotators, batches, files, segments]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (
        (filters.filename
          ? row.filename.toLowerCase().includes(filters.filename.toLowerCase())
          : true) &&
        (filters.batchname
          ? row.batchname
            .toLowerCase()
            .includes(filters.batchname.toLowerCase())
          : true) &&
        (filters.sound_id_species
          ? row.sound_id_species
            .toLowerCase()
            .includes(filters.sound_id_species.toLowerCase())
          : true) &&
        (filters.call_type
          ? row.call_type
            .toLowerCase()
            .includes(filters.call_type.toLowerCase())
          : true) &&
        (filters.kw_ecotype
          ? row.kw_ecotype
            .toLowerCase()
            .includes(filters.kw_ecotype.toLowerCase())
          : true) &&
        (filters.pod
          ? row.pod.toLowerCase().includes(filters.pod.toLowerCase())
          : true) &&
        (filters.annotator
          ? row.annotatorName
            .toLowerCase()
            .includes(filters.annotator.toLowerCase())
          : true) &&
        (filters.comments
          ? row.comments.toLowerCase().includes(filters.comments.toLowerCase())
          : true)
      );
    });
  }, [rows, filters]);

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
          return <>Total: {row.totalAnnotations} annotations</>;
        },
      },
      { key: "start", name: "Start", width: 90, editor: TextEditor },
      { key: "end", name: "End", width: 90, editor: TextEditor },
      { key: "freq_min", name: "Min Freq", width: 90, editor: TextEditor },
      { key: "freq_max", name: "Max Freq", width: 90, editor: TextEditor },
      {
        key: "sound_id_species",
        description: "Sound Id species",
        name: "SIS",
        width: 90,
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.sound_id_species}
                onChange={(e) =>
                  setFilters({ ...filters, sound_id_species: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "kw_ecotype",
        name: "KW",
        width: 90,
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.kw_ecotype}
                onChange={(e) =>
                  setFilters({ ...filters, kw_ecotype: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "pod",
        name: "Pod",
        width: 90,
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.pod}
                onChange={(e) =>
                  setFilters({ ...filters, pod: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "call_type",
        name: "Call",
        width: 90,
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.call_type}
                onChange={(e) =>
                  setFilters({ ...filters, call_type: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "batchname",
        name: "Batch",

        formatter({ row }) {
          return <Chip color="primary" label={row.batchname} />;
        },
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.batchname}
                onChange={(e) =>
                  setFilters({ ...filters, batchname: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "annotatorName",
        name: "Annotator",

        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.annotator}
                onChange={(e) =>
                  setFilters({ ...filters, annotator: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "comments",
        name: "Comments",
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.comments}
                onChange={(e) =>
                  setFilters({ ...filters, comments: e.target.value })
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
            <DateTime>{row.created_at}</DateTime>
          );
        },
      },
    ];
  }, []);

  const summaryRows = useMemo(() => {
    const summaryRow = {
      totalAnnotations: filteredRows.length,
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
      onSelectedRowsChange={setSelectedRows}
      summaryRows={summaryRows}
      defaultColumnOptions={{
        resizable: true,
      }}
    />
  );

  return (
    <Page title="Annotations">
      <Grid container spacing={2}>
        <Grid item container xs={12} wrap="nowrap">
          <Grid item container spacing={1} wrap="nowrap">
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
                startIcon={<DeleteForeverOutlinedIcon />}
                onClick={handleDeleteConfirmation}
              >
                Delete
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
          <Grid
            item
            container
            spacing={1}
            wrap="nowrap"
            justify="flex-end"
            xs={1}
          >
            <Grid item>
              <ExportButton
                onExport={() => exportToCsv(gridElement, "annotations.csv")}
              >
                Export
              </ExportButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <FilterContext.Provider value={filters}>
            {gridElement}
          </FilterContext.Provider>
        </Grid>
      </Grid>
      <ImportAnnotations onClose={handleClose} open={open.import} />
      <Dialog open={deleteConfirmation}>
        <DialogTitle>Deleting annotations</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The deleted data will be deleted in the database at the same time.
            Please make sure that you have exported the required data. To
            continue, click OK to proceed.
          </DialogContentText>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteAnnotations} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default AnnotationsGrid;
