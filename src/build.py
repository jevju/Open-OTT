import subprocess

FRONTEND_APPLICATION =  'frontend'

def buildFrontend():
    print('Building frontend application')
    subprocess.call(['npm', 'run', 'build', '--prefix', FRONTEND_APPLICATION])
    subprocess.call(['rm', '-rf', './assets'])
    subprocess.call(['mv', './' + FRONTEND_APPLICATION + '/build', './assets'])


if __name__ == '__main__':
    buildFrontend()
