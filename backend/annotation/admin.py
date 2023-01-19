from django.contrib import admin
# from django.contrib.postgres import fields # if django < 3.1
from django.db import models
from django_json_widget.widgets import JSONEditorWidget
from .models import Annotation_field


@admin.register(Annotation_field)
class AnnotationFieldAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at')
    formfield_overrides = {
        # fields.JSONField: {'widget': JSONEditorWidget}, # if django < 3.1
        models.JSONField: {'widget': JSONEditorWidget},
    }
