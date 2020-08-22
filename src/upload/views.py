from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.conf import settings

import json
import shutil
import os

ERROR_MSG = {'status':'error'}

# Return root location of temp dir
def tmpRoot():
    tmp_root = '/tmp'
    if settings.UPLOAD_TEMP_LOCATION:
        tmp_root = settings.UPLOAD_TEMP_LOCATION
    return tmp_root

def mediaRoot():
    media_root = '/tmp' #TODO: make a proper media default library location. for instance make an own partition
    if settings.MEDIA_ROOT:
        media_root = settings.MEDIA_ROOT
    return media_root


def handleInit(request):

    size, name, lastModified = None, None, None
    if 'size' in request.GET:
        size = request.GET['size']
    if 'name' in request.GET:
        name = request.GET['name']
    if 'lastModified' in request.GET:
        lastModified = request.GET['lastModified']

    if not name or not size or not lastModified:
        return JsonResponse(ERROR_MSG, status=400)

    filetype = name.split('.')[-1]
    if not filetype in settings.UPLOAD_ACCEPTED_FILETYPES:
        return JsonResponse(ERROR_MSG, status=400)

    tmp_root = tmpRoot()

    h = str(hash(size + name + lastModified))
    tmp_dir = os.path.join(tmp_root, h)

    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)

    with open(os.path.join(tmp_dir, h + '.json'), 'w') as f:
        f.write(json.dumps({
            'size': size,
            'name': name,
            'lastModified': lastModified,
            'hash': h
        }))

    return JsonResponse({'uploadId': h})


def handleChunk(request):

    uploadId, chunk = None, None
    if 'uploadId' in request.GET:
        uploadId = request.GET['uploadId']
    if len(request.body) > 0:
        chunk = request.body

    if not uploadId or not chunk:
        return JsonResponse(ERROR_MSG, status=400)

    tmp_root = tmpRoot()
    partName = uploadId + '.part'

    if not os.path.exists(os.path.join(tmp_root, uploadId)):
        return JsonResponse(ERROR_MSG, status=400)

    with open(os.path.join(tmp_root, uploadId, partName), 'ab') as f:
        f.write(chunk)


    return JsonResponse({'Upload chunk':'success'})

def handleEnd(request):

    uploadId = None
    if 'uploadId' in request.GET:
        uploadId = request.GET['uploadId']

    if not uploadId:
        print(1)
        return JsonResponse(ERROR_MSG, status=400)


    uploadedFile = os.path.join(tmpRoot(), uploadId, uploadId + '.part')
    fileStats = os.path.join(tmpRoot(), uploadId, uploadId + '.json')

    if not os.path.exists(uploadedFile) or not os.path.exists(fileStats):
        print(2)
        return JsonResponse(ERROR_MSG, status=400)

    f = open(fileStats, 'r')
    j = json.load(f)
    f.close()

    s = os.path.getsize(uploadedFile)

    print(s)
    print(j['size'])

    # Uploaded file does not have the right size
    # Transmission not successfull
    # Do not add file
    if not s == int(j['size']):
        print(3)
        return JsonResponse(ERROR_MSG, status=400)

    dst = os.path.join(mediaRoot(), 'library', j['name'])

    print('mv to ' + dst)
    # Make sure the library exists, then move the uploaded file to the library
    os.makedirs(os.path.dirname(dst), exist_ok = True)
    print('made dir')
    shutil.move(uploadedFile, dst)
    print('moved to')
    # Clean up in tmp dir
    shutil.rmtree(os.path.join(tmpRoot(), uploadId))

    print('clianing ip')

    return JsonResponse({'status': 'sucess'})


@csrf_exempt
def upload(request):


    if 'type' in request.GET:
        if request.GET['type'] == 'init':
            return handleInit(request)

        elif request.GET['type'] == 'chunk':
            return handleChunk(request)

        elif request.GET['type'] == 'end':
            return handleEnd(request)

    return JsonResponse(ERROR_MSG, status=400)
