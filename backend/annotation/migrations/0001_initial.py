# Generated by Django 3.2.2 on 2022-05-05 03:25

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DecimalField(decimal_places=3, default=0, max_digits=7)),
                ('end', models.DecimalField(decimal_places=3, default=0, max_digits=7)),
                ('freq_min', models.DecimalField(decimal_places=3, default=0, max_digits=8)),
                ('freq_max', models.DecimalField(decimal_places=3, default=0, max_digits=8)),
                ('sound_id_species', models.CharField(blank=True, max_length=128)),
                ('kw_ecotype', models.CharField(blank=True, max_length=128)),
                ('pod', models.CharField(blank=True, max_length=128)),
                ('call_type', models.CharField(blank=True, max_length=128)),
                ('label', models.CharField(blank=True, max_length=128)),
                ('confidence_level', models.CharField(blank=True, max_length=128)),
                ('comments', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
    ]
