from rest_framework import generics
from .models import Annotation
from .serializers import AnnotationSerializer
from rest_framework.permissions import IsAuthenticated
from file.views import CreateListModelMixin

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


class AnnotationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer

class AnnotationBatchAdd(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()