from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from metadata.models import MovieMetadata

from .movapi import Movie

def movie(request):
    if 'search' in request.GET:
        q = request.GET['search']

        res = Movie.search(q)

        print(type(res))
        if type(res) == type({}):
            res = [res]
        print(type(res))
        return JsonResponse(res, safe=False)


    elif 'id' in request.GET:
        i = request.GET['id']

        try:
            res = MovieMetadata.objects.filter(id=i)
            # print(res.title)
        except MovieMetadata.DoesNotExist:
            print('doenst exits')
            res = None

        # for key, val in res:
        #     print(key, val)


        # return JsonResponse(res, safe=False)
        # Search metadatabase here first
        if res:
            return JsonResponse(res.values()[0])

        else:
            res = Movie.imdb_id(i)

            if not res:
                return JsonResponse({'status': 'imdb id not valid'}, status=400)

            for val in res:
                print(val)
                print(res[val])


            # Save metadata to database
            m = MovieMetadata(
                **res
            ).save()

            return JsonResponse(res)

            # Save to metadatabase here


        # print(res)







    # return HttpResponse('yes')
    return HttpResponse(status=400)
