from rest_framework import generics
from .models import Annotation
from .serializers import AnnotationSerializer
from rest_framework.permissions import IsAuthenticated
from file.views import CreateListModelMixin

class AnnotationList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()
    filterset_fields = ['annotator', 'segment', 'batch', 'pod', 'call_type', 'sound_id_species', 'kw_ecotype']


class AnnotationDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer

class AnnotationBatchAdd(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()