from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from batch.models import Batch
from django.conf import settings
from segment.models import Segment

# use a custom manager to add methods to the class, as it is usually preferred vs class methods


class CustomAccountManager(BaseUserManager):

    def create_superuser(self, email, user_name, password, **other_fields):

        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        if other_fields.get('is_staff') is not True:
            raise ValueError(
                'Superuser must be assigned to is_staff = True.')
        if other_fields.get('is_superuser') is not True:
            raise ValueError(
                'Superuser must be assigned to is_superuser = True.')

        return self.create_user(email, user_name, password, **other_fields)

    def create_user(self, email, user_name, password, **other_fields):

        if not email:
            raise ValueError(_('Please provide an email address'))

        email = self.normalize_email(email)
        user = self.model(email=email, user_name=user_name, **other_fields)
        user.set_password(password)
        user.save()
        return user

# gettext_lazy makes translatable strings


class User(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(_('email address'), unique=True)
    user_name = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # added a many to many table for adding multiple batches to a annotator
    assigned_batches = models.ManyToManyField(Batch, related_name='annotators', blank=True)

    objects = CustomAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_name']

    def __str__(self):
        return self.user_name


class AnnotatorProgress(models.Model):

    name = models.CharField(max_length=150, unique=True)
    annotator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, )
    segment = models.ForeignKey(Segment, on_delete=models.CASCADE, )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, )
    is_completed = models.BooleanField(default=False)
    is_marked = models.BooleanField(default=False)

    objects = models.Manager()
