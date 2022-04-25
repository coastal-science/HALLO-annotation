from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):

    class Meta:
        ordering = ['id']
        model = File
        fields = (
            'id',
            'filename',
            'dirname',
            'path',
            'filesize',
            'datetime',
            'duration',
            'is_included',
            'deleted',
            'created_at',
        )
