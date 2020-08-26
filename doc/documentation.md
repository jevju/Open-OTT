# Open OTT 
 
 
  - [Open OTT](#open-ott)
  - [Introduction](#introduction)
 		 - [Requirements](#requirements)
  - [Library](#library)
 	 - [Adding to the library](#adding-to-the-library)
 		 - [Filter out already uploaded files](#filter-out-already-uploaded-files)
 		 - [Disk capacity confirmation](#disk-capacity-confirmation)
 		 - [Identity confirmation](#identity-confirmation)
 		 - [File upload](#file-upload)
 	 - [Updating the library](#updating-the-library)
 	 - [Streaming from the library](#streaming-from-the-library)
 	 - [Deleting from the library](#deleting-from-the-library)
  - [Movie metadata](#movie-metadata)
 		 - [Movapi (movie metadata API)](#movapi-(movie-metadata-api))
 		 - [Server monitor](#server-monitor)
 		 - [Database table models](#database-table-models)
  - [Front end](#front-end)
 		 - [Initial registration and setup](#initial-registration-and-setup)
 		 - [Responsive design](#responsive-design)
 		 - [Categories](#categories)
 		 - [Franchises](#franchises)
 		 - [Collections](#collections)
 		 - [Genres](#genres)
  - [Production environment (setup/ build)](#production-environment-(setup/-build))
 			 - [WSGI (Gunicorn)](#wsgi-(gunicorn))
 			 - [Web server (Nginx)](#web-server-(nginx))
  - [Future ideas](#future-ideas)
 		 - [React native for appleTV](#react-native-for-appletv)
 		 - [Centralized hosting for user data](#centralized-hosting-for-user-data)
 		 - [Server Side transcoding](#server-side-transcoding)
 		 - [Backup server(s)](#backup-server(s))
 		 - [OSX status bar](#osx-status-bar)
 		 - [Server configuration page](#server-configuration-page)
 		 - [Docker to serve Nginx, WSGI and Django inside container](#docker-to-serve-nginx,-wsgi-and-django-inside-container)
 		 - [Nginx HTTPS (OpenSSL etc..)](#nginx-https-(openssl-etc..))
 		 - [Music library](#music-library)
 		 - [Photo library](#photo-library)

 
 
 
 # Introduction   
 Open OTT is ...
 
 The goal is to make an open source on demand service by hosting a movie server and access the content through a web browser. Both administration of the movie library, and watching. This documentation is primarily meant as a reference guide while developing, addressing new ideas and problems and reflecting solutions, but may also be useful for whoever wants to gain a technical insight to the solutions and implementation of the system.
 
 
 ### Requirements  
 Easy to set up and use. Should be possible without further technical knowledge.
 
 Add movies by uploading them to a local server through a web browser. The server will handle adding it to the library as well as downloading all metadata.
 
 Front end built with react. Browse the library and stream movies within the web browser.
 
 Back end built with django
 
 -User authentication
 
 -database storage
 
 -movie metadata api
 
 -receive and organize file upload
 
 Description of how to set up a React app with Django as a backend. Follow step 4 to set up with a static server. https://stackoverflow.com/questions/53708640/how-to-configure-django-with-webpack-react-using-create-react-app-on-ubuntu-serv
 
 
 # Library  
 This section is about managing the content of the library. The support for a big content library demands certain requirements, as it is easy to lose track as the content grows. Core functionality of the library management includes:
 
 
 
 *   A strong search algorithm
 *   Strict handling of adding, modifying and deleting files
 *   Good metadata mapping
 *   Avoiding unwanted duplicates
 
 
 
 
 ## Adding to the library   
 Adding files to the library is performed by uploading each file through the upload section using a web browser, having the user confirm the movie id before uploading. This is chosen as the preferred and only way of adding movie files to the server for a couple of reasons. Knowing the right movie id of a movie is crucial when collecting metadata, and having the user confirming the movie id before uploading helps achieve this.
 
 By having the system receiving the files through the specially designed upload channel, it is ensuring correct placement of the files in the library, execution of necessary updates to the database, downloading and saving related metadata, posters and trailers, and simply limiting the risk of issues related broken paths by not finding the requested files. The system may also reject any invalid operation attempts done to the library.
 
 This way of adding files to the library does not come without cons. The process of uploading files to the server can be a tedious task, especially when having hundreds or even thousands of movies in the collection. To lighten up the upload process, an upload queue makes it possible to select a bunch of files, letting the user edit and confirm the movie id for each file. Then when the movie id is confirmed by the user, it is added to the upload queue. The feature of simultaneous uploads is considered to be added at a later stage, but for now it is set to sequentially uploading one file at a time.  
 
 
 ### Filter out already uploaded files  
 The uploading of files to the server’s library is likely to be performed in steps, either because there is too much to upload in one session, or new files might be added at a later point. To prevent the user from trying to select local files that are already uploaded to the server, an algorithm for filtering out these uploaded files aims to solve the issue. Upon file selection, information about the file is sent to the server as an “exists” request. The file information includes the file’s name, size and last modified timestamp. The server holds a database table of this information about all files in the library, stored as a hashed string. If the hash of the information received in the request matches any entry in the table, the server responds with a positive value implying that the file exists on the server. The file selection will then be ignored, restricting the user from uploading it. This approach comes with a limitation of not detecting any changes done to the file locally. For instance if the filename gets changed locally after upload, the user will have the ability to upload the file. Confirmation of the movie id will however deal with this case by revealing that there is already a version of the movie in the library.
 
 NOTE: Another approach to detect uploaded files could be to send the metadata chunk of the file container, and compare this on the server. This might even detect a local filename change.
 
 
 ### Disk capacity confirmation  
 Make sure there is enough space available on the server’s disk before uploading. It can be solved in the following way: Together with the “exists” request, the server looks at the sum of all sizes given in the file information list. This value is compared by the remaining space available. Also add a buffer to not fill up the disk completely. If there is not enough space available, the file should not be uploaded, and the user should get notified.
 
 Alternatively this can be checked in the prepare or init message.
 
 A third alternative is for the server to retrieve the space available value, then do the tests itself. This might not be the best solution as the server should not trust the client on this.
 
 The server also needs to confirm that there is enough space available for the upload.
 
 
 ### Identity confirmation  
 The ability to map metadata to all uploaded content on the server is important to avoid any unknown files, both for the sake of the user and the system. Being able to identify all files helps by avoiding upload duplicates as well. For that reason the server has a strict policy of not accepting any file for uploading that does not have a confirmed id.
 
 After selecting movie id, request sent to server to search for already uploaded instances of the movie. If it exists, the user is given the opportunity to either overwrite existing upload, upload another version so the movie has multiple files, or cancel the upload.
 
 
 ### File upload  
 Ensures reliable upload of large files. Since movie files can be of a big size (many GBs), it is important to have an upload system that can handle interruptions that may occur during the upload process. Following is a description of the implementation used to handle uploading of files to the server. The server takes care of adding the files to the correct location in the library after upload.
 
 The upload process is divided into the following steps, each with a specialized request.
 
 
 
 1. Initiate upload. Client sends file size and filename. Server responds with a hashed string of the query values that will represent the upload id, and will be the same for all chunks of the same file. The server also prepares a temporary directory to contain the received chunks belonging to the file. A json file with the received information is stored in the directory. The init is a GET request and contains no body.
 
 	HTTP GET request. Query type=init&size=[some_size_in_bytes]&lastModified=[some_timestamp]
 
 
 
 2. Chunk upload. The client sends chunks of the file together with the upload id and offset specifying what bytes of the file is being sent. Each chunk has an incremental chunk number to keep track of the process. If the received chunk’s number matches the previous chunk number + 1, the server appends the chunk to the file in the temporary directory. HTTP POST request, Query type=chunk&offset=[some_value]&chunkNr=[some_nr]&uploadId=[hashed_string]. Chunks are contained in the HTTP body.
 3. When all chunks are sent, the client sends a message to indicate the end of transmission. It contains the hashed string as a query parameter. If the uploaded file size equals the size provided in the init request, the server adds the file to the library.
 
     Query type=end&uploadId=[hashed_string]
 
 
 Dynamic chunk size:
 
 Run tests to optimize the algorithm. Provide test results here.
 
 Performance issue detected, the web browser running at 100% CPU when sending too many chunks at the same time. The algorithm should aim to send a certain amount of chunks per time, and adjust the chunk size to meet this number. For instance 2 chunks per second. Slow connection, smaller chunks, fast connection, bigger chunks.
 
 
 ## Updating the library  
 How to update files in the library, doing changes etc
 
 
 ## Streaming from the library  
 If multiple versions of a movie is available, the file to stream from is either pre-determined by the application or selected by the user (select resolution quality). Adaptive bitrate streaming protocols also fall under this section, selecting the best quality available for the network capacity.
 
 
 ## Deleting from the library  
 Remove from file database before deleting
 
 
 # Movie metadata  
 
 ### Movapi (movie metadata API)  
 API to retrieve movie metadata. Scrape IMDb
 
 Extended functionality to retrieve from rottentomatoes and downloading movie trailers etc
 
 TODO: Implement cache.
 
 All results are saved in a database. When movapi receives a request, it starts by searching in the table for the movie. If the movie is found in the table, it is returned in the response. If not, retrieve it from IMDB and save it in the table before returning the response. The cache speeds up the search for movies already retrieved, and it prevents unnecessary requests to IMDB.
 
 
 ### Server monitor  
 Provides statistics about the server such as disk capacity etc. warning when server starts to fill up.
 
 Monitor how many bytes of data sent and data received. (Django middleware for this?)
 
 Library statistics, number of files, HD vs non HD etc
 
 Server side:
 
 API sends a json object of all data, or just requested parts.
 
 Client side:
 
 Retrieve json from API and show statistics with graphics.
 
 Can also use parts of information for instance to check storage on server before uploading
 
 The process of adding a movie:
 
 From the upload page the user selects one or more movie files located at the users computer. By analyzing filename, metadata in the file etc, the system tries to guess the movie based on IMDb search. The user either confirms the right movie, or manually searches in the uploader. Once the movie is confirmed, the uploading process may start. Uploading to the server using the resumable upload service. The server receives the file together with the movie’s IMDb id. Using movapi, the server downloads all metadata about the movie and append it to the database. It also downloads cover images and movie trailers.
 
 Content library:
 
 The files are organized in the following way on the server.
 
 [imdb id]
 
 —[1080p]
 
 ——{mp4 file}
 
 —[srt]
 
 —[trailer]
 
 —[cover]
 
 ——{jpg file}
 
 [imdb id]
 
 
 ### Database table models  
 Movie table
 
 Metadata about movies, retrieved from IMDb and other sources
 
 Movie library table
 
 Contains technical information about uploaded movie files, such as resolution, play time,  etc. movieID as key
 
 Category table
 
 Contains categories as well as belonging to movie id’s. Maybe picture or icon to each category as well
 
 Collection table
 
 Contains movie collections. Movies belonging to the same sequence. Die Hard, Harry Potter etc
 
 User table
 
 Contains users, using django's authentication functionality here
 
 User settings
 
 Personalized user settings stored in this table. User id as reference. Can be personalized theme, or any other personal attribute related to how the site should behave for a certain user
 
 
 # Front end  
 
 ### Initial registration and setup  
 The user has the option to either log in or create a new user account. After creating the account and logging in, the user is asked to select an existing movie library or create a new one. Creating a new one, the user needs to specify a location for the library. A default location is shown. Adding an existing library (using URL), the user must have user access to the library (from another user). If the movie library is empty, the user is taken directly to the upload page.
 
 The main page is an “infinite scroll” of categories, collections and franchises. Each row is a carousel of movies.
 
 
 ### Responsive design  
 Make it easy to navigate on small screens.
 
 Maybe remove some functionality, like uploading files.
 
 Either use a m. domain, or just detect screen size.
 
 
 ### Categories  
 List of categories to show when browsing movies. Categories with belonging movies stored in the categories db table.
 
 
 ### Franchises  
 List of movie franchises to show when browsing movies. Stored in the collections db table
 
 Top action/ adventure franchises here
 
 [https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg](https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg)
 
 
 ### Collections  
 
 ### Genres  
 
 # Production environment (setup/ build)  
 This section is not about the OTT application itself, but describes an approach of how to prepare and run it in a production environment. Even if the system is only meant to be run locally, it is preferred to have a stable and solid environment to run inside. The setup provides functionality like start on system boot and always keep alive. Note that there are many ways of serving a system like this, and this is not a claim of being the best way to do it. Nonetheless this is a proven setup, which should work for most cases.
 
 
 #### WSGI (Gunicorn)  
 The default server provided through Django is only meant for development and should never be used in production. Instead a WSGI server is used to host the Django application. Django comes with wsgi.py that contains the python callable used by the WSGI server. There are several WSGI server options available. Gunicorn is used in this setup as it is a reliable server with an easy setup. Installation is available through pip. Gunicorn might be replaced by uWSGI at a later point as it tends to be faster and Nginx supports the uWSGI protocol natively.
 
 Sticks to Gunicorn for now, as it serves its purpose.
 
 
 #### Web server (Nginx)  
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
 
 
 # Future ideas  
 Functionality that might, or might not, be added at a later point.
 
 
 ### React native for appleTV   
 Compile to an iOS app to run the front end as an Apple TV app. May also compile to android (run directly on smart tv?) or mobile apps. This opens up the possibility of not having to use a web browser to access the front end, and ideally Apple TV’s remote can be used to browse the front end app.
 
 
 ### Centralized hosting for user data  
 Having a public site for users to register and holds all accounts. Then users register their local movie servers. Makes it possible to link several users to the same movie server.
 
 When installing a movie server, the user prompts a token linked to the user. It will show up in the users browser and now possible to interact with the server. Multiple users may have access to one server, and one user may have access to multiple servers, providing a larger movie library by merging the content when accessed in the browser.
 
 
 ### Server Side transcoding  
 Uploading one (possibly high quality version like BluRay MKV) the server automatically transcodes the video file to resolution or bitrate better suited for streaming.
 
 Might also be useful to let the user manually start transcoding a specific file using the web interface.
 
 NOTE hardware requirements! Uploading such uncompressed video files requires a lot of disk storage space, and computational power for transcoding.
 
 Because of the hardware requirements, the transcoding option could be disabled by default, and activated by the user in the server settings. Maybe add a hardware test before allowing this.
 
 
 ### Backup server(s)  
 Having the ability to host multiple servers for backup purposes as well as choosing the closest server to stream from. The servers need to synchronize in order to always have the same state in terms of uploaded files. Look into rsync, to see if it can be used to synchronize the media library folder.
 
 Or simply implement an own solution.
 
 
 ### OSX status bar  
 When the server is running as a daemon on the mac OSX, an icon is shown in the status bar to show notifications, settings etc. Look into Rums (Python package) or PyObjC to achieve this in python.
 
 
 ### Server configuration page  
 A page to adjust settings to the server. Examples of settings:
 
 
 
 *   Set library location
 *   User access ( who has access)
 *   
 
 
 ### Docker to serve Nginx, WSGI and Django inside container  
 [https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)
 
 
 ### Nginx HTTPS (OpenSSL etc..)  
 
 ### Music library  
 Extend the library to support music.
 
 Upload music library
 
 Play from different sources like music library, radio, spotify, youtube etc.
 
 Play to different sources, multiroom support, delay correction etc.
 
 
 ### Photo library  
 The library can be extended to even support photos. It would be for private photos.
 
 Users can create their own albums. Not meant to be used for any editing or backup of all pictures, but rather for storing and viewing the selected best pictures.
 
 Motivation for the project:
 
 Having a growing collection of movies, it got harder and harder to manage. Media players etc, not easy to navigate with a big library. There are solutions available aimed for this purpose, but none of them seemed to be fulfilling all of the ambitions, or lack of flexibility. The paid services are close to fulfilling the requirements in terms of user interface/ navigation, but they lack in the content. With those words in mind, the development started with the goal of making the best service out there, where you choose the content.
