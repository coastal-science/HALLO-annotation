import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog,
} from "@material-ui/core";
import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useMemo,
} from "react";
import Page from "../UI/Page";
import SyncIcon from "@material-ui/icons/Sync";
import PlaylistAddCheckOutlined from "@material-ui/icons/PlaylistAddCheckOutlined";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@material-ui/icons/RemoveCircleOutlineOutlined";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import { useDispatch, useSelector } from "react-redux";
import { deleteFiles, fetchFiles, moveFiles } from "../../reducers/fileSlice";
import DataGrid, { SelectColumn, TextEditor } from "react-data-grid";
import { useFocusRef } from "../../hooks/useFocusRef";
import { w3cwebsocket } from "websocket";
import { openAlert } from "../../reducers/errorSlice";
import FileScanResult from "./FileScanResult";
import Moment from "react-moment";
import { selectStopPropagation } from "../../utils/dataGridUtils";
import ExportButton from "../UI/ExportButton";
import { exportToCsv } from "../../utils/exportUtils";
import FilterTextField from "../UI/FilterTextField";
import convert from "convert-units";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import FileDownloading from "./FileDownloading";
import axiosWithAuth from "../../utils/axiosWithAuth";
import fileDownload from "js-file-download";

const filtersInit = {
  filename: "",
  dirname: "",
  is_included: "All",
  deleted: "All",
  enabled: false,
};

const wssURL = process.env.REACT_APP_WSS || "ws://localhost:8000/ws/file/scan/";

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

const FilesGrid = () => {
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [filters, setFilters] = useState(filtersInit);
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [filename, setFilename] = useState("");
  const [count, setCount] = useState(0);
  const [updated, setUpdated] = useState(0);
  const [openDownloading, setOpenDownlading] = useState(false);
  const [file, setFile] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [progress, setProgress] = useState(null);
  const [scanConfirmation, setScanConfirmation] = useState(false);
  const [verifyConfirmation, setVerifyConfirmation] = useState(false);

  const dispatch = useDispatch();

  const { files, fileIds, scanning, loading } = useSelector(
    (state) => state.file
  );

  const client = useRef(null);

  const handleClose = () => {
    setOpen(false);
    setFilename("");
    setCount(0);
    setUpdated(0);
  };

  const handleRescan = () => {
    setOpen(true);
    client.current.send(
      JSON.stringify({
        message: "rescan",
      })
    );
    setScanConfirmation(false);
  };

  const handleVerify = () => {
    setOpen(true);
    client.current.send(
      JSON.stringify({
        message: "verify",
      })
    );
    setVerifyConfirmation(false);
  };

  const handleIncludeExclude = (e, type) => {
    dispatch(moveFiles({ ids: [...selectedRows], type }));
    setSelectedRows(new Set());
  };

  const handleDeleteFiles = () => {
    const ids = [...selectedRows].filter((id) => files[id].deleted);
    if (ids.length !== 0) {
      dispatch(deleteFiles({ ids })).then(() => dispatch(fetchFiles()));
    } else {
      dispatch(
        openAlert({
          severity: "error",
          message: "No files has been labeled as deleted",
          timer: 1000,
        })
      );
    }
  };

  const handleOK = () => {
    setOpenConfirmation(false);
    setOpenDownlading(true);
    axiosWithAuth
      .get(`/file/download/?path=${file.path}`, {
        responseType: "blob",
        timeout: 0,
        onDownloadProgress: (ProgressEvent) => {
          const { loaded, total } = ProgressEvent;
          const progress = (loaded / total) * 100;
          setProgress(progress.toFixed(2));
        },
      })
      .then((response) => {
        fileDownload(response.data, file.filename);
      })
      .then(() => {
        setOpenDownlading(false);
        setFile(null);
        setProgress(null);
      });
  };

  const handleDownload = (e, file) => {
    setOpenConfirmation(true);
    setFile(file);
  };

  const handleScanConfirmation = (e) => {
    setScanConfirmation(true);
  };

  const handleVerifyConfirmation = (e) => {
    setVerifyConfirmation(true);
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

  const rows = useMemo(() => {
    return fileIds.length !== 0 ? fileIds.map((id) => files[id]) : [];
  }, [fileIds, files]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return (
        (filters.filename
          ? row.filename.toLowerCase().includes(filters.filename.toLowerCase())
          : true) &&
        (filters.dirname
          ? row.dirname.toLowerCase().includes(filters.dirname.toLowerCase())
          : true) &&
        (filters.is_included !== "All"
          ? row.is_included === filters.is_included
          : true) &&
        (filters.deleted !== "All" ? row.deleted === filters.deleted : true)
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
          return <>Total: {row.totalFiles} files</>;
        },
      },
      {
        key: "dirname",
        name: "Path",
        formatter({ row }) {
          return row.dirname.slice(20);
        },
        editor: TextEditor,
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FilterTextField
                {...rest}
                value={filters.dirname}
                onChange={(e) =>
                  setFilters({ ...filters, dirname: e.target.value })
                }
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "filesize",
        name: "Size (Mb)",
        width: 150,
        formatter: ({ row }) => {
          return convert(row.filesize).from("b").to("Mb").toFixed(3);
        },
      },

      {
        key: "is_included",
        name: "included",
        width: 100,
        formatter({ row }) {
          return row.is_included ? (
            <Chip color="primary" label="Yes" />
          ) : (
            <Chip label="No" disabled />
          );
        },
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FormControl variant="outlined" {...rest}>
                <Select
                  value={filters.is_included}
                  onChange={(e) =>
                    setFilters({ ...filters, is_included: e.target.value })
                  }
                  onKeyDown={selectStopPropagation}
                >
                  <MenuItem value={"All"}>All</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            )}
          </FilterRenderer>
        ),
        summaryFormatter({ row }) {
          return <>Yes: {row.included}</>;
        },
      },
      {
        key: "deleted",
        name: "Deleted",
        width: 100,
        formatter({ row }) {
          return row.deleted ? (
            <Chip color="secondary" label="Yes" />
          ) : (
            <Chip label="No" disabled />
          );
        },
        headerRenderer: (params) => (
          <FilterRenderer {...params}>
            {({ filters, ...rest }) => (
              <FormControl variant="outlined" {...rest}>
                <Select
                  value={filters.deleted}
                  onChange={(e) =>
                    setFilters({ ...filters, deleted: e.target.value })
                  }
                >
                  <MenuItem value={"All"}>All</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            )}
          </FilterRenderer>
        ),
        summaryFormatter({ row }) {
          return <>Yes: {row.deleted}</>;
        },
      },
      {
        key: "datetime",
        name: "Created At",
        width: 200,
        formatter({ row }) {
          return (
            <Moment date={row.datetime} format="YYYY/MM/DD-HH:MM:SS"></Moment>
          );
        },
      },
      {
        key: "path",
        name: "Download",
        width: 50,
        formatter({ row }) {
          return (
            <Box textAlign={"center"}>
              <CloudDownloadOutlinedIcon
                onClick={(e) => handleDownload(e, row)}
              />
            </Box>
          );
        },
      },
    ];
  }, []);

  const summaryRows = useMemo(() => {
    const summaryRow = {
      totalFiles: filteredRows.length,
      included: filteredRows.filter((row) => row.is_included).length,
      deleted: filteredRows.filter((row) => row.deleted).length,
    };
    return [summaryRow];
  }, [filteredRows]);

  useEffect(() => {
    client.current = new w3cwebsocket(wssURL);
    client.current.onopen = () => {
      dispatch(
        openAlert({
          message: "File server connected",
          timer: 1000,
        })
      );
      setDisabled(false);
    };
    client.current.onclose = () => {
      dispatch(
        openAlert({
          message: "File server connection closed",
          timer: 1000,
        })
      );
      setDisabled(true);
    };

    return () => {
      client.current.close();
    };

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!client.current) return;
    client.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "file") {
        setFilename(message.filename);
        setCount(message.index);
      }
      if (message.type === "scan" || message.type === "verify") {
        dispatch(fetchFiles());
        setCount(message.total);
        setUpdated(message.updated);
        setFilename("");
      }
    };
    // eslint-disable-next-line
  }, [client.current]);

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
    <Page title="Files">
      <Grid container spacing={2}>
        <Grid item container xs={12} spacing={0} wrap="nowrap">
          <Grid item container spacing={1} wrap="nowrap">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SyncIcon />}
                onClick={handleScanConfirmation}
                disabled={disabled}
              >
                Scan
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlaylistAddCheckOutlined />}
                onClick={handleVerifyConfirmation}
                disabled={disabled}
              >
                Verify
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverOutlinedIcon />}
                onClick={handleDeleteFiles}
              >
                Delete
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={(e) => handleIncludeExclude(e, "include")}
              >
                Include
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RemoveCircleOutlineOutlinedIcon />}
                onClick={(e) => handleIncludeExclude(e)}
              >
                Exclude
              </Button>
            </Grid>
          </Grid>
          <Grid item container spacing={1} justify="center" xs={5}>
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
          <Grid item container justify="flex-end" xs={1}>
            <Grid item>
              <ExportButton
                onExport={() => exportToCsv(gridElement, "files.csv")}
              >
                Export
              </ExportButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <FilterContext.Provider value={filters}>
            {scanning || loading ? <CircularProgress /> : gridElement}
          </FilterContext.Provider>
        </Grid>
      </Grid>
      <FileScanResult
        onClose={handleClose}
        open={open}
        filename={filename}
        count={count}
        updated={updated}
      />
      <FileDownloading open={openDownloading} progress={progress} />
      <Dialog open={openConfirmation}>
        <DialogTitle>Downloading confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The downloading of {file?.filename} could take a while depending on
            the file size and network speed. It can not be aborted. Click OK if
            you want to proceed.
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setOpenConfirmation(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleOK} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Dialog open={scanConfirmation}>
        <DialogTitle>Scanning confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Scanning all files takes a long time and it is not necessary to
            perform this operation often. It only needs to be performed when
            there are new files are added. To continue, click OK to proceed.
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setScanConfirmation(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleRescan} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Dialog open={verifyConfirmation}>
        <DialogTitle>Verify confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Verifying all files takes a long time and it is not necessary to
            perform this operation often. This operation is only necessary if
            the file is deleted or moved to a new directory. To continue, click
            OK to proceed.
          </DialogContentText>
          <DialogActions>
            <Button
              onClick={() => setVerifyConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={handleVerify} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default FilesGrid;
