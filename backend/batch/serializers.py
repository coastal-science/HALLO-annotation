from rest_framework import serializers
from batch.models import Batch, BatchSegmentImage, BatchSegmentAudio
from users.serializers import UserSerializer


class BatchSerializer(serializers.ModelSerializer):

    class Meta:
        
        model = Batch
        fields = (
            'id',
            'batch_name',
            'description',
            'spectrogram_type',
            'window_length',
            'step_size',
            'zoom_level',
            'rate',
            'freq_min',
            'freq_max',
            'clip_extension',
            'color_map',
            'vmin',
            'vmax',
            'low_pass_freq',
            'high_pass_freq',
            'amplification',
            'channel',
            'allow_change_settings',
            'model_developer',
            'created_at',
            'annotators',
            'segments',
        )
        
        extra_kwargs = {'annotators': {'required': False}, 'segments': {'required': False}}

class BatchImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = BatchSegmentImage
        fields = (
            'id',
            'segment',
            'batch',
            'image',
        )

class BatchAudioSerializer(serializers.ModelSerializer):

    class Meta:
        model = BatchSegmentAudio
        fields = (
            'id',
            'segment',
            'batch',
            'audio',
        )