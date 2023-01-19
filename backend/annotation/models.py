from django.db import models
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from segment.models import Segment
from batch.models import Batch


class Annotation(models.Model):

    segment = models.ForeignKey(Segment, on_delete=models.CASCADE,)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE,)
    start = models.DecimalField(max_digits=7, decimal_places=3, default=0)
    end = models.DecimalField(max_digits=7, decimal_places=3, default=0)
    freq_min = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    freq_max = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    sound_id_species = models.CharField(max_length=128, blank=True)
    kw_ecotype = models.CharField(max_length=128, blank=True)
    pod = models.CharField(max_length=128, blank=True)
    call_type = models.CharField(max_length=128, blank=True)
    label = models.CharField(max_length=128, blank=True)
    confidence_level = models.CharField(max_length=128, blank=True)

    comments = models.TextField(blank=True)
    annotator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(default=timezone.now)

    objects = models.Manager()

class Annotation_field(models.Model):

    title = models.CharField(max_length=128, blank=True)
    options = models.JSONField()
    created_at = models.DateTimeField(default=timezone.now)
