from django.conf import settings
from django.db import models
import os

def media_root():
    if settings.MEDIA_ROOT:
        return settings.MEDIA_ROOT
    else:
        return os.path.join(str(Path.home()), 'Movies', 'library') # Default


class Library(models.Model):
    content_id = models.CharField(max_length=9, blank=False, default=None)
    file = models.FilePathField(path=media_root, blank=False, default=None)
    filename = models.CharField(max_length=200, default=None, null=True)
    # size =
    type = models.CharField(max_length=200, default=None, null=True) # Specify type (Video, image, srt etc)
