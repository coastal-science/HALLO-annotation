from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.documentation import include_docs_urls
from rest_framework.permissions import IsAdminUser
from api.views import CustomLogin

urlpatterns = [
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('admin/hallo-login/',
         CustomLogin.as_view(template_name='login.html'), name='login'),
    path('admin/', admin.site.urls),
    path('api/user/', include('users.urls', namespace='users')),
    path('api/batch/', include('batch.urls', namespace='batch')),
    path('api/file/', include('file.urls', namespace='file')),
    path('api/segment/', include('segment.urls', namespace='segment')),
    path('api/annotation/', include('annotation.urls', namespace='annotation')),
    path('api/hallo/', include('hallo.urls', namespace='hallo')),
    path('docs/', include_docs_urls(title='Hallo API',
         public=False, permission_classes=[IsAdminUser])),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
