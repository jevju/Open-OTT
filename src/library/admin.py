from django.contrib import admin

from .models import Library

class LibraryAdmin(admin.ModelAdmin):
    list_display = ('content_id', 'file', 'filename', 'type')
    search_fields = ['content_id']

admin.site.register(Library, LibraryAdmin)
