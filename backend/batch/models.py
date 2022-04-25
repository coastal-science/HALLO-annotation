from django.db import models
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from segment.models import Segment
from django.dispatch import receiver
from django.db.models.signals import post_delete


class Batch(models.Model):

    SPECTROGRAM_TYPE = (
        (0, _('Magnitude Spectrogram')),
        (1, _('Power Spectrogram')),
        (2, _('Mel Spectrogram')),
        (3, _('CQT Spectrogram')),
    )

    COLOR_MAP = (
        (0, _('Magma')),
    )

    batch_name = models.CharField(max_length=250, verbose_name=_("Batch Name"), unique=True)
    description = models.TextField(blank=True, verbose_name=_("Description"))
    spectrogram_type = models.IntegerField(
        choices=SPECTROGRAM_TYPE, default=0, verbose_name=_("Spectrogram type")
    )
    # example: window length: 0.256, step size: 0.032
    window_length = models.DecimalField(
        max_digits=6, decimal_places=5, default=0,  verbose_name=_("Window Length"))
    step_size = models.DecimalField(
        max_digits=6, decimal_places=5, default=0,  verbose_name=_("Step size"))
    # example: zoom level: 2X
    zoom_level = models.IntegerField(default=2, verbose_name=_("Zoom level"))
    # example: clip extension: 3
    clip_extension = models.IntegerField(
        default=3, verbose_name=_("Clip extension"))

    color_map = models.IntegerField(
        choices=COLOR_MAP, default=0, verbose_name=_("Color map")
    )
    rate = models.IntegerField(default=24000)
    freq_min = models.IntegerField(default=0)
    freq_max = models.IntegerField(default=10000)
    
    allow_change_settings = models.BooleanField(default=False)

    model_developer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='batches'
    )
    
    segments = models.ManyToManyField(Segment, related_name='batches', blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    objects = models.Manager()

 

    def __str__(self):
        return self.batch_name


class BatchSegmentImage(models.Model):

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    segment = models.ForeignKey(Segment, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='spectrogram', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = models.Manager()

@receiver(post_delete, sender=BatchSegmentImage)
def post_save_image(sender, instance, *args, **kwargs):

    try:
        instance.image.delete(save=False)
    except:
        pass