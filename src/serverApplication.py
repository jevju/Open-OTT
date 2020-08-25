
import time
import rumps

WSGI_APPLICATION = 'gunicorn --bind 0.0.0.0:8000 src.wsgi'
ICON = 'serverApplication.png'


class ServerApplication(rumps.App):
    def __init__(self, name, icon=None):

        self.application = subprocess.Popen(WSGI_APPLICATION, shell=True)
        super().__init__(name=name, quit_button=None, icon=icon)


    @rumps.clicked('dummy')
    def dummy(self, sender):

        sender.state = not sender.state


    @rumps.clicked('Quit')
    def quit(self, sender):

        self.application.terminate()
        rumps.quit_application(self)


if __name__ == '__main__':

    ServerApplication('Server', icon=ICON).run()
