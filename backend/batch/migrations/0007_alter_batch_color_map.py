# Generated by Django 3.2.2 on 2023-01-16 15:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('batch', '0006_batchsegmentaudio'),
    ]

    operations = [
        migrations.AlterField(
            model_name='batch',
            name='color_map',
            field=models.IntegerField(choices=[(0, 'viridis'), (1, 'plasma'), (2, 'inferno'), (3, 'magma'), (4, 'cividis'), (5, 'gray')], default=0, verbose_name='Color map'),
        ),
    ]
