from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):

    class Meta:
        ordering = ['id']
        model = File
        fields = '__all__'
