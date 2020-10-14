from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .library import handlePoster, handlePreview, handlePrepare, handleInit, handleChunk, handleComplete, handleFileInfo, handleIdInfo, handleDelete, handleDestroy
import json
# Views for managing the movie library. Used to upload, delete and stream movies


# Given the filename, size and lastModified timestamp, check if a given file is uploaded
def infoFile(request):
    return handleFileInfo(request)

def infoId(request):
    return handleIdInfo(request)



def poster(request):

    content_id, w, h = None, None, None

    if 'content_id' in request.GET:
        content_id = request.GET['content_id']

    if not content_id:
        return HttpResponse(status=400)

    if 'w' in request.GET:
        w = int(request.GET['w'])

    if 'h' in request.GET:
        h = int(request.GET['h'])

    return handlePoster(content_id, w, h)



    print('poster')
    return HttpResponse(status=200)

def preview(request):

    content_id = None

    if 'content_id' in request.GET:
        content_id = request.GET['content_id']

    if not content_id:
        return HttpResponse(status=400)

    return handlePreview(request, content_id)


# get movie id, return list of files in library for that movie id

# get stream movie id, stream the movie

# @csrf_exempt
def upload(request):
    if 'type' in request.GET:
        # if request.GET['type'] == 'prepare':
        #     return handlePrepare(request)

        if request.GET['type'] == 'init':
            return handleInit(request)

        elif request.GET['type'] == 'chunk':
            return handleChunk(request)

        elif request.GET['type'] == 'complete':
            return handleComplete(request)



    print('no type')
    print(request)
    return HttpResponse(status=400)
    # return JsonResponse(ERROR_MSG, status=400)


# Delete content in the library
def delete(request):
    if request.method == 'DELETE':
        if 'content_id' in request.GET:
            return handleDelete(request.GET['content_id'])
        elif 'file_id' in request.GET:
            return handleDelete(request.GET['file_id'])

    return HttpResponse(status=400)


# Destroys the complete library
def destroyLibrary(request):

    print(request)

    return HttpResponse()
