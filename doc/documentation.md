  - [Open OTT](#open-ott)
  - [Introduction](#introduction)
 	 - [Background](#background)
 	 - [The stack](#the-stack)
  - [API](#api)
 	 - [Library](#library)
 		 - [Get content info](#get-content-info)
 		 - [Upload](#upload)
 		 - [Delete](#delete)
 		 - [Collection retrieve](#collection-retrieve)
 		 - [Collection add](#collection-add)
 		 - [Collection update](#collection-update)
 		 - [Collection delete](#collection-delete)
 	 - [Metadata](#metadata)
  - [Library](#library)
 	 - [Library organization](#library-organization)
 	 - [Adding to the library](#adding-to-the-library)
 		 - [Filter out already uploaded files](#filter-out-already-uploaded-files)
 		 - [Disk capacity confirmation](#disk-capacity-confirmation)
 		 - [Identity confirmation](#identity-confirmation)
 		 - [File upload](#file-upload)
 			 - [File selection](#file-selection)
 			 - [Initialization](#initialization)
 			 - [Chunk send](#chunk-send)
 	 - [Updating the library](#updating-the-library)
 	 - [Streaming from the library](#streaming-from-the-library)
 	 - [Deleting from the library](#deleting-from-the-library)
 	 - [Collections](#collections)
  - [Metadata](#metadata)
 	 - [Movie metadata API](#movie-metadata-api)
 	 - [User customized metadata](#user-customized-metadata)
  - [Database table models](#database-table-models)
 	 - [Library related tables](#library-related-tables)
 		 - [Metadata table](#metadata-table)
 		 - [Content library table](#content-library-table)
 		 - [Category table](#category-table)
 		 - [User data table](#user-data-table)
 	 - [User-specific tables](#user-specific-tables)
 		 - [User settings](#user-settings)
 		 - [Customized metadata table](#customized-metadata-table)
  - [User data and authentication](#user-data-and-authentication)
 	 - [Initial registration and setup](#initial-registration-and-setup)
  - [Browser](#browser)
 	 - [Responsive design](#responsive-design)
 	 - [Fetch content](#fetch-content)
 	 - [Idea](#idea)
 	 - [Responsive design](#responsive-design)
 	 - [Categories](#categories)
 	 - [Franchises](#franchises)
 	 - [Collections](#collections)
 	 - [Genres](#genres)
  - [Production environment (setup/ build)](#production-environment-(setup/-build))
 	 - [WSGI (Gunicorn)](#wsgi-(gunicorn))
 	 - [Webserver (Nginx)](#webserver-(nginx))
  - [Future ideas](#future-ideas)
 	 - [React native for AppleTV](#react-native-for-appletv)
 	 - [Server monitoring](#server-monitoring)
 	 - [Centralized hosting for user data](#centralized-hosting-for-user-data)
 	 - [Server Side transcoding](#server-side-transcoding)
 	 - [Backup server(s)](#backup-server(s))
 	 - [OSX status bar](#osx-status-bar)
 	 - [Server configuration page](#server-configuration-page)
 	 - [Docker to serve Nginx, WSGI, and Django](#docker-to-serve-nginx,-wsgi,-and-django)
 	 - [Nginx HTTPS (OpenSSL etc..)](#nginx-https-(openssl-etc..))
 	 - [Music library](#music-library)
 	 - [Photo library](#photo-library)


 # Introduction   
 This document covers a detailed implementation outline and ideas for the Open OTT project. It is meant as a reference guide for the developer but might be useful for anyone that wants to gain a technical insight into the project. Note that the project is still in an early stage and continuous updates are being made.


 ## Background  
 Open OTT makes it possible to host your own content and make it available for streaming to devices. User-friendliness is in focus, both when it comes to using the service and managing the library. Content is accessed and added to the library by uploading files to the server using an interface accessed through a web browser. This provides a good flexible design, not restricted to certain operating systems. The server handles everything related to the management of the content and metadata, letting the user focus on personalizing the library content rather than worrying about any technical details.


 ## The stack  
 The front end is built using ReactJS. It is a great framework for developing dynamic web applications such as the Open OTT client. ReactJS comes with a virtual DOM that minimizes the update time to the real DOM and is a great benefit performance-wise.

 Manage and browse the library and stream movies within the web browser.

 The back end is written in python using the Django framework. [Section about why using Django and Python]. The back end administrates and provides core functionality such as

 -User authentication

 -Database storage

 -Metadata API

 -Managing the content library

 A description of how to set up a React app with Django as a backend. Step 4 to set up with a static server. https://stackoverflow.com/questions/53708640/how-to-configure-django-with-webpack-react-using-create-react-app-on-ubuntu-serv


 # API  
 This is a full overview of all of the HTTP requests supported by the server. The client is built entirely based on these APIs.


 ## Library  

 ### Get content info  
 Algorithm: rewrite the algorithm!!

 Get file

 filename and size

 If it exists, tell the user. User may confirm to continue with the file or discard

 (Then choosing another content id, or replacing the existing user id)

 Get content-id suggestions

 If the selected id is uploaded, the user may replace with the new file, or discard

 Start the upload process.

 GET /library/movies/

 Retrieves a list of all movies in the library.

 GET /library/movies/{content_id}

 Retrieves library info of a specific movie based on the content id. Content id must be of the pattern [t]{2}[0-9]{7,8}.

 GET /library/movies/{file_id}

 Retrieves library info of a specific movie based on the file id. File id must be a hashed string of x character length.

 Responses:

 200 - Status OK

 404 - Not found


 ### Upload  

 ### Delete  

 ### Collection retrieve  
 HTTP GET /library/collection/

 Retrieves a list of all collections.

 HTTP GET /library/collection/{collection_id}

 Retrieves one collection.


 ### Collection add  
 HTTP POST /library/collection

 Creates a new collection. Body as JSON containing the following fields.

 name | *required

 type | [franchise, sequel, custom] *required

 content | [list of content ids] optional


 ### Collection update  
 HTTP PUT /library/collection/{collection_id}

 Updates collection by replacing all fields.

 HTTP PATCH /library/collection/{collection_id}

 Partly updates collection replacing one field.


 ### Collection delete  
 HTTP DELETE /library/collection/{collection_id}

 Deletes collection


 ## Metadata  

 # Library  
 The library holds all of the content files on the server in a structured way. The support for a big content library demands certain requirements, as it is easy to lose track as the content grows. Core requirements for durable library management include



 *   Strict handling of adding, modifying, and deleting files
 *   A strong search algorithm
 *   Precise metadata mapping
 *   Avoid unwanted file duplicates
 *   Restrict actions to authenticated users only



 A database table contains information about all of the content in the library. It is useful in several ways. Accessing a file in the library is performed by searching in the database, then retrieving the file from the file path found in the table. This avoids the need of scanning through the file system each time a file is to be reached.


 ## Library organization  
 The library is located in the media root directory specified in the settings file. The default location for the media root directory is “~/OOTT”. The library tree file structure looks like this:

 [OOTT]

 —[content_id]

 ——{content_id_preview.m4v}

 ——{content_id.jpg}

 ——{content_id.m4v}

 ——{content_id.srt} //Future


 ## Adding to the library   
 Files are added to the library by uploading each file using the upload section in a web browser. The user needs to confirm the content id before uploading. This is the preferred and only way of adding files to the server for a couple of reasons. Knowing the right media id of a file is crucial when collecting metadata, and having the user confirming the media id before uploading helps achieve this.

 By having the system receiving the files through the specially designed upload channel, it is ensuring correct placement of the files in the library, execution of necessary updates to the database, downloading and saving related metadata, posters, and trailers, and simply limiting the risk of issues related broken paths by not finding the requested files. The system may also reject any invalid operation attempts done to the library.

 This way of adding files to the library does not come completely without cons. The process of uploading numerous files to the server can be a tedious task, especially when having hundreds or even thousands of media files in the collection. An upload queue makes it possible to simultaneously select a bunch of files, letting the user edit and confirm the media id of each file. Then when the media id is confirmed by the user, it is added to the upload queue.  This helps light up the upload process. The feature of simultaneous uploads is considered to be added at a later stage, but for now, it is set to sequentially uploading one file at a time.  


 ### Filter out already uploaded files  
 Uploading files to the server’s library may be performed in steps. This is useful either because there are too many files to upload in one session, or because new files might be added to the collection at a later point. To prevent the user from selecting local files that are already uploaded to the server, an algorithm to filter out these uploaded files aims to solve the issue.

 Upon file selection, the client sends an “info request” to the server. The request includes information about the file’s size, filename, and last modified timestamp. The server uses the information to create a file ID by hashing the concatenated values. The file ID identifies the file in the library, to determine whether the file already exists in the library, and if it exists retrieves its status like the number of bytes uploaded.

 If the file is not completely uploaded, the offset value is lower than the size of the file. The client may either continue uploading by sending chunks starting from the offset value or completely restart the upload by sending an init request. The file selection will then be ignored, restricting the user from uploading it. This approach comes with a limitation of not detecting any changes done to the file locally. For instance, if the filename gets changed locally after upload, the user will have the ability to upload the file. Confirmation of the movie id will however deal with this case by revealing that there is already a version of the movie in the library.

 NOTE: Another approach for detecting already uploaded files could be to send the metadata chunk of the file container, and compare this on the server. This might even detect a local filename change.


 ### Disk capacity confirmation  
 Make sure there is enough space available on the server’s disk before uploading. It can be solved in the following way: Together with the “exists” request, the server looks at the sum of all sizes given in the file information list. This value is compared to the remaining space available. Also, add a buffer to not fill up the disk completely. If there is not enough space available, the file should not be uploaded, and the user should get notified.

 Alternatively, this can be checked in the prepare or init message.

 A third alternative is for the server to retrieve the space available value, then do the tests itself. This might not be the best solution as the server should not trust the client on this.

 The server also needs to confirm that there is enough space available for the upload.

 Possibility to configure how many gigabytes of the total available disk capacity is allocated to be used by the server’s content library?


 ### Identity confirmation  
 Adding content to the library follows a strict scheme of identifying all content. The requirement of identifying and mapping metadata to all uploaded content on the server is important to avoid any unknown files, both for the sake of the user and the system. Being able to identify all files helps to avoid duplicates in the library as well. For that reason, the server does not accept to upload any file that does not have a confirmed content-id attached to it. The system can not determine that the content id is matching the file, and is left to the user to decide.

 After selecting a content-id, a request is sent to the server to search for already uploaded file instances of the content. If it exists, the user receives a prompted message informing that a version already is uploaded, and is not allowed to upload. If the content id is not matching the content of the file, the user can change the content id and the check of already uploaded content of the id is repeated before the user is given the opportunity to upload. There should be a way to change a content id’s file after uploading (not yet implemented).

 The system currently supports only one file for each content id, but future implementations might give the user the opportunity to either overwrite existing uploaded files, upload another version so the content id has multiple files, or cancel the upload.


 ### File upload  
 Ensures reliable upload of files regardless of the size. Since media files can be of a big size (many GBs), it is advantageous to have an upload system that can handle interruptions that may occur during the upload process. Following is a description of the implementation used to handle the uploading of files to the server. The server takes care of adding the files to the correct location in the library after upload.

 The upload process is divided into the following steps, each with a specialized request.


 #### File selection  
 Upon file selection, the client sends information about the file including its size, filename, and last modified timestamp. The server creates a file ID by hashing the received information. The file ID is used to look up whether the file already exists in the library. use the hash of the received information to lookup


 #### Initialization  
 Initiates the file upload. The client sends information about the file including its size and filename. The server responds with a hashed string of the query values that will represent the upload id and will be the same for all chunks of the same file. The server also prepares a temporary directory to contain the received chunks belonging to the file. A JSON file with the received information is stored in the directory. The init is a GET request and has an empty body.



 If the file exists in the library, either complete or partially, it is deleted to prepare a new upload session of the file. For this reason, the init request should not be used for any other purpose than to restart the file upload. It is important that the client sends an exists-request to determine the file’s status in the library before sending the init request.

 HTTP GET request. Query

 type=init&size=[some_size_in_bytes]&lastModified=[some_timestamp]

 Required query parameters:


 <table>
   <tr>
    <td>type
    </td>
    <td>init
    </td>
   </tr>
   <tr>
    <td>size
    </td>
    <td>[file_size_in_bytes]
    </td>
   </tr>
   <tr>
    <td>name
    </td>
    <td>[filename]
    </td>
   </tr>
   <tr>
    <td>last_modified
    </td>
    <td>[timestamp_file_last_modified]
    </td>
   </tr>
   <tr>
    <td>id
    </td>
    <td>[content_id]
    </td>
   </tr>
 </table>





 #### Chunk send  
 HTTP POST request, Query type=chunk&offset=[some_value]&chunkNr=[some_nr]&uploadId=[hashed_string].

 The client sends chunks of the file associated with the upload id and an offset value specifying what bytes of the file are being sent. If the received chunk’s offset matches the number of bytes already uploaded, the server appends the chunk to the file. Chunks are sent in the HTTP body.

 Dynamic chunk size:

 Run tests to optimize the algorithm. Provide test results here.

 Performance issue detected, the web browser running at 100% CPU when sending too many chunks at the same time. The algorithm should aim to send a certain amount of chunks per time, and adjust the chunk size to meet this number. For instance 2 chunks per second. Slow connection, smaller chunks, fast connection, bigger chunks.


 ## Updating the library  
 How to update files in the library, doing changes, etc.

 The ability to change the content id of a file after upload.


 ## Streaming from the library  
 If multiple versions of a movie are available, the file to stream from is either pre-determined by the application or selected by the user (select resolution quality). Adaptive bitrate streaming protocols also go under this section, selecting the best quality available for the network capacity.


 ## Deleting from the library  
 Request: HTTP DELETE /library/delete/

 Query parameters:

 content_id=[content_id]

 Removes all attached data from the library database before deleting the object.


 ## Collections  
 Collections are used as a way of presenting the content in an organized way. There are several types of collections. The library comes with a number of default collections, but the user is free to change, customize, add, and delete all collections. The following types of collections exist:



 *   Franchises
 *   Sequels
 *   Custom

  Each collection may be viewed in a carousel as part of the “infinite scroll” browse page.

 100 best animation movies

 https://www.imdb.com/list/ls023629787/


 # Metadata  

 ## Movie metadata API  
 API to retrieve metadata about movies. Scrape IMDb, rotten tomatoes, etc.

 TODO: Implement cache.

 All results from requests are saved in a database. When the movie API receives a request, it starts by searching in the table for the movie. If the movie is found in the table, it is returned in the response. If not, retrieve it from IMDB and save it in the table before returning the response. The cache speeds up the search for movies already retrieved, and it prevents unnecessary requests to IMDB.


 ## User customized metadata  
 Metadata about the content in the library is directly taken from information retrieved from online sources. However, the user has the ability to customize metadata. The customized metadata is user-specific and should not interfere with the metadata database table. The solution is to have a customized metadata table for the user, then when the user retrieves metadata, first look in the table to see if the user has any customized metadata before retrieving from the main table.

 Or, retrieve from the main metadata table, then if the customized metadata table contains any customized data for the specific content, overwrite all customized fields.


 # Database table models  
 Overview of the database models including complete column field names and description.


 ## Library related tables  

 ### Metadata table  
 Metadata about movies, retrieved from IMDB and other sources


 <table>
   <tr>
    <td><strong>Field name</strong>
    </td>
    <td><strong>Description</strong>
    </td>
   </tr>
   <tr>
    <td>id*
    </td>
    <td>IMDB id, 9 chars. “tt” followed by 7 digits
    </td>
   </tr>
   <tr>
    <td>title*
    </td>
    <td>Title of the movie
    </td>
   </tr>
   <tr>
    <td>year*
    </td>
    <td>Production year
    </td>
   </tr>
   <tr>
    <td>stars
    </td>
    <td>Top actors
    </td>
   </tr>
   <tr>
    <td>cast
    </td>
    <td>List of all actors
    </td>
   </tr>
   <tr>
    <td>directors
    </td>
    <td>List of directors
    </td>
   </tr>
   <tr>
    <td>writers
    </td>
    <td>List of writers
    </td>
   </tr>
   <tr>
    <td>genres
    </td>
    <td>List of genres
    </td>
   </tr>
   <tr>
    <td>duration
    </td>
    <td>List of total playtime in three different formats
    </td>
   </tr>
   <tr>
    <td>plot_short
    </td>
    <td>Short description of the movie plot
    </td>
   </tr>
   <tr>
    <td>plot_long
    </td>
    <td>Long description of the movie plot
    </td>
   </tr>
   <tr>
    <td>rating
    </td>
    <td>IMDB rating including value, number of votes, and max value
    </td>
   </tr>
   <tr>
    <td>poster_url
    </td>
    <td>Url to the movie poster
    </td>
   </tr>
   <tr>
    <td>parental_rating
    </td>
    <td>Parental guidance rating
    </td>
   </tr>
   <tr>
    <td>metascore
    </td>
    <td>Metascore rating
    </td>
   </tr>
   <tr>
    <td>suggestions
    </td>
    <td>List of related movies
    </td>
   </tr>
   <tr>
    <td>tagline
    </td>
    <td>The phrase that is associated with the movie
    </td>
   </tr>
   <tr>
    <td>wikidata_id
    </td>
    <td>Identification to wikidata.org
    </td>
   </tr>
   <tr>
    <td>rotten_tomatoes
    </td>
    <td>Identification to rottentomatoes.com
    </td>
   </tr>
   <tr>
    <td>metacritic_url
    </td>
    <td>URL to metacritic.com
    </td>
   </tr>
   <tr>
    <td>metacritic_rating
    </td>
    <td>
    </td>
   </tr>
   <tr>
    <td>details
    </td>
    <td>
    </td>
   </tr>
   <tr>
    <td>awards
    </td>
    <td>
    </td>
   </tr>
 </table>


 * Required fields


 ### Content library table  
 Contains technical information about files in the library, such as resolution, playtime,  etc.

 id as key


 ### Category table  
 Contains categories as well as references to movie ids. An optional picture or icon for each category may be added. This table could be expanded to include collections, sequences, etc by specifying this value in a field.


 ### User data table  
 Contains users, using Django’s authentication functionality here


 ## User-specific tables  
 These models require one table for each user.


 ### User settings  
 Personalized user settings stored in this table. User id as reference. Can be a personalized theme, or any other personal attribute related to how the site should behave for a certain user


 ### Customized metadata table  
 User-specific metadata


 # User data and authentication  

 ## Initial registration and setup  
 The user has the option to either login or to create a new user account. After creating the account and logging in, the user is asked to select an existing movie library or create a new one. Creating a new one, the user needs to specify a location for the library. A default location is shown. Adding an existing library (using URL), the user must have user access to the library (from another user). If the movie library is empty, the user is taken directly to the upload page.


 # Browser  

 ## Responsive design  
 Semantic UI for UI components

 https://semantic-ui.com

 Onsen for iOS/ Android themed components

 https://onsen.io/theme-roller/


 ## Fetch content  
 How to handle the fetching of the content?

 Retrieve a JSON list of everything available, then pick from that what content to retrieve?

 Retrieve all? Probably not the best for a large library.

 Retrieve a list of categories, then fetch each category in bulk when scrolling?

 How much information is necessary to retrieve each content initially?



 *   Title
 *   Year
 *   ID
 *   Poster
 *   Main actors (stars)

 Restricting to only the necessary fields, data transferred is minimized. By selecting a movie more metadata will be retrieved, and the possibility to stream the content.


 ## Idea  
 The main page is an “infinite scroll” of categories, collections, and franchises. Each row is a carousel of movies.


 ## Responsive design  
 Make it easy to navigate on small screens.

 Maybe remove some functionality, like uploading files.

 Either use an m. domain, or just adjust accordingly to the screen size.


 ## Categories  
 List of categories to show when browsing movies. Categories with belonging movies stored in the categories DB table.


 ## Franchises  
 List of movie franchises to show when browsing movies. Stored in the collections DB table

 Top action/ adventure franchises here

 [https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg](https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg)


 ## Collections  

 ## Genres  

 # Production environment (setup/ build)  
 This section is not about the OTT application itself but describes an approach of how to prepare and run it in a production environment. Even if the system is only meant to be run locally, it is preferred to have a stable and solid environment to run inside. The setup provides functionality like start on system boot and always keep alive. Note that there are many ways of serving a system like this, and this is not a claim of being the best way to do it. Nonetheless, this is a proven setup, which should work for most cases.


 ## WSGI (Gunicorn)  
 The default server provided through Django is only meant for development and should never be used in production. Instead, a WSGI server is used to host the Django application. Django comes with wsgi.py that contains the python callable used by the WSGI server. There are several WSGI server options available. Gunicorn is used in this setup as it is a reliable server with an easy setup. Installation is available through pip. Gunicorn might be replaced by uWSGI at a later point as it tends to be faster and Nginx supports the uWSGI protocol natively.

 Sticks to Gunicorn for now, as it serves its purpose.


 ## Webserver (Nginx)  
 The web server is listening on port 80 and configured as a reverse proxy to forward incoming requests to the WSGI server, and sends the response from the Django application back to the client.

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

 TODO: Improve script to handle the case of already installed Nginx, or another server such as apache already listening to port 80.


 # Future ideas  
 Functionality that might, or might not, be added at a later point.


 ## React native for AppleTV   
 Compile to an iOS app to run the front end as an Apple TV app. May also compile to android (run directly on smart tv?) or mobile apps. This opens up the possibility of not having to use a web browser to access the front end, and ideally, Apple TV’s remote can be used to browse the front end app.


 ## Server monitoring  
 Provides statistics about the server such as disk capacity etc. warning when the server starts to fill up.

 Monitor how many bytes of data sent and data received. (Django middleware for this?)

 Library statistics, number of files, HD vs non-HD, etc

 Server-side:

 API sends a JSON object of all data, or just requested parts.

 Client-side:

 Retrieve JSON from API and show statistics with graphics.

 Can also use parts of information for instance to check the storage on the server before uploading


 ## Centralized hosting for user data  
 Having a public site for users to register and holds all accounts. Then users register their local movie servers. Makes it possible to link several users to the same movie server.

 When installing a movie server, the user prompts a token linked to the user. It will show up in the user’s browser and now possible to interact with the server. Multiple users may have access to one server, and one user may have access to multiple servers, providing a larger movie library by merging the content when accessed in the browser.


 ## Server Side transcoding  
 Uploading one (possibly high-quality version like BluRay MKV) the server automatically transcodes the video file to resolution or bitrate better suited for streaming.

 Might also be useful to let the user manually start transcoding a specific file using the web interface.

 NOTE hardware requirements! Uploading such uncompressed video files requires a lot of disk storage space and computational power for transcoding.

 Because of the hardware requirements, the transcoding option could be disabled by default, and activated by the user in the server settings. Maybe add a hardware test before allowing this.


 ## Backup server(s)  
 Having the ability to host multiple servers for backup purposes as well as choosing the closest server to stream from. The servers need to synchronize in order to always have the same state in terms of uploaded files. Look into rsync, to see if it can be used to synchronize the media library folder.

 Or simply implement a dedicated solution from scratch.


 ## OSX status bar  
 When the server is running as a daemon on the mac OSX, an icon is shown in the status bar to show notifications, settings, etc. Look into Rums (Python package) or PyObjC to achieve this in python.


 ## Server configuration page  
 A page to adjust settings to the server. Examples of settings:



 *   Set library location
 *   User access (who has permission to what)
 *   


 ## Docker to serve Nginx, WSGI, and Django  
 [https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)


 ## Nginx HTTPS (OpenSSL etc..)  

 ## Music library  
 Extend the library to support music.

 Upload music library

 Play from different sources like music library, radio, Spotify, youtube, etc.

 Play to different sources, multiroom support, delay correction, etc.


 ## Photo library  
 The library may be extended to even support photos. It would be for private photos.

 Users can create their own albums. Not meant to be used for any editing or backup of all pictures, but rather for storing and viewing the selected best pictures.

 The motivation for the project:

 Having a growing collection of movies, it got harder and harder to manage. Media players etc, not easy to navigate with a big library. There are solutions available aimed for this purpose, but none of them seemed to be a full-fledged solution fulfilling all of the desired requirements combined with a lack of flexibility. The commercial services are close to fulfilling the requirements in terms of user interface and navigation, but they fail to deliver the desired amount of content. With those words in mind, the development started with the goal of making the best service out there, where you choose the content.
