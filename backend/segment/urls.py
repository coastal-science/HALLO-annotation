from django.urls import path
from .views import SegmentList,SegmentDetail,SegmentListDelete

app_name = 'segment'

urlpatterns = [
    path('<int:pk>/', SegmentDetail.as_view(), name='detailcreate'),
    path('', SegmentList.as_view(), name='list'),
    path('delete/', SegmentListDelete.as_view(), name='list'),
]