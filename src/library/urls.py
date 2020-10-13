from django.urls import path

from . import views

urlpatterns = [
    path('upload/', views.upload, name='upload'),
    path('info/id/', views.infoId, name='infoId'),
    path('info/file/', views.infoFile, name='infoFile'),
    path('delete/', views.delete, name='delete'),
    path('destroy/', views.destroyLibrary, name='destroyLibrary')

    # path('/stream/file')
    # path('/stram/id')
    # Not allowed to stream if file is not complete
]
