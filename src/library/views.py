from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .uploader import handlePrepare, handleInit, handleChunk, handleEnd
import json
# Views for managing the movie library. Used to upload, delete and stream movies


# Given the filename, size and lastModified timestamp, check if a given file is uploaded
# Supports bulk checking by receiving a list of file objects
def exists(request):
    print('exists')

    # size, name, lastModified = None, None, None
    # if 'size' in request.GET:
    #     size = request.GET['size']
    # if 'name' in request.GET:
    #     name = request.GET['name']
    # if 'lastModified' in request.GET:
    #     lastModified = request.GET['lastModified']
    #
    # if not name or not size or not lastModified:
    #     return HttpResponse(status=400)

    files = None
    if len(request.body) > 0:
        files = json.loads(request.body)

    if not files:
        return HttpResponse(status=400)


    for f in files:
        f['exists'] = False

    return JsonResponse(files, safe=False)

    # For now, return "don't exists"
    # return

# get movie id, return list of files in library for that movie id

# get stream movie id, stream the movie

# @csrf_exempt
def upload(request):
    if 'type' in request.GET:
        if request.GET['type'] == 'prepare':
            return handlePrepare(request)

        if request.GET['type'] == 'init':
            return handleInit(request)

        elif request.GET['type'] == 'chunk':
            return handleChunk(request)

        elif request.GET['type'] == 'end':
            return handleEnd(request)

    return HttpResponse(status=400)
    # return JsonResponse(ERROR_MSG, status=400)
