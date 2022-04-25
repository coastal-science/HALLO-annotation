from django.urls import path
from .views import AnnotationList, AnnotationDetail, AnnotationBatchAdd

app_name = 'annotation'

urlpatterns = [
    path('<int:pk>/', AnnotationDetail.as_view(), name='detailcreate'),
    path('', AnnotationList.as_view(), name='list'),
    path('create/', AnnotationBatchAdd.as_view(), name='batch_add')
]