from rest_framework import generics
from segment.models import Segment
from .serializers import SegmentSerializer
from rest_framework.permissions import IsAuthenticated
from file.views import CreateListModelMixin


class SegmentList(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer
    #This would allow the filter to return multiple items like http://localhost:8000/api/segment/?id__in=2,3,4,5,6,7
    filterset_fields = {
        'id': ["in", "exact"]
    }


class SegmentDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer
