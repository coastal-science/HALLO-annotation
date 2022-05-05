# Generated by Django 3.2.2 on 2022-05-05 03:25

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('file', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Segment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DecimalField(decimal_places=3, default=0, max_digits=10, verbose_name='Start time')),
                ('end', models.DecimalField(decimal_places=3, default=0, max_digits=10, verbose_name='End time')),
                ('audio', models.FileField(blank=True, null=True, upload_to='audio_clips')),
                ('label', models.CharField(blank=True, max_length=128)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='file.file')),
            ],
        ),
    ]
