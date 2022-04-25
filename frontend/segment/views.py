from rest_framework import generics
from segment.models import Segment
from .serializers import SegmentSerializer
from rest_framework.permissions import IsAuthenticated
from file.views import CreateListModelMixin


class SegmentList(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer
    filterset_fields = ['id']


class SegmentDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer
