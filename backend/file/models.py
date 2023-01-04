from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class File(models.Model):

    filename = models.CharField(
        max_length=250, verbose_name=_("File Name"), unique=True)
    dirname = models.CharField(max_length=250, verbose_name=_("File Dir"))
    path = models.CharField(
        max_length=250, verbose_name=_("File Path"))
    filesize = models.IntegerField(verbose_name=_("File Size"))
    duration = models.DecimalField(max_digits=10, decimal_places=3)
    channels = models.IntegerField(default=0)
    is_included = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    datetime = models.DateTimeField(verbose_name=_("File Datetime"))
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.filename
