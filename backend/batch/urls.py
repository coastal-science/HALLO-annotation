from django.urls import path
from .views import BatchList, BatchDetail, ImageList, ImageDetail, AudioList, AudioDetail

app_name = 'batch'

urlpatterns = [
    path('<int:pk>/', BatchDetail.as_view(), name='detailcreate'),
    path('', BatchList.as_view(), name='listcreate'),
    path('image/<int:pk>/', ImageDetail.as_view(), name='detailcreate'),
    path('image/', ImageList.as_view(), name='image'),
    path('audio/<int:pk>/', AudioDetail.as_view(), name='detailcreate'),
    path('audio/', AudioList.as_view(), name='audio'),
]
