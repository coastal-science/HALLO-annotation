from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from ketos.audio.waveform import Waveform
from ketos.audio.spectrogram import MagSpectrogram, MelSpectrogram, PowerSpectrogram, CQTSpectrogram
from librosa import load as load_wav
from scipy.signal import butter, sosfilt
from soundfile import write as write_audio
import matplotlib.pyplot as plt
from segment.models import Segment
from batch.models import Batch, BatchSegmentImage, BatchSegmentAudio
from rest_framework.permissions import IsAuthenticated
from batch.serializers import BatchImageSerializer, BatchAudioSerializer
from segment.serializers import SegmentSerializer
from django.core.exceptions import ObjectDoesNotExist


spec_dict = {"MagSpectrogram": MagSpectrogram,
             "MelSpectrogram": MelSpectrogram,
             "PowerSpectrogram": PowerSpectrogram,
             "CQTSpectrogram": CQTSpectrogram}


def adjust_range(array, min_value=0, max_value=1):
    adjusted_array = min_value + \
        (array - array.min()) * (max_value -
                                 min_value) / (array.max() - array.min())

    return adjusted_array


def amplify(signal, factor, log=False):
    if log:
        amp_signal = signal * np.power(10, factor / 20)
    else:
        amp_signal = signal * factor

    return amp_signal


def low_pass_filter(sig, rate, order=10, freq=400):
    """ Apply a low pass butter filter to the input signal.

        Args:
            sig: 1D numpy array (floats or ints)
                The audio signal(time domain) to be filtered
            rate: int
                The sampling rate of the signal
            order: int

            freq:int
                The frequency used for the filter. 

        Return:
            filtered_signal: 1D numpy array
                The signal with frequencies above 'freq' filtered out. (same dimensions as the input 'sig')

    """
    butter_filter = butter(N=order, fs=rate, Wn=freq,
                           btype="lowpass", output="sos")
    filtered_signal = sosfilt(butter_filter, sig)

    return filtered_signal


def high_pass_filter(sig, rate, order=10, freq=400):
    """ Apply a high pass butter filter to the input signal.

        Args:
            sig: 1D numpy array (floats or ints)
                The audio signal(time domain) to be filtered
            rate: int
                The sampling rate of the signal
            order: int

            freq:int
                The frequency used for the filter. 

        Return:
            filtered_signal: 1D numpy array
                The signal with frequencies below 'freq' filtered out. (same dimensions as the input 'sig')

    """
    butter_filter = butter(N=order, fs=rate, Wn=freq,
                           btype="highpass", output="sos")
    filtered_signal = sosfilt(butter_filter, sig)

    return filtered_signal


def process_segment_image(
        audio_file,
        start,
        end,
        spec_config,
        spec_output,
        amplification_factor=1.0,
        amplification_log=False,
        low_pass_freq=None,
        high_pass_freq=None,
        channel=0,
        spec_height=1,
        spec_dpi=400,
        vmin=0,
        vmax=1,
        cmap="viridis"):

    audio = create_audio_array(audio_file, start, end, audio_clip_rate=spec_config['rate'], amplification_factor=amplification_factor,
                               amplification_log=amplification_log, low_pass_freq=low_pass_freq, high_pass_freq=high_pass_freq, channel=channel)
    wav = Waveform(data=audio, offset=start,
                   rate=spec_config['rate'], window=spec_config['window'], step=['step'])

    duration = end - start
    # Spectrogram computation
    spec_type = spec_config['type']

    spec = spec_dict[spec_type].from_waveform(
        wav, **spec_config)

    # save spectrogram figure
    fig = plt.figure(figsize=(duration / 10, spec_height), frameon=False)
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)
    img_data = spec.data
    img_data = adjust_range(img_data)
    ax.imshow(img_data.T, origin='lower', vmin=vmin, vmax=vmax, cmap=cmap)

    plt.savefig(spec_output, dpi=spec_dpi, pad_inches=0, bbox_inches='tight')
    plt.close(fig)


def create_audio_array(audio_file, start, end, audio_clip_rate=22050, amplification_factor=1.0, amplification_log=False, low_pass_freq=None, high_pass_freq=None, channel=0):
    duration = end - start
    audio_obj = Waveform.from_wav(
        audio_file, rate=audio_clip_rate, channel=channel, offset=start, duration=duration)

    audio_array = audio_obj.data
    rate = audio_obj.rate

    if low_pass_freq:
        audio_array = low_pass_filter(
            audio_array, rate=rate, freq=low_pass_freq)
    if high_pass_freq:
        audio_array = high_pass_filter(
            audio_array, rate=rate, freq=high_pass_freq)

    audio_array = adjust_range(audio_array)
    audio_array = amplify(audio_array, amplification_factor, amplification_log)

    return audio_array


def process_segment_audio(
        audio_file,
        start,
        end,
        audio_clip_output,
        audio_clip_rate=22050,
        amplification_factor=1.0,
        amplification_log=False,
        low_pass_freq=None,
        high_pass_freq=None,
        channel=0):

    audio = create_audio_array(audio_file, start, end, audio_clip_rate=audio_clip_rate, amplification_factor=amplification_factor,
                               amplification_log=amplification_log, low_pass_freq=low_pass_freq, high_pass_freq=high_pass_freq, channel=channel)
    write_audio(file=audio_clip_output, data=audio,
                samplerate=audio_clip_rate, format='FLAC', subtype='PCM_24')


@api_view()
@parser_classes([JSONParser])
# @permission_classes([IsAuthenticated])
def image_view(request, format=None):

    specs = request.data

    spec_config = {
        "type": specs['type'],
        "rate": specs['rate'],
        "window": specs['window'],
        "step": specs['step'],
        "freq_min": specs['freq_min'],
        "freq_max": specs['freq_max']
    }
    audio_file = specs['audio_file']
    start = specs['start']
    end = specs['end']
    filename = specs['filename']
    segment_id = specs['segment_id']
    batch_id = specs['batch_id']
    spec_output = f'/backend/media/spectrogram/{filename}_batch_{batch_id}_segment_{segment_id}.png'
    image_url = f'spectrogram/{filename}_batch_{batch_id}_segment_{segment_id}.png'

    # extra parameters
    amplification_factor = specs['amplification']
    low_pass_freq = None if specs['low_pass_freq'] == 0 else specs['low_pass_freq']
    high_pass_freq = None if specs['high_pass_freq'] == 0 else specs['high_pass_freq']
    channel = specs['channel']
    vmin = specs['vmin']
    vmax = specs['vmax']
    cmap = specs['color_map']

    process_segment_image(
        audio_file=audio_file,
        start=start,
        end=end,
        spec_config=spec_config,
        spec_output=spec_output,
        amplification_factor=amplification_factor,
        low_pass_freq=low_pass_freq,
        high_pass_freq=high_pass_freq,
        vmin=vmin,
        vmax=vmax,
        cmap=cmap)

    batch = Batch.objects.get(id=batch_id)
    segment = Segment.objects.get(id=segment_id)

    try:

        image_instance = BatchSegmentImage.objects.get(
            segment=segment_id, batch=batch_id)
        image_instance.image = image_url
        image_instance.save()

    except ObjectDoesNotExist:

        image_instance = BatchSegmentImage(
            batch=batch,
            segment=segment,
            image=image_url,
        )
        image_instance.save()

    serialized = BatchImageSerializer(image_instance)
    return Response(serialized.data)


@api_view()
@parser_classes([JSONParser])
# @permission_classes([IsAuthenticated])
def audio_view(request, format=None):

    specs = request.data

    audio_file = specs['audio_file']
    start = specs['start']
    end = specs['end']
    filename = specs['filename']
    segment_id = specs['segment_id']
    batch_id = specs['batch_id']
    audio_url = f'audio_clips/{filename}_batch_{batch_id}_segment_{segment_id}.flac'
    audio_clip_output = f'/backend/media/audio_clips/{filename}_batch_{batch_id}_segment_{segment_id}.flac'

    # extra parameters
    amplification_factor = specs['amplification']
    low_pass_freq = None if specs['low_pass_freq'] == 0 else specs['low_pass_freq']
    high_pass_freq = None if specs['high_pass_freq'] == 0 else specs['high_pass_freq']
    channel = specs['channel']

    process_segment_audio(
        audio_file=audio_file,
        start=start,
        end=end,
        audio_clip_output=audio_clip_output,
        amplification_factor=amplification_factor,
        low_pass_freq=low_pass_freq,
        high_pass_freq=high_pass_freq,
        channel=channel)

    batch = Batch.objects.get(id=batch_id)
    segment = Segment.objects.get(id=segment_id)

    try:

        audio_instance = BatchSegmentAudio.objects.get(
            segment=segment_id, batch=batch_id)
        audio_instance.audio = audio_url
        audio_instance.save()

    except ObjectDoesNotExist:

        audio_instance = BatchSegmentAudio(
            batch=batch,
            segment=segment,
            audio=audio_url,
        )
        audio_instance.save()

    serialized = BatchAudioSerializer(audio_instance)

    return Response(serialized.data)
