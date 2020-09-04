from django.conf import settings
from django.http import JsonResponse, HttpResponse


from .models import Library

import json
import shutil
import os

from pathlib import Path



ERROR_MSG = {'status':'error'}

# Return root location of temp dir
def tmp_root():
    p = '/tmp' # Default
    if settings.TEMP_ROOT:
        p = settings.TEMP_ROOT
    return p

def media_root():
    if settings.MEDIA_ROOT:
        return settings.MEDIA_ROOT
    else:
        return os.path.join(str(Path.home()), 'Movies', 'library') # Default

# Prepare the upload.
# Check if any instances of the given movie id is already uploaded
def handlePrepare(request):
    size, name, lastModified = None, None, None
    if 'size' in request.GET:
        size = request.GET['size']
    if 'name' in request.GET:
        name = request.GET['name']
    if 'lastModified' in request.GET:
        lastModified = request.GET['lastModified']

    if not name or not size or not lastModified:
        return JsonResponse(ERROR_MSG, status=400)

    id = None
    if 'id' in request.GET:
        id = request.GET['id']

    if not id:
        return JsonResponse(ERROR_MSG, status=400)

    # TODO: If id already in library database table,
    # return list of uploaded files having the given movie id


def handleInit(request):

    size, name, lastModified, id = None, None, None, None
    if 'size' in request.GET:
        size = request.GET['size']
    if 'name' in request.GET:
        name = request.GET['name']
    if 'lastModified' in request.GET:
        lastModified = request.GET['lastModified']
    if 'id' in request.GET:
        id = request.GET['id']
    print(1)

    if not name or not size or not lastModified or not id:
        return JsonResponse(ERROR_MSG, status=400)


    filetype = name.split('.')[-1]
    if not filetype in settings.UPLOAD_ACCEPTED_FILETYPES:
        return JsonResponse(ERROR_MSG, status=400)

    t = tmp_root()

    h = str(hash(size + name + lastModified))
    tmp_dir = os.path.join(t, h)

    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    print('dumping')
    with open(os.path.join(tmp_dir, h + '.json'), 'w') as f:
        f.write(json.dumps({
            'id': id,
            'size': size,
            'name': name,
            'lastModified': lastModified,
            'hash': h
        }))
    print('dumped')
    return JsonResponse({'uploadId': h})


def handleChunk(request):

    uploadId, chunk = None, None
    if 'uploadId' in request.GET:
        uploadId = request.GET['uploadId']
    if len(request.body) > 0:
        chunk = request.body

    if not uploadId or not chunk:
        return JsonResponse(ERROR_MSG, status=400)

    t = tmp_root()
    partName = uploadId + '.part'

    if not os.path.exists(os.path.join(t, uploadId)):
        return JsonResponse(ERROR_MSG, status=400)

    with open(os.path.join(t, uploadId, partName), 'ab') as f:
        f.write(chunk)


    return JsonResponse({'Upload chunk':'success'})

def handleEnd(request):

    uploadId = None
    if 'uploadId' in request.GET:
        uploadId = request.GET['uploadId']

    if not uploadId:
        return JsonResponse(ERROR_MSG, status=400)


    uploadedFile = os.path.join(tmp_root(), uploadId, uploadId + '.part')
    fileStats = os.path.join(tmp_root(), uploadId, uploadId + '.json')

    if not os.path.exists(uploadedFile) or not os.path.exists(fileStats):
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
        return JsonResponse(ERROR_MSG, status=400)



    dst = os.path.join(media_root(), j['id'], j['name'])


    print('mv to ' + dst)
    # Make sure the library exists, then move the uploaded file to the library
    os.makedirs(os.path.dirname(dst), exist_ok = True)
    print('made dir')
    shutil.move(uploadedFile, dst)
    print('moved to')
    # Clean up in tmp dir
    shutil.rmtree(os.path.join(tmp_root(), uploadId))

    print('clianing ip')
    print(j)
    print('adding to db')
    l = Library(
        content_id = j['id'],
        filename = j['name'],
        file = j['id'] + '/' + j['name'],
        type = 'm4v'
    ).save()


    return JsonResponse({'status': 'sucess'})



def handleFileExists(request):

    print('exists?')
    print(request)
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

    # TODO: Check if files is one file object {} or a list of files []
    # Should support both!!
    # if files.type is dict:

    for f in files:
        f['exists'] = False

    return JsonResponse(files, safe=False)

def handleIdExists(request):

    id = request.GET['id']
    print(id)

    if os.path.exists(os.path.join(media_root(), id)):
        # Return 204 when file exists for id
        return HttpResponse(status=204)

    return HttpResponse(status=200)
