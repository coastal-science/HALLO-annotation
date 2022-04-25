from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CustomUserSerializer, CustomTokenObtainPairSerializer, UserSerializer, AnnotatorProgressSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, AnnotatorProgress


# We are using permission classes AllowAny, as this two views are for user registeration and it is meant to be public
class CustomUserCreate(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format='json'):
        serializer = CustomUserSerializer(data=request.data)
        # if the data in the request match the database fields
        if serializer.is_valid():
            # save to the database and pass the returned data to user
            user = serializer.save()
            if user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlacklistTokenUpdateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserList(generics.ListAPIView):
    """
    Return a list of all the existing users.
    """
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class AnnotatorProgressList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AnnotatorProgress.objects.all()
    serializer_class = AnnotatorProgressSerializer
    filterset_fields = ['annotator', 'batch',
                        'segment', 'is_marked', 'is_completed', 'name']


class AnnotationProgressDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = AnnotatorProgress.objects.all()
    serializer_class = AnnotatorProgressSerializer
