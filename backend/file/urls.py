from django.urls import path
from filebrowser.sites import site
from .views import file_download_view, file_list_view, FileList, FileDetail,FileListDelete

app_name = 'file'

urlpatterns = [
    path('admin/', site.urls),
    path('scan/', file_list_view),
    path('download/', file_download_view),
    path('', FileList.as_view(), name='filelist'),
    path('<int:pk>/', FileDetail.as_view(), name='filedetail'),
    path('delete/', FileListDelete.as_view(), name='list'),
]
