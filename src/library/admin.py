from django.contrib import admin

from .models import Library

class LibraryAdmin(admin.ModelAdmin):
    list_display = ('content_id', 'file', 'filename', 'type', 'size', 'size_uploaded', 'hash', 'addedOn')
    search_fields = ['content_id', 'filename']

admin.site.register(Library, LibraryAdmin)
