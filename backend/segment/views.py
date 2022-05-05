from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
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
        'id': ["in", "exact"],
        'model_developer': ["exact"]
    }

#This view would handle batch delete
class SegmentListDelete(APIView):
    def delete(self, request, *args, **kwargs):
        ids = request.query_params.get('ids').split(',')
        if ids:
            queryset = Segment.objects.filter(id__in=ids)
            queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SegmentDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer
