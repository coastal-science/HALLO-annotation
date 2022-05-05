from rest_framework import serializers
from .models import Segment


class SegmentSerializer(serializers.ModelSerializer):

    batches = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    
    class Meta:
        ordering = ['id']
        model =  Segment
        fields = (
              'id',
              'file',
              'start',
              'end',
              'created_at',
              'batches',
              'audio',
              'label',
              'model_developer',
        )

    extra_kwargs = {'batches': {'required': False}}



