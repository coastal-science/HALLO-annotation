from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from file.models import File
from django.db.models.signals import post_delete
from django.dispatch import receiver


class Segment(models.Model):

    file = models.ForeignKey(File, on_delete=models.CASCADE)
    start = models.DecimalField(
        max_digits=10, decimal_places=3, default=0, verbose_name=_("Start time"))
    end = models.DecimalField(
        max_digits=10, decimal_places=3, default=0, verbose_name=_("End time"))
    audio = models.FileField(upload_to='audio_clips', blank=True, null=True)
    label = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = models.Manager()


# files will be deleted when a segment is deleted
@receiver(post_delete, sender=Segment)
def post_save_audio(sender, instance, *args, **kwargs):
    """ Clean Old Image file """
    try:
        instance.audio.delete(save=False)
    except:
        pass
