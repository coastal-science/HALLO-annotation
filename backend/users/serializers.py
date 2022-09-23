from rest_framework import serializers
from users.models import User, AnnotatorProgress
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Group

# Serializers allow complex data such as querysets and model instances to be converted to native Python datatypes that can then be easily rendered into JSON, XML or other content types. Serializers also provide deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.


class CustomUserSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(required=True)
    user_name = serializers.CharField(required=True)
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'user_name', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(required=True)
    user_name = serializers.CharField(required=True)
    password = serializers.CharField(min_length=8, write_only=True)

    # this would show items that use user id as foreignkey in Batch model
    batches = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    # to get users groups data
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
     )  

    class Meta:
        model = User
        fields = ('id', 'email', 'user_name', 'password',
                  'groups', 'assigned_batches', 'batches')
        extra_kwargs = {'password': {'write_only': True},
                        'assigned_batches': {'required': False},
                        'annotators': {'required': False}
                        }


# add this custom token obtain view to return additional information such as user's id, username and email.

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # get the default result (token pairs) from the orignal method
        data = super(CustomTokenObtainPairSerializer, self).validate(attrs)
        # adding additinal fields
        data.update({'user_name': self.user.user_name})
        data.update({'id': self.user.id})
        data.update({'email': self.user.email})

        return data


class AnnotatorProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = AnnotatorProgress
        fields = (
            'id',
            'segment',
            'batch',
            'annotator',
            'is_completed',
            'is_marked',
            'name',
            'created_at'
        )
