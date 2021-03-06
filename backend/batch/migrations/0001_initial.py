# Generated by Django 3.2.2 on 2022-05-05 03:25

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Batch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('batch_name', models.CharField(max_length=250, unique=True, verbose_name='Batch Name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('spectrogram_type', models.IntegerField(choices=[(0, 'Magnitude Spectrogram'), (1, 'Power Spectrogram'), (2, 'Mel Spectrogram'), (3, 'CQT Spectrogram')], default=0, verbose_name='Spectrogram type')),
                ('window_length', models.DecimalField(decimal_places=5, default=0, max_digits=6, verbose_name='Window Length')),
                ('step_size', models.DecimalField(decimal_places=5, default=0, max_digits=6, verbose_name='Step size')),
                ('zoom_level', models.IntegerField(default=2, verbose_name='Zoom level')),
                ('clip_extension', models.IntegerField(default=3, verbose_name='Clip extension')),
                ('color_map', models.IntegerField(choices=[(0, 'Magma')], default=0, verbose_name='Color map')),
                ('rate', models.IntegerField(default=24000)),
                ('freq_min', models.IntegerField(default=0)),
                ('freq_max', models.IntegerField(default=10000)),
                ('allow_change_settings', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='BatchSegmentImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(blank=True, null=True, upload_to='spectrogram')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='batch.batch')),
            ],
        ),
    ]
