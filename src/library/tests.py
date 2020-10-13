from django.test import TestCase
from django.test import Client

from library.models import Library
import os, json, time

testfile = 'inception.m4v'
content = 'this is the content of a test file'

def statsTestfile(filename):
    s = os.stat(filename)
    return {
        'size': s.st_size,
        'lastModified': s.st_mtime,
        'name': filename
    }

def createTestfile(filename):
    f = open(filename, 'w')
    f.write(content)
    f.close()

def removeTestfile(filename):
    os.remove(filename)

class LibraryTestCase(TestCase):
    def setUp(self):

        pass
        # Library.objects.create(
        #     content_id = 'tt1234567',
        #     file = '/tt1234567/tt1234567.mv4',
        #     filename = 'test.m4v',
        #     offset = 0,
        #     size = 1024,
        #     type = 'm4v',
        #     hash = 'fhaisofhdaiofho',
        #     complete = False
        # )

    #
    # def test_obj_created(self):
    #     o = Library.objects.get(content_id = 'tt1234567')
    #
    #     print('\nTesting create')
    #
    #     self.assertEqual(o.content_id, 'tt1234567')


    def test_file_info(self):

        print('')
        print('test_file_info')
        print('-------------------------|')

        c = Client()

        res = c.get('/library/info/file/')
        self.assertNotEqual(res.status_code, 200)

        res = c.get('/library/info/file/', {'size': 1024})
        self.assertNotEqual(res.status_code, 200)

        res = c.get('/library/info/file/', {'size': 1024, 'name': 'example.mv4'})
        self.assertNotEqual(res.status_code, 200)

        res = c.get('/library/info/file/', {'size': 1024, 'name': 'example.mv4', 'lastModified': time.time()})
        self.assertEqual(res.status_code, 200)

    def test_id_info(self):

        print('')
        print('test_id_info')
        print('-------------------------|')

        c = Client()

        res = c.get('/library/info/id/')
        self.assertNotEqual(res.status_code, 200)

        res = c.get('/library/info/id/', {'id': 'notvalidid'})
        self.assertNotEqual(res.status_code, 200)

        res = c.get('/library/info/id/', {'id': 'tt1234567'})
        self.assertEqual(res.status_code, 200)


    def test_file_upload(self):
        print('')
        print('test_file_upload')
        print('-------------------------|')

        createTestfile(testfile)

        # Create file object
        fileObj = statsTestfile(testfile)
        self.assertEqual(fileObj['size'], len(content))
        self.assertEqual(fileObj['name'], testfile)

        c = Client()

        # Get content id
        res = c.get('/metadata/movie/', {'search': testfile.split('.')[0]})
        self.assertEqual(res.status_code, 200)
        self.assertIn('id', res.json()[0])
        content_id = res.json()[0]['id']
        self.assertEqual(len(content_id), 9)
        self.assertRegex(content_id, r'[t]{2}[0-9]{7,8}')

        # File should not exist on server
        # Test info based on file
        res = c.get('/library/info/file/', fileObj)
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertEqual(res.json()['exists'], False)

        # File should not exist on server
        # Test info based on content id
        res = c.get('/library/info/id/', {'id': content_id})
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertEqual(res.json()['exists'], False)

        # Initiate upload
        res = c.get('/library/upload/',
            {**fileObj,
                **{'type': 'init', 'id': content_id}
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn('upload_id', res.json())
        upload_id = res.json()['upload_id']

        # File should now exist on server
        # Test info based on file
        res = c.get('/library/info/file/', fileObj)
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertIn('size', res.json())
        self.assertEqual(res.json()['exists'], True)
        self.assertEqual(res.json()['size'], 0)

        # Test info based on content id
        res = c.get('/library/info/id/', {'id': content_id})
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertIn('size', res.json())
        self.assertEqual(res.json()['exists'], True)
        self.assertEqual(res.json()['size'], 0)

        # Test chunk upload
        with open(testfile, 'rb') as fp:
            chunk_size = 1
            offset = 0
            testval = 0
            while offset < len(content):
                fp.seek(offset)
                b = fp.read(chunk_size)

                res = c.post('/library/upload/?type=chunk&upload_id=' + upload_id + '&offset=' + str(offset),
                    data=b,
                    content_type='application/octet-stream'
                )

                self.assertEqual(res.status_code, 200)
                self.assertIn('offset', res.json())
                offset = res.json()['offset']

                # Handle wrong offset
                testval += 1
                if testval % 3 == 0:
                    res = c.post('/library/upload/?type=chunk&upload_id=' + upload_id + '&offset=' + str(offset-1),
                        data=b,
                        content_type='application/octet-stream'
                    )

                    self.assertNotEqual(res.status_code, 200)

                # Test info
                if testval % 10 == 0:
                    res = c.get('/library/info/file/', fileObj)
                    self.assertEqual(res.status_code, 200)
                    self.assertIn('exists', res.json())
                    self.assertIn('size', res.json())
                    self.assertEqual(res.json()['exists'], True)
                    self.assertEqual(res.json()['size'], offset)



        res = c.post('/library/upload/?type=chunk&upload_id=' + upload_id + '&offset=' + str(len(content) - 10),
            data='outsidedata',
            content_type='application/octet-stream'
        )
        self.assertNotEqual(res.status_code, 200)

        # File should now exist on server
        # Test info based on file
        res = c.get('/library/info/file/', fileObj)
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertIn('size', res.json())
        self.assertEqual(res.json()['exists'], True)
        self.assertEqual(res.json()['size'], len(content))

        # Test info based on content id
        res = c.get('/library/info/id/', {'id': content_id})
        self.assertEqual(res.status_code, 200)
        self.assertIn('exists', res.json())
        self.assertIn('size', res.json())
        self.assertEqual(res.json()['exists'], True)
        self.assertEqual(res.json()['size'], len(content))


        # Clean up
        print('Deleting test object')
        res = c.delete('/library/delete/?content_id=' + content_id)
        self.assertEqual(res.status_code, 200)


        removeTestfile(testfile)
