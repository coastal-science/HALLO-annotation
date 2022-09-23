import React, { useEffect, useState, useRef } from "react";
import { Box, CircularProgress } from "@material-ui/core";
import { Stage, Layer, Line, Text } from "react-konva";
import FreqAxis from "./FreqAxis";
import TimeAxis from "./TimeAxis";
import Region from "./Region";
import axiosWithAuth from "../../utils/axiosWithAuth";
import { useDispatch, useSelector } from "react-redux";
import { fetchAudio } from "../../reducers/segmentSlice";
import {
  cancelEditAnnotation,
  convertAnnotationsToRegions,
  convertRegionToAnnotation,
  currentRegionChange,
  editAnnotation,
  mouseDown,
  mouseMove,
  mouseUp,
  regionChange,
} from "../../reducers/annotationSlice";
import {
  getImageAudioSettings,
  getRelativePointerPosition,
  regionToAnnotation,
} from "../../utils/annotationUtils";
import { fetchCurrentAnnotations } from "../../reducers/annotationSlice";
import ImageLayer from "./ImageLayer";
import { openAlert } from "../../reducers/errorSlice";

const Spectrogram = ({
  segmentId,
  currentTime,
  setAudio,
  zoomLevel,
  audioError,
  setAudioError,
}) => {
  const dispatch = useDispatch();

  const { id: userId } = useSelector((state) => state.user);
  const { batches, currentBatch } = useSelector((state) => state.batch);
  const { files } = useSelector((state) => state.file);
  const { segments } = useSelector((state) => state.segment);
  const {
    region,
    isDrawing,
    currentAnnotations,
    currentAnnotationIds,
    selectedRegion,
    currentRegionIds,
    currentRegions,
    annotationHistory,
  } = useSelector((state) => state.annotation);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const segment = segments[segmentId];
  const batch = batches[currentBatch];
  const [error, setError] = useState(false);
  const [imageStatus, setImageStatus] = useState("");

  const [selectedId, selectShape] = useState(null);

  const { file, start, end } = segment;
  const { freq_max: batchFreqMax, freq_min, spectrogram_type } = batch;

  const filename = files[file].filename;
  const filePath = files[file].path;
  const [imageSettings, audioSettings] = getImageAudioSettings(
    filename,
    batch,
    segment,
    currentBatch,
    filePath
  );

  const regionsRef = useRef(null);

  const duration = end - start;
  const canvasWidth = duration * 40;
  const canvasHeight = 400;

  const fetchImage = async () => {
    const { data } = await axiosWithAuth.get(
      `/batch/image/?batch=${currentBatch}&segment=${segmentId}`
    );
    if (data.length !== 0) {
      setImage(data[0].image);
    } else {
      const response = await axiosWithAuth({
        method: "get",
        url: "/hallo/image/",
        params: imageSettings,
      });
      const { data } = await axiosWithAuth.get(
        `/batch/image/?id=${response.data.id}`
      );

      setImage(data[0].image);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!segments[segmentId].audio || audioError) {
      dispatch(fetchAudio(audioSettings))
        .unwrap()
        .then((segment) => {
          axiosWithAuth.get(`/segment/?id=${segment.id}`).then((res) => {
            setAudio(res.data[0].audio);
            setAudioError(false);
          });
        })
        .catch((error) => console.error(error));
    }
    // eslint-disable-next-line
  }, [audioError]);

  useEffect(() => {
    fetchImage();
    // eslint-disable-next-line
  }, []);

  const handleErrorImage = async (e) => {
    setError(true);
    const response = await axiosWithAuth({
      method: "get",
      url: "/hallo/image/",
      params: imageSettings,
    });
    const { data } = await axiosWithAuth.get(
      `/batch/image/?id=${response.data.id}`
    );
    setImage(data[0].image);
    setError(false);
  };

  useEffect(() => {
    if (imageStatus === "failed") {
      handleErrorImage();
    }
    // eslint-disable-next-line
  }, [imageStatus]);

  const handleMouseDown = (e) => {
    const target = e.target;

    if (zoomLevel) {
      dispatch(
        openAlert({
          severity: "error",
          message: "In order to draw new region, please switch off zoom.",
        })
      );
      return;
    }

    if (!region && !selectedRegion && e.target.attrs.image) {
      const point = getRelativePointerPosition(e.target.getStage());
      dispatch(mouseDown(point));
      document.getElementById(`annotation-new`)?.focus();
    }

    if (
      target.parent.attrs.id !== "New" &&
      !region &&
      !selectedRegion &&
      !e.target.attrs.image
    ) {
      const id = target.parent.attrs.id;
      dispatch(editAnnotation(id));
      document.getElementById(`annotation-${id}`)?.focus();
    }

    if (e.target.attrs.image) {
      selectShape(null);
      dispatch(cancelEditAnnotation(selectedRegion));
    }

    if (!e.target.attrs.image && selectedRegion) {
      dispatch(
        openAlert({
          severity: "info",
          message: "Click on the blank area to deselect the current region",
        })
      );
      return;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const point = getRelativePointerPosition(e.target.getStage());
    dispatch(mouseMove(point));
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    dispatch(mouseUp());
    document.getElementById(`annotation-new`)?.focus();
  };

  useEffect(() => {
    if (region) {
      const convertedAnnotation = regionToAnnotation({
        region,
        duration,
        start,
        canvasHeight,
        canvasWidth,
        batchFreqMax,
        filename,
      });
      dispatch(
        convertRegionToAnnotation({
          ...convertedAnnotation,
          segment: segmentId,
          annotator: userId,
          batch: currentBatch,
          call_type: annotationHistory?.call_type,
          sound_id_species: annotationHistory?.sound_id_species,
          kw_ecotype: annotationHistory?.kw_ecotype,
          pod: annotationHistory?.pod,
          confidence_level: annotationHistory?.confidence_level,
          comments: annotationHistory?.comments,
        })
      );
    }
    // eslint-disable-next-line
  }, [region]);

  useEffect(() => {
    dispatch(
      fetchCurrentAnnotations({
        batchId: currentBatch,
        segmentId,
        annotator: userId,
      })
    );
    // eslint-disable-next-line
  }, [segmentId]);

  useEffect(() => {
    dispatch(
      convertAnnotationsToRegions({
        currentAnnotations,
        currentAnnotationIds,
        region,
        duration,
        start,
        canvasHeight,
        canvasWidth,
        batchFreqMax,
      })
    );
    // eslint-disable-next-line
  }, [currentAnnotations]);

  return (
    <Box width={"100%"} display='flex'>
      <Box>
        <FreqAxis
          freq_max={batchFreqMax}
          freq_min={freq_min}
          type={spectrogram_type}
        />
        <Box height={25}></Box>
      </Box>
      <Box style={{ overflowX: "scroll" }}>
        {loading || error ? (
          <Box
            height={400}
            width='100%'
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {!error && (
              <ImageLayer
                image={image}
                zoomLevel={zoomLevel}
                width={canvasWidth}
                setImageStatus={setImageStatus}
              />
            )}
            {!zoomLevel && (
              <Layer ref={regionsRef}>
                {region && (
                  <Region
                    shapeProps={region}
                    isSelected={region.id === selectedId}
                    onSelect={() => {
                      selectShape("New");
                    }}
                    onChange={(newAttrs) => {
                      dispatch(regionChange(newAttrs));
                    }}
                    draggable={true}
                  />
                )}
                {currentRegionIds.length > 0 &&
                  currentRegionIds.map((id) => {
                    return (
                      <Region
                        key={"Region" + id}
                        shapeProps={currentRegions[id]}
                        isSelected={id * 1 === selectedRegion * 1}
                        onChange={(newAttrs) => {
                          dispatch(currentRegionChange(newAttrs));
                        }}
                        draggable={id * 1 === selectedRegion * 1}
                      />
                    );
                  })}
              </Layer>
            )}
            <Layer>
              <Line
                points={[currentTime * 40, batchFreqMax, currentTime * 40, 0]}
                stroke='white'
                strokeWidth={2}
              />
              <Text
                x={currentTime * 40 + 5}
                y={10}
                text={currentTime.toFixed(2) + "s"}
                fontSize={15}
                fill={"white"}
              />
            </Layer>
          </Stage>
        )}
        <TimeAxis start={start} end={end} width={canvasWidth} />
      </Box>
    </Box>
  );
};

export default Spectrogram;
