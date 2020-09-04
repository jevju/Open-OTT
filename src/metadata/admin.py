from django.contrib import admin

from .models import MovieMetadata



class MetadataAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'year')
    search_fields = ['title','id']

admin.site.register(MovieMetadata, MetadataAdmin)
