from django.conf import settings
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.db.models import F
from django.test import Client

from .models import Library
from .tools import media_root
from .streamer import stream_video

import json
import shutil
import os
import re
import hashlib
import requests
import urllib

from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image

ERROR_MSG = {'status':'error'}

# Return root location of temp dir
def tmp_root():
    p = '/tmp' # Default
    if settings.TEMP_ROOT:
        p = settings.TEMP_ROOT
    return p

def get_hash(val):
    return hashlib.md5(val.encode('utf-8')).hexdigest()

# Check for valid content_id pattern
def validateContentId(content_id):
    p = re.compile(r'[t]{2}[0-9]{7,8}')
    if not p.search(content_id):
        return False
    return True

def validateFileId(file_id):
    if not len(file_id) == 32:
        return False
    return True

def validateFilename(n):
    if not isinstance(n, str):
        return False
    if len(n) > 200:
        return False
    if len(n.split('.')) > 2:
        return False
    return True

def validateSize(s):
    print(s)
    return True
    p = re.compile(r'[0-9]{7,8}')
    if not p.search(content_id):
        return False
    return True

def validateTimestamp(t):
    print(t)
    return True


    print(type(t))
    print(t)
    if not isinstance(t, (int, float)):
        return False
    return True

def getTrailerUrl(metacritic_url):
    try:
        req = requests.get(metacritic_url, headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
        })

        data = req.text
        soup = BeautifulSoup(data, "html.parser")

        r = soup.find('div', {'id':'videoContainer_wrapper'})
        return r.get('data-mcvideourl')
    except:
        return None

def handlePoster(content_id, w, h):

    if not validateContentId(content_id):
        return HttpResponse(status=404)

    try:
        obj = Library.objects.get(content_id=content_id)

    except Library.DoesNotExist:
        return HttpResponse(status=404)

    if not obj.poster:
        return HttpResponse(status=404)

    try:
        r = 1.473

        if w and not h:
            h = int(w * r)

        if h and not w:
            w = int(h/ r)

        if w and h:
            img = Image.open(obj.poster)
            img.thumbnail((w,h))
            response = HttpResponse(content_type='image/jpeg')
            img.save(response, 'jpeg')
            return response

        else:
            with open(obj.poster, 'rb') as f:
                return HttpResponse(f.read(), content_type='image/jpeg')
    except:
        return HttpResponse(status=404)

# Retrieve movie preview/ trailer
def handlePreview(request, content_id):

    if not validateContentId(content_id):
        return HttpResponse(status=404)

    try:
        obj = Library.objects.get(content_id=content_id)

    except Library.DoesNotExist:
        return HttpResponse(status=404)

    if not obj.trailer:
        return HttpResponse(status=404)

    try:

        return stream_video(request, obj.trailer)

        # with open(obj.trailer, 'rb') as f:
        #     return StreamingHttpResponse(f.read(), content_type='video/mp4')

    except Exception as e:
        print(e)
        return HttpResponse(status=404)

def handleVideo(request, content_id):
    if not validateContentId(content_id):
        return HttpResponse(status=404)

    try:
        obj = Library.objects.get(content_id=content_id)

    except Library.DoesNotExist:
        return HttpResponse(status=404)

    if not obj.file:
        return HttpResponse(status=404)

    try:

        return stream_video(request, obj.file)

        # with open(obj.trailer, 'rb') as f:
        #     return StreamingHttpResponse(f.read(), content_type='video/mp4')

    except Exception as e:
        print(e)
        return HttpResponse(status=404)

def handleTitle(filter, count):
    print('retried titile')
    # Retrieve all titles
    if not filter:
        try:
            obj = Library.objects.all().filter(size__exact = F('size_uploaded')).values('content_id')
            print(len(obj))


        except Library.DoesNotExist:
            return httpresponse(status=404)

        res = []
        for m in obj:
            print(m['content_id'])
            res.append(m['content_id'])

        return JsonResponse({'titles': res})
        return HttpResponse(status=200)

def handleComplete(request):
    print('handle complete')
    host = request.get_host()
    upload_id, id = None, None

    if 'id' in request.GET:
        content_id = request.GET['id']

    if 'upload_id' in request.GET:
        upload_id = request.GET['upload_id']

    if not content_id:
        return HttpResponse(status=400)

    if not upload_id:
        return HttpResponse(status=400)

    if not validateContentId(content_id):
        return HttpResponse(status=400)

    try:
        obj = Library.objects.get(hash = upload_id)

        if obj.size_uploaded < obj.size:
            return HttpResponse(status=400)

        r = requests.get('http://' + host + '/metadata/movie/?id=' + content_id)
        if r.status_code == 200:
            m = r.json()


            # Download poster
            if 'poster_url' in m:
                print('poster_url')
                filetype = m['poster_url'].split('.')[-1]
                d = os.path.dirname(obj.file)
                file_name = os.path.join(d, obj.content_id + '.' + filetype)
                print(file_name)

                poster_url = m['poster_url'].split('._')[0] + '.' + filetype
                print(poster_url)

                if poster_url:
                    with urllib.request.urlopen(poster_url) as response, open(file_name, 'wb') as out_file:
                        shutil.copyfileobj(response, out_file)

                    obj.poster = file_name
                else:
                    obj.poster = None

            # Download trailer
            if 'metacritic_url' in m:
                print(m['metacritic_url'])
                trailer_url = getTrailerUrl(m['metacritic_url'])
                print(trailer_url)


                if trailer_url:
                    filetype = trailer_url.split('.')[-1].split('?')[0]
                    d = os.path.dirname(obj.file)
                    file_name = os.path.join(d, obj.content_id + '_preview.' + filetype)
                    print(file_name)

                    with urllib.request.urlopen(trailer_url) as response, open(file_name, 'wb') as out_file:
                        shutil.copyfileobj(response, out_file)

                    obj.trailer = file_name

                else:
                    obj.trailer = None




            # getTrailerUrl(m)

        #     # print(json.load(s))
            # print(r.json())
            #
            # with urllib.request.urlopen(url) as response, open(file_name, 'wb') as out_file:
            #     shutil.copyfileobj(response, out_file)
            # pass
        # c = Client()
        # res = c.get('/metadata/movie/?id=' + content_id)

        # print(res)
        print(host)
        print(content_id)
        print('finished')

        obj.complete = True

        obj.save()

        return HttpResponse(status=200)

    except Library.DoesNotExist:
        return HttpResponse(status=400)

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

# WARNING: Deletes any previous instance of the file.
# Do not call this function unless this is the intention
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

    if not name or not size or not lastModified or not id:
        return HttpResponse(status=400)

    if not validateContentId(id):
        return HttpResponse(status=400)

    if not validateFilename(name):
        return HttpResponse(status=400)

    # Check for valid file type
    filetype = name.split('.')[-1]
    if not filetype in settings.UPLOAD_ACCEPTED_FILETYPES:
        return HttpResponse(status=400)

    # Get file hash
    val = str(size) + str(name) + str(lastModified)
    h = get_hash(val)

    d = os.path.join(settings.MEDIA_ROOT, id)
    if not os.path.exists(d):
        os.makedirs(d)

    # Create empty file to initiate file upload
    # Deletes any content if exists
    f = os.path.join(d, id + '.' + filetype)
    with open(f, 'w') as fp:
        fp.write('')

    try:
        # Update the library database to reset file upload
        obj = Library.objects.get(hash = h)

        obj.content_id = id
        obj.size_uploaded = 0
        obj.size = size
        obj.lastModified = lastModified
        obj.name = name
        obj.save()

        return JsonResponse({'upload_id': h})


    except Library.DoesNotExist:
        print('excepitgn')
        # Add file item to the library database
        l = Library(
        content_id = id,
        filename = name,
        file = f,
        type = filetype,
        size_uploaded = 0,
        size = size,
        hash = h
        ).save()

        return JsonResponse({'upload_id': h})

    return HttpResponse(status=400)


def handleChunk(request):

    upload_id, offset, chunk = None, None, None
    if 'upload_id' in request.GET:
        upload_id = request.GET['upload_id']

    if 'offset' in request.GET:
        offset = request.GET['offset']

    if len(request.body) > 0:
        chunk = request.body

    if not upload_id or not offset or not chunk:
        return JsonResponse(ERROR_MSG, status=400)

    try:
        offset = int(offset)
        obj = Library.objects.get(hash = upload_id)

        if obj.size == obj.size_uploaded:
            return HttpResponse(status=400)

        if not obj.size_uploaded == offset:
            return JsonResponse({'offset': obj.size_uploaded})
        if (obj.size_uploaded + len(chunk)) > obj.size:
            return HttpResponse(status=400)

        if not os.path.getsize(obj.file) == obj.size_uploaded:
            return HttpResponse(status=400)

        with open(obj.file, 'ab') as fp:
            fp.write(chunk)

        obj.size_uploaded = obj.size_uploaded + len(chunk)
        obj.save()

        return JsonResponse({'offset': obj.size_uploaded})

    except Library.DoesNotExist:
        return HttpResponse(status=400)

    return HttpResponse(status=400)



# Return information about file
def handleFileInfo(request):

    size, name, lastModified = None, None, None
    if 'size' in request.GET:
        size = request.GET['size']
    if 'name' in request.GET:
        name = request.GET['name']
    if 'lastModified' in request.GET:
        lastModified = request.GET['lastModified']

    if not name or not size or not lastModified:
        return HttpResponse(status=400)

    val = str(size) + str(name) + str(lastModified)

    h = get_hash(val)

    info = {
        'exists': False,
        'size': 0,
        'id': h,
        'size': size,
        'size_uploaded': 0,
        'name': name,
        'lastModified': lastModified
    }

    print('Info about file ID: ', h)

    try:
        res = Library.objects.filter(hash=h)

        if(len(res) > 0):
            res = res.values()[0]
            info['exists'] = True
            info['size'] = res['size']
            info['size_uploaded'] = res['size_uploaded']
            info['id'] = h
            print(h, 'exists in lib')
        else:
            raise Library.DoesNotExist()

    except Library.DoesNotExist:
        print(h, 'does not exist')
        return JsonResponse(info)

# return json with file sizez etc
    return JsonResponse(info)

# Return information about file
def handleIdInfo(request):

    if not 'id' in request.GET:
        return HttpResponse(status=400)

    id = request.GET['id']
    if not validateContentId(id):
        return HttpResponse(status=400)

    try:
        res = Library.objects.filter(content_id=id)

        if(len(res) > 0):
            return JsonResponse({'exists': True, 'size': res.values()[0]['size']})

        else:
            raise Library.DoesNotExist()

    except Library.DoesNotExist:
        return JsonResponse({'exists': False})

def handleDelete(id):
    try:
        if validateContentId(id):
            res = Library.objects.get(content_id=id)
        elif validateFileId(id):
            res = Library.objects.get(hash=id)
        else:
            return HttpResponse(status=400)

        # obj = Library.objects.delete(hash = upload_id)
        # obj.save()

        # Delete directory with all the content related to the file
        print(res.file)
        print(os.path.dirname(res.file))
        d = os.path.dirname(res.file)
        if os.path.isdir(d):
            shutil.rmtree(d)



        res.delete()
        print('deleted')


        return HttpResponse(status=200)

        if(len(res) > 0):
            content = res.values()[0]

            try:
                p = os.path.dirname(content['file'])
                # os.remove(content['file'])
                shutil.rmtree(p)

                return HttpResponse(status=200)
            except:
                return HttpResponse(status=400)
        else:
            raise Library.DoesNotExist()

    except Library.DoesNotExist:
        pass

    return HttpResponse(status=400)


# WARNING: Deletes all library content including database, files and metadata.
def handleDestroy():
    print('DESTROYING DATABASE')
    pass
