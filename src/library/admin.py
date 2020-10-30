from django.contrib import admin

from .models import Library, Collection

class LibraryAdmin(admin.ModelAdmin):
    list_display = ('content_id', 'file', 'filename', 'type', 'size', 'size_uploaded', 'hash', 'addedOn')
    search_fields = ['content_id', 'filename']

class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'content')
    search_fields = ('name', 'content')

admin.site.register(Library, LibraryAdmin)
admin.site.register(Collection, CollectionAdmin)
