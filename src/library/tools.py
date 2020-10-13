from django.conf import settings

def media_root():
    if settings.MEDIA_ROOT:
        return settings.MEDIA_ROOT
    else:
        return os.path.join(str(Path.home()), 'Movies', 'library') # Default
