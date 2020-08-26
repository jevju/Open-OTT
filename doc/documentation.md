<!-- Copy and paste the converted output. -->

 <!-----
 NEW: Check the "Suppress top comment" option to remove this info from the output.

 Conversion time: 1.003 seconds.


 Using this Markdown file:

 1. Paste this output into your source file.
 2. See the notes and action items below regarding this conversion run.
 3. Check the rendered output (headings, lists, code blocks, tables) for proper
    formatting and use a linkchecker before you publish this page.

 Conversion notes:

 * Docs to Markdown version 1.0β29
 * Wed Aug 26 2020 02:16:19 GMT-0700 (PDT)
 * Source doc: Moviesite
 ----->



 ## Open OTT Streaming Service


 	 - [Open OTT Streaming Service](#open-ott-streaming-service)
 		 - [Introduction](#introduction)
 			 - [Requirements](#requirements)
 		 - [Server side parts](#server-side-parts)
 			 - [Adding files [client side]](#adding-files-[client-side])
 			 - [Resumable upload](#resumable-upload)
 			 - [Movapi (movie metadata API)](#movapi-(movie-metadata-api))
 			 - [Server monitor](#server-monitor)
 			 - [Database models](#database-models)
 		 - [Front end](#front-end)
 			 - [Initial registration and setup](#initial-registration-and-setup)
 			 - [Categories](#categories)
 			 - [Franchises](#franchises)
 			 - [Collections](#collections)
 			 - [Genres](#genres)
 		 - [Production setup/ build](#production-setup/-build)
 				 - [WSGI (Gunicorn)](#wsgi-(gunicorn))
 				 - [Web server (Nginx)](#web-server-(nginx))
 		 - [Future ideas](#future-ideas)
 			 - [React native for appleTV](#react-native-for-appletv)
 			 - [Centralized hosting for user data](#centralized-hosting-for-user-data)
 			 - [Backup server(s)](#backup-server(s))
 			 - [Mac OS status bar](#mac-os-status-bar)
 			 - [Docker to serve Nginx, WSGI and Django inside container](#docker-to-serve-nginx,-wsgi-and-django-inside-container)
 			 - [Nginx HTTPS (OpenSSL etc..)](#nginx-https-(openssl-etc..))




 ### Introduction   
 The goal is to make an open source on demand service by hosting a movie server and access the content through a web browser. Both administration of the movie library, and watching. This documentation is primarily meant as a reference guide while developing, addressing new ideas and problems and reflecting solutions, but may also be useful for whoever wants to gain a technical insight to the solutions and implementation of the system.


 #### Requirements  
 Easy to set up and use. Should be possible without further technical knowledge.

 Add movies by uploading them to a local server through a web browser. The server will handle adding it to the library as well as downloading all metadata.

 Front end built with react. Browse the movie library and stream movies within the web browser.

 Back end built with django

 -User authentication

 -database storage

 -movie metadata api

 -receive and organize file upload

 Description of how to set up a React app with Django as a backend. Follow step 4 to set up with a static server. https://stackoverflow.com/questions/53708640/how-to-configure-django-with-webpack-react-using-create-react-app-on-ubuntu-serv


 ### Server side parts  

 #### Adding files [client side]  
 The process of uploading movie files to the server can be a tedious task, when having hundreds or even thousands of movies in your collection. However, uploading each file through the web browser is chosen as the primary way of adding movies to the server for the following reasons:



 *   Manual movie title confirmation by the user makes sure the right metadata is added for the movie
 *   It ensures that the files are stored at the correct location on the server, and the server handles the downloading of external files such as cover pictures and trailers

 Some functionality is added as a help of speeding up the upload process. An upload queue makes it possible to select a bunch of files, then when the user confirms the ID of a movie, move it to the upload queue. It also supports simultaneously uploading multiple movies from the queue. The maximum number of simultaneous uploads must be determined at a later stage during testing.

 Detecting already uploaded files:

 Database table, original filename, size and last modified saved for each uploaded file on the server. A hash of size and last modified saved in a field. When selecting a file, filename, size and last modified information is sent to the server. The server hashes the size and last modified and lookup in the table. If a match is found, and the filename matches, the file already exists.

 Response is sent back with this information. The file does not show as an upload object to upload. If all selected files are already uploaded, this is shown to the user as a message.

 The server also needs to confirm that there is enough space available for the upload.

 Use the init request for these tests, if either file exists or server disk is full, respond with error. If not, return the hashed id as in step 1 of resumable download.

 After selecting movie id, request sent to server to search for already uploaded instances of the movie. If it exists, the user is given the opportunity to either overwrite existing upload, upload another version so the movie has multiple files, or cancel the upload.


 #### Resumable upload  
 Ensures reliable upload of large files. Since movie files can be of a big size (many GBs), it is important to have an upload system that can handle interruptions that may occur during the upload process. Following is a description of the implementation used to handle uploading of files to the server. The server takes care of adding the files to the correct location in the library after upload.

 The upload process is divided into the following steps, each with a specialized request.



 1. Initiate upload. Client sends file size and filename. Server responds with a hashed string of the query values that will represent the upload id, and will be the same for all chunks of the same file. The server also prepares a temporary directory to contain the received chunks belonging to the file. A json file with the received information is stored in the directory. The init is a GET request and contains no body.

 	HTTP GET request. Query type=init&size=[some_size_in_bytes]&lastModified=[some_timestamp]



 2. Chunk upload. The client sends chunks of the file together with the upload id and offset specifying what bytes of the file is being sent. Each chunk has an incremental chunk number to keep track of the process. If the received chunk’s number matches the previous chunk number + 1, the server appends the chunk to the file in the temporary directory. HTTP POST request, Query type=chunk&offset=[some_value]&chunkNr=[some_nr]&uploadId=[hashed_string]. Chunks are contained in the HTTP body.
 3. When all chunks are sent, the client sends a message to indicate the end of transmission. It contains the hashed string as a query parameter. If the uploaded file size equals the size provided in the init request, the server adds the file to the library.

     Query type=end&uploadId=[hashed_string]


 Note: Should find a way to detect already uploaded files. Either by filename, size, checksum etc.

 One way might be to store the hash value of filename + size for all uploaded files in a file or db on the server. Then compare the new file to see if it already exists. This will not detect any file or name change...

 ..But when the imdb-id for the selected file is confirmed by the user, the user will be shown already uploaded versions of the movie (if any), so that the user can choose to either upload another version, replace a current version, or cancel the upload.


 #### Movapi (movie metadata API)  
 API to retrieve movie metadata. Scrape IMDb

 Extended functionality to retrieve from rottentomatoes and downloading movie trailers etc


 #### Server monitor  
 Provides statistics such as storage information etc. warning when server starts to fill up.

 Monitor how many bytes of data sent and data received. (Django middleware for this?)

 Server side:

 API sends a json object of all data, or just requested parts.

 Client side:

 Retrieve json from API and show statistics with graphics.

 Can also use parts of information for instance to check storage on server before uploading

 The process of adding a movie:

 From the upload page the user selects one or more movie files located at the users computer. By analyzing filename, metadata in the file etc, the system tries to guess the movie based on IMDb search. The user either confirms the right movie, or manually searches in the uploader. Once the movie is confirmed, the uploading process may start. Uploading to the server using the resumable upload service. The server receives the file together with the movie’s IMDb id. Using movapi, the server downloads all metadata about the movie and append it to the database. It also downloads cover images and movie trailers.

 Movie library:

 The files are organized in the following way on the server.

 [imdb id]

 —[1080p]

 ——{mp4 file}

 —[srt]

 —[trailer]

 —[cover]

 ——{jpg file}

 [imdb id]


 #### Database models  
 Movie table

 Metadata about movies, retrieved from IMDb and other sources

 Movie library table

 Contains technical information about uploaded movies, such as resolution, play time etc. movieID as key

 Category table

 Contains categories as well as belonging to movie id’s. Maybe picture or icon to each category as well

 Collection table

 Contains movie collections. Movies belonging to the same sequence. Die Hard, Harry Potter etc

 User table

 Contains users, using django's authentication functionality here

 User settings

 Personalized user settings stored in this table. User id as reference. Can be personalized theme, or any other personal attribute related to how the site should behave for a certain user


 ### Front end  

 #### Initial registration and setup  
 The user has the option to either log in or create a new user account. After creating the account and logging in, the user is asked to select an existing movie library or create a new one. Creating a new one, the user needs to specify a location for the library. A default location is shown. Adding an existing library (using URL), the user must have user access to the library (from another user). If the movie library is empty, the user is taken directly to the upload page.

 The main page is an “infinite scroll” of categories, collections and franchises. Each row is a carousel of movies.


 #### Categories  
 List of categories to show when browsing movies. Categories with belonging movies stored in the categories db table.


 #### Franchises  
 List of movie franchises to show when browsing movies. Stored in the collections db table

 Top action/ adventure franchises here

 [https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg](https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg)


 #### Collections  

 #### Genres  

 ### Production setup/ build  

 ##### WSGI (Gunicorn)  
 The default server provided through Django is only meant for development and should never be used in production. Instead a WSGI server is used to host the Django application. Django comes with wsgi.py that contains the python callable used by the WSGI server. There are several WSGI server options available. Gunicorn is used in this setup as it is a reliable server with an easy setup. Installation is available through pip. Gunicorn might be replaced by uWSGI at a later point as it tends to be faster and Nginx supports the uWSGI protocol natively.


 ##### Web server (Nginx)  
 The web server is listening on port 80, and configured as a reverse proxy to forward incoming requests to the WSGI server, and sends the response from the Django application back to the client.

 Nginx installation and configuration for OSX (nginx_install.sh):

 The script downloads and builds Nginx from source under /usr/local/nginx/. Then it creates a .plist file for OSX to launch Nginx after boot. Finally the nginx.conf file is configured to serve the Django application.

 Do the following changes in /usr/local/etc/nginx/nginx.conf:

 -Deactivating client_max_file_size by setting it to 0 in the bottom of the server {} section

 -Changing listening port from 8080 to 80.

 - In location / {} add [proxy_pass [http://127.0.0.1:8000](http://127.0.0.1:8000);]

 Resources used for making script:

 -Option 2 in this link explains how to set up OSX to automatically start Nginx at startup using launchdaemon. This has been tried with luck. Now added to the nginx_install script [https://stepquick.net/start-nginx-at-launch-on-mavericks/](https://stepquick.net/start-nginx-at-launch-on-mavericks/)

 -Build nginx from source. Is the PCR library really needed?

 [https://gist.github.com/beatfactor/a093e872824f770a2a0174345cacf171](https://gist.github.com/beatfactor/a093e872824f770a2a0174345cacf171)

 TODO: Improve script to handle the case of already installed nginx, or another server such as apache already listening to port 80.


 ### Future ideas  

 #### React native for appleTV   
 Compile to an iOS app to run the front end as an Apple TV app. May also compile to android (run directly on smart tv?) or mobile apps. This opens up the possibility of not having to use a web browser to access the front end, and ideally Apple TV’s remote can be used to browse the front end app.


 #### Centralized hosting for user data  
 Having a public site for users to register and holds all accounts. Then users register their local movie servers. Makes it possible to link several users to the same movie server.

 When installing a movie server, the user prompts a token linked to the user. It will show up in the users browser and now possible to interact with the server. Multiple users may have access to one server, and one user may have access to multiple servers, providing a larger movie library by merging the content when accessed in the browser.


 #### Backup server(s)  
 Having the ability to host multiple servers for backup purposes as well as choosing the closest server to stream from. The servers need to synchronize in order to always have the same state in terms of uploaded files. Look into rsync, to see if it can be used to synchronize the media library folder.


 #### Mac OS status bar  
 When the server is running as a daemon on the mac OSX, an icon is shown in the status bar to show notifications, settings etc. Look into Rums (Python package) or PyObjC to achieve this in python.


 #### Docker to serve Nginx, WSGI and Django inside container  
 [https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)


 #### Nginx HTTPS (OpenSSL etc..)
