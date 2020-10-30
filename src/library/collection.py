from django.http import JsonResponse, HttpResponse
from django.core import serializers

from .models import Collection

import json

# Creates a new collection
def createCollection(body):
    if not 'name' in body or not 'type' in body:
        return HttpResponse(status=400)

    content = []
    if 'content' in body:
        if type(body['content']) == type([]):
            content = body['content']

    m = Collection(
        name = body['name'],
        type = body['type'],
        content = content
    ).save()

    return HttpResponse(status=201)

# Updates a collection using collection id
def updateCollection(id, body):

    if not 'name' in body or not 'type' in body:
        return HttpResponse(status=400)

    content = []
    if 'content' in body:
        if type(body['content']) == type([]):
            content = body['content']

    try:
        c = Collection.objects.get(id=id)
    except:
        return HttpResponse(status=404)

    c.name = body['name']
    c.type = body['type']
    c.content = content
    c.save()

    return HttpResponse(status=200)

def getCollection(id=None):

    if id:
        col = Collection.objects.filter(id=id).values()

    else:
        col = Collection.objects.all().values()

    res = []
    for c in col:
        res.append(c)

    if len(res) > 0:
        return JsonResponse(res, safe=False, json_dumps_params={'indent': 4})

    else:
        return HttpResponse(status=404)


def deleteCollection(id):
    try:
        Collection.objects.get(id=id).delete()
    except:
        return HttpResponse(status=404)

    return HttpResponse(status=200)
