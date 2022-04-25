from django.urls import path
from .views import BatchList, BatchDetail, ImageList, ImageDetail

app_name = 'batch'

urlpatterns = [
    path('<int:pk>/', BatchDetail.as_view(), name='detailcreate'),
    path('', BatchList.as_view(), name='listcreate'),
    path('image/<int:pk>/', ImageDetail.as_view(), name='detailcreate'),
    path('image/', ImageList.as_view(), name='image'),
]
