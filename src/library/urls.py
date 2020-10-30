from django.urls import path

from . import views

urlpatterns = [
    path('poster/', views.poster, name='poster'),
    path('preview/', views.preview, name='preview'),
    path('video/', views.video, name='video'),
    path('title/', views.title, name='title'),
    path('upload/', views.upload, name='upload'),
    path('info/id/', views.infoId, name='infoId'),
    path('info/file/', views.infoFile, name='infoFile'),
    path('delete/', views.delete, name='delete'),
    path('destroy/', views.destroyLibrary, name='destroyLibrary'),
    path('collection/', views.collection, name='collection'),
    path('collection/<str:id>', views.collection, name='collection')

    # path('/stream/file')
    # path('/stram/id')
    # Not allowed to stream if file is not complete
]
