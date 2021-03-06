from rest_framework import generics
from batch.models import Batch, BatchSegmentImage
from .serializers import BatchSerializer, BatchImageSerializer
from rest_framework.permissions import IsAuthenticated


class BatchList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all().order_by('id')
    serializer_class = BatchSerializer
    filterset_fields = {
        'id': ["in", "exact"],
        'model_developer': ["exact"],
    }


class BatchDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer


class ImageList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = BatchSegmentImage.objects.all()
    serializer_class = BatchImageSerializer
    filterset_fields = ['id', 'batch', 'segment']


class ImageDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = BatchSegmentImage.objects.all()
    serializer_class = BatchImageSerializer
