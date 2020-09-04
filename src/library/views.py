from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .uploader import handlePrepare, handleInit, handleChunk, handleEnd, handleFileExists, handleIdExists
import json
# Views for managing the movie library. Used to upload, delete and stream movies


# Given the filename, size and lastModified timestamp, check if a given file is uploaded
# Supports bulk checking by receiving a list of file objects
def exists(request):

    if 'files' in request.GET:
        return handleFileExists(request)

    if 'id' in request.GET:
        return handleIdExists(request)

    return HttpResponse(status=400)



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
