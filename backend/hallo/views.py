from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from ketos.audio.spectrogram import MagSpectrogram, MelSpectrogram, PowerSpectrogram, CQTSpectrogram
from librosa import load as load_wav
from soundfile import write as write_audio
import matplotlib.pyplot as plt
from segment.models import Segment
from batch.models import Batch, BatchSegmentImage
from rest_framework.permissions import IsAuthenticated
from batch.serializers import BatchImageSerializer
from segment.serializers import SegmentSerializer
from django.core.exceptions import ObjectDoesNotExist


spec_dict = {"MagSpectrogram": MagSpectrogram,
             "MelSpectrogram": MelSpectrogram,
             "PowerSpectrogram": PowerSpectrogram,
             "CQTSpectrogram": CQTSpectrogram}


def adjust_range(array, min=0, max=1):
    adjusted_array = (array - array.min()) / (array.max() - array.min())

    return adjusted_array



def process_segment_image(audio_file, start, end, spec_config, spec_output, spec_height=1, spec_dpi=400, vmin=0, vmax=1, cmap="viridis"):

    duration = end - start
    # Spectrogram computation
    spec_type = spec_config['type']
    spec_config['duration'] = duration
    spec = spec_dict[spec_type].from_wav(
        audio_file, offset=start, **spec_config)

    # save spectrogram figure
    fig = plt.figure(figsize=(duration / 10, spec_height), frameon=False)
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)
    ax.imshow(adjust_array(spec.data.T), origin='lower', vmin=vmin, vmax=vmax, cmap=cmap)

    plt.savefig(spec_output, dpi=spec_dpi, pad_inches=0, bbox_inches='tight')


def process_segment_audio(audio_file, start, end, audio_clip_output, audio_clip_rate=22050):

    duration = end - start
    audio, _ = load_wav(audio_file, sr=audio_clip_rate,
                        offset=start, duration=duration)
    write_audio(file=audio_clip_output, data=audio,
                samplerate=audio_clip_rate, format='FLAC', subtype='PCM_24')


@api_view()
@parser_classes([JSONParser])
@permission_classes([IsAuthenticated])
def image_view(request, format=None):

    spec_config = {
        "type": request.query_params.get('type'),
        "rate": int(request.query_params.get('rate')),
        "window": float(request.query_params.get('window')),
        "step": float(request.query_params.get('step')),
        "freq_min": int(request.query_params.get('freq_min')),
        "freq_max": int(request.query_params.get('freq_max')),
    }
    audio_file = request.query_params.get('audio_file')
    start = float(request.query_params.get('start'))
    end = float(request.query_params.get('end'))
    spec_output = request.query_params.get('spec_output')
    segment_id = int(request.query_params.get('segment_id'))
    batch_id = int(request.query_params.get('batch_id'))
    image_url = request.query_params.get('image_url')

    process_segment_image(audio_file=audio_file, start=start,
                          end=end, spec_config=spec_config, spec_output=spec_output,)

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
@permission_classes([IsAuthenticated])
def audio_view(request, format=None):

    audio_file = request.query_params.get('audio_file')
    start = float(request.query_params.get('start'))
    end = float(request.query_params.get('end'))
    audio_clip_output = request.query_params.get('audio_clip_output')
    segment_id = int(request.query_params.get('segment_id'))
    audio_url = request.query_params.get('audio_url')

    process_segment_audio(audio_file=audio_file, start=start, end=end,
                          audio_clip_output=audio_clip_output,)

    segment = Segment.objects.get(id=segment_id)
    segment.audio = audio_url
    segment.save()

    serialized = SegmentSerializer(segment)

    return Response(serialized.data)
