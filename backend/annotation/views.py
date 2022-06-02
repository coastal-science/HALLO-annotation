from rest_framework import generics, status
from .models import Annotation
from .serializers import AnnotationSerializer
from rest_framework.permissions import IsAuthenticated
from file.views import CreateListModelMixin
from rest_framework.views import APIView
from rest_framework.response import Response

class AnnotationList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()
    filterset_fields = {
        'id': ["in", "exact"],
        'annotator': ["exact"], 
        'segment': ["exact"], 
        'batch': ["in","exact"], 
        'pod': ["exact"], 
        'call_type': ["exact"], 
        'sound_id_species': ["exact"], 
        'kw_ecotype': ["exact"],
    }

#This view would handle batch delete
class AnnotationListDelete(APIView):
    def delete(self, request, *args, **kwargs):
        ids = request.query_params.get('ids').split(',')
        if ids:
            queryset = Annotation.objects.filter(id__in=ids)
            queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AnnotationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer

class AnnotationBatchAdd(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()