from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .movapi import Movie

def movapi(request):

    print('movapi here')


    if 'imdbid' in request.GET:
        j = Movie.imdb_id(request.GET['imdbid'])

        if not j:
            return JsonResponse({'status': 'imdb id not valid'}, status=400)

        return JsonResponse(j)



    # print(j)
    # return HttpResponse('yes')
    return JsonResponse({})
