from django.db import models

from .tools import media_root

import os



class Library(models.Model):
    content_id = models.CharField(max_length=9, blank=False, default=None)
    file = models.FilePathField(path=media_root, blank=False, default=None)
    filename = models.CharField(max_length=200, default=None, null=True)
    poster = models.CharField(max_length=200, default=None, null=True)
    trailer = models.CharField(max_length=200, default=None, null=True)
    size = models.IntegerField()
    size_uploaded = models.IntegerField()
    type = models.CharField(max_length=200, default=None, null=True) # Specify type (Video, image, srt etc)
    hash = models.CharField(max_length=100, unique=True) # File ID
    addedOn = models.DateTimeField(auto_now_add=True)


class Collection(models.Model):
    name = models.CharField(max_length=200, blank=False, default=None)
    content = models.JSONField(default=None, null=True)
    type = models.CharField(max_length=20, blank=False, default=None)
