from django.shortcuts import HttpResponse
from filebrowser.base import FileListing, FileObject
from filebrowser.sites import site
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import File
from .serializers import FileSerializer
from rest_framework import generics
import soundfile as sf
import math
import os
from django.http import FileResponse, Http404

site.directory = "/audio/"


@api_view()
@permission_classes([IsAuthenticated])
def file_list_view(request):
    filelisting = FileListing(
        site.storage.location + site.directory, sorting_by='date', sorting_order='desc')
    files = []
    errors = []
    for file in filelisting.walk():
        file_object = FileObject(file)
        if file_object.filetype == 'Audio':
            try:
                metadata = sf.info(file_object.path)

                file_item = {
                    "filename": file_object.filename,
                    "dirname": file_object.dirname,
                    "path": file_object.path,
                    "filesize": file_object.filesize,
                    "datetime": file_object.datetime,
                    "duration": math.ceil(metadata.duration * 1000) / 1000,
                }
                files.append(file_item)

                file_instance = File.objects.filter(path=file_item['path'])

                if not file_instance:

                    file_instance = File(
                        filename=file_item['filename'],
                        dirname=file_item['dirname'],
                        path=file_item['path'],
                        filesize=file_item['filesize'],
                        datetime=file_item['datetime'],
                        duration=file_item['duration'],
                    )

                    file_instance.save()
            except RuntimeError as e:
                errors.append(str(e))

    return Response({"files": files, "errors": errors})


@api_view()
@permission_classes([IsAuthenticated])
def file_download_view(request, format=None):
    file_path = request.query_params.get('path')
    try:
        response = FileResponse(open(file_path, 'rb'))
        response['content_type'] = "application/octet-stream"
        response['Content-Disposition'] = 'attachment; filename=' + \
            os.path.basename(file_path)
        return response
    except Exception:
        raise Http404


class CreateListModelMixin(object):
    def get_serializer(self, *args, **kwargs):
        """ if an array is passed, set serializer to many """
        if isinstance(kwargs.get('data', {}), list):
            kwargs['many'] = True
        return super(CreateListModelMixin, self).get_serializer(*args, **kwargs)


class FileList(CreateListModelMixin, generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = File.objects.all()
    serializer_class = FileSerializer


class FileDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = File.objects.all()
    serializer_class = FileSerializer
