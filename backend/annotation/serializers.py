from rest_framework import serializers
from .models import Annotation, Annotation_field


class AnnotationSerializer(serializers.ModelSerializer):

    class Meta:
        ordering = ['created_at']
        model = Annotation
        fields = (
            'id',
            'batch',
            'segment',
            'start',
            'end',
            'freq_max',
            'freq_min',
            'sound_id_species',
            'kw_ecotype',
            'pod',
            'call_type',
            'label',
            'confidence_level',
            'comments',
            'annotator',
            'created_at',
        )


class AnnotationFieldSerializer(serializers.ModelSerializer):

    class Meta:
        model = Annotation_field
        fields = "__all__"
