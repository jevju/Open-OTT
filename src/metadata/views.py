from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from metadata.models import MovieMetadata

from .movapi import Movie

import re

# Check for valid content_id pattern
def validateContentId(content_id):
    p = re.compile(r'[t]{2}[0-9]{7,8}')
    if not p.search(content_id):
        return False
    return True

def movie(request):
    if 'search' in request.GET:
        q = request.GET['search']
        print('got search therm')
        print(q)

        res = Movie.search(q)

        print(type(res))
        if type(res) == type({}):
            res = [res]
        print(type(res))
        return JsonResponse(res, safe=False)


    elif 'id' in request.GET:
        i = request.GET['id']

        ids = i.split(',')

        ids = list(filter(validateContentId, ids))

        titles = []

        try:
            res = list(MovieMetadata.objects.filter(id__in=ids).values())

            for l in res:
                titles.append(l)

            # print(res.title)
        except MovieMetadata.DoesNotExist:
            res = None


        # for key, val in res:
        #     print(key, val)


        # return JsonResponse(res, safe=False)
        # Search metadatabase here first
        if res:
            if len(titles) > 1:
                return JsonResponse(titles, safe=False)
            elif len(titles) > 0:
                return JsonResponse(titles[0])



        elif len(ids) < 1:
            return HttpResponse(status=404)

        else:
            res = Movie.imdb_id(ids[0])

            if not res:
                return JsonResponse({'status': 'imdb id not valid'}, status=400)

            # for val in res:
            #     print(val)
            #     print(res[val])


            # Save metadata to database
            m = MovieMetadata(
                **res
            ).save()

            return JsonResponse(res)

            # Save to metadatabase here


        # print(res)

    # return HttpResponse('yes')
    return HttpResponse(status=400)
