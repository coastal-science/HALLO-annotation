# Generated by Django 3.2.2 on 2023-01-19 00:44

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('annotation', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation_field',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=128)),
                ('options', models.JSONField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
    ]