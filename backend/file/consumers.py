import json
from channels.generic.websocket import WebsocketConsumer
from filebrowser.base import FileListing, FileObject
from filebrowser.sites import site

from .models import File
import soundfile as sf
import math

site.directory = "/audio/"


class FileConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(json.dumps({'message': 'welcome!'}))

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        if message == 'rescan':
            fileListing = FileListing(
                site.storage.location + site.directory)
            fileList = fileListing.walk()
            index = 0
            updated = 0
            for file in fileList:
                file_object = FileObject(file)
                if file_object.extension == '.wav' or file_object.extension == '.flac':
                    try:
                        metadata = sf.info(file_object.path)

                        file_item = {
                            "filename": file_object.filename,
                            "dirname": file_object.dirname,
                            "path": file_object.path,
                            "filesize": file_object.filesize,
                            "datetime": file_object.datetime,
                            "duration": math.ceil(metadata.duration * 1000) / 1000,
                        }

                        file_instance = File.objects.filter(
                            filename=file_item['filename'])

                        if not file_instance:

                            file_instance = File(
                                filename=file_item['filename'],
                                dirname=file_item['dirname'],
                                path=file_item['path'],
                                filesize=file_item['filesize'],
                                datetime=file_item['datetime'],
                                duration=file_item['duration'],
                            )
                            file_instance.save()

                        elif file_instance[0].path != file_item['path']:

                            file_instance[0].path = file_item['path']
                            file_instance[0].dirname = file_item['dirname']
                            file_instance[0].save()
                            updated = updated + 1

                        index = index + 1

                        if index < 20:
                            self.send(json.dumps({
                                "type": "file",
                                "filename": file_item['filename'],
                                "index": index,
                            }))
                        elif index % 50 == 0 and index < 1000:
                            self.send(json.dumps({
                                "type": "file",
                                "filename": file_item['filename'],
                                "index": index,
                            }))
                        elif index % 100 == 0:
                            self.send(json.dumps({
                                "type": "file",
                                "filename": file_item['filename'],
                                "index": index,
                            }))

                    except RuntimeError as e:
                        self.send(json.dumps({'error': str(e)}))

            self.send(json.dumps(
                {'type': 'scan', 'total': index, "updated": updated}))

        if message == 'verify':
            deleted = 0
            index = 0
            files = File.objects.values()
            for file in files:
                try:
                    sf.info(file['path'])
                    if file['deleted'] == True:
                        restored_file = File.objects.get(
                            filename=file['filename'])
                        restored_file.deleted = False
                        restored_file.save()

                    index = index + 1
                    if index < 20:
                        self.send(json.dumps({
                            "type": "file",
                            "filename": file['filename'],
                            "index": index,
                        }))
                    elif index % 50 == 0 and index < 1000:
                        self.send(json.dumps({
                            "type": "file",
                            "filename": file['filename'],
                            "index": index,
                        }))
                    elif index % 100 == 0:
                        self.send(json.dumps({
                            "type": "file",
                            "filename": file['filename'],
                            "index": index,
                        }))
                except RuntimeError as e:
                    deleted_file = File.objects.get(
                        filename=file['filename'])
                    deleted_file.deleted = True
                    deleted_file.save()
                    deleted = deleted + 1

            self.send(json.dumps(
                {'type': 'verify', 'total': index, 'updated': deleted}))
