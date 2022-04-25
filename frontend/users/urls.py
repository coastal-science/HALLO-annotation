from django.urls import path
from .views import (
    CustomUserCreate,
    BlacklistTokenUpdateView,
    CustomTokenObtainPairView,
    UserDetail,
    UserList,
    AnnotatorProgressList,
    AnnotationProgressDetail
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


app_name = 'users'

urlpatterns = [
    path('register/', CustomUserCreate.as_view(), name="create_user"),
    path('logout/', BlacklistTokenUpdateView.as_view(), name='logout_user'),
    path('login/', CustomTokenObtainPairView.as_view(), name="login_user"),
    path('refresh/', TokenRefreshView.as_view(), name="refresh_user"),
    path('<int:pk>/', UserDetail.as_view(), name='get user detail'),
    path('', UserList.as_view(), name='get user list'),
    path('progress/', AnnotatorProgressList.as_view(), name='progress'),
    path('progress/<int:pk>/', AnnotationProgressDetail.as_view(), name='progress detail'),
]
