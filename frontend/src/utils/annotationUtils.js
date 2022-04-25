import { yellow } from "@material-ui/core/colors";

export const getRelativePointerPosition = (node) => {
    // the function will return pointer position relative to the passed node
    const transform = node.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();
    // get pointer (say mouse or touch) position
    const pos = node.getStage().getPointerPosition();
    // now we find relative point
    return transform.point(pos);
};

const spectrogramMap = new Map([
    [0, 'MagSpectrogram'],
    [1, 'MelSpectrogram'],
    [2, 'PowerSpectrogram'],
    [3, 'CQTSpectrogram'],
]);

export const getImageAudioSettings = (filename, batch, segment, currentBatch, filePath) => {

    const {
        freq_max,
        freq_min,
        rate,
        spectrogram_type,
        window_length,
        step_size,
    } = batch;

    const { id, start, end } = segment;

    const audio_file = filePath;
    const spec_output = `/backend/media/spectrogram/${filename}_batch_${currentBatch}_segment_${id}.png`;
    const audio_clip_output = `/backend/media/audio_clips/${filename}_segment_${id}.flac`;
    const image_url = `spectrogram/${filename}_batch_${currentBatch}_segment_${id}.png`;
    const audio_url = `audio_clips/${filename}_segment_${id}.flac`;

    const imageSettings = {
        type: spectrogramMap.get(spectrogram_type),
        window: window_length,
        rate,
        step: step_size,
        freq_min,
        freq_max,
        audio_file,
        spec_output,
        start,
        end,
        segment_id: id,
        batch_id: currentBatch,
        image_url,
    };

    const audioSettings = {
        audio_file,
        start,
        end,
        audio_clip_output,
        segment_id: id,
        audio_url,
    };

    return [imageSettings, audioSettings];
};

export const regionToAnnotation = ({ region, duration, filename, start, canvasHeight, canvasWidth, batchFreqMax }) => {
    const { x, y, width, height, id } = region;

    const annotationStart =
        ((duration * x) / canvasWidth) + start * 1;
    const annotationEnd =
        ((duration * (x + width)) / canvasWidth) + start * 1;
    const freq_min =
        ((batchFreqMax * (canvasHeight - y - height)) / canvasHeight);
    const freq_max =
        ((batchFreqMax * (canvasHeight - y)) / canvasHeight);

    const annotation = {
        id,
        start: annotationStart,
        end: annotationEnd,
        freq_min,
        freq_max,
        file_name: filename,
    };
    return annotation;
};

export const annotationToRegion = ({ annotation, canvasWidth, canvasHeight, batchFreqMax, duration, start }) => {

    const { id, start: annotationStart, end: annotationEnd, freq_max: annotationMax, freq_min: annotationMin, sound_id_species } = annotation;
    const x = ((annotationStart - start * 1) * canvasWidth) / duration;
    const width = (annotationEnd - annotationStart) * 40;
    const y = canvasHeight - (annotationMax * canvasHeight) / batchFreqMax;
    const height = 400 * (annotationMax - annotationMin) / batchFreqMax;

    return { id: id + "", x, y, width, height, name: "Region", stroke: `${yellow[100]}`, sound_id_species };

};