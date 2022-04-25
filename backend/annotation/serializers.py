from rest_framework import serializers
from .models import Annotation



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
            'offset',
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
