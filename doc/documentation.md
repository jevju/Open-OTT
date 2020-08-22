<!-- Copy and paste the converted output. -->

<!-----
NEW: Check the "Suppress top comment" option to remove this info from the output.

Conversion time: 1.153 seconds.


Using this Markdown file:

1. Paste this output into your source file.
2. See the notes and action items below regarding this conversion run.
3. Check the rendered output (headings, lists, code blocks, tables) for proper
   formatting and use a linkchecker before you publish this page.

Conversion notes:

* Docs to Markdown version 1.0β29
* Sat Aug 22 2020 03:58:52 GMT-0700 (PDT)
* Source doc: Moviesite
* Tables are currently converted to HTML tables.
----->



# Moviesite


[TOC]



## Introduction  {#introduction}

The goal is to make an open source on demand service by hosting a movie server and access the content through a web browser. Both administration of the movie library, and watching. This documentation is primarily meant as a reference guide while developing, addressing new ideas and problems and reflecting solutions, but may also be useful for whoever wants to gain a technical insight to the solutions and implementation of the system.


### Requirements {#requirements}

Easy to set up and use. Should be possible without further technical knowledge.

Add movies by uploading them to a local server through a web browser. The server will handle adding it to the library as well as downloading all metadata.

Front end built with react. Browse movies and stream within the web browser.

Back end built with django

-User authentication

-database storage

-movie metadata api

-receive and organize file upload

Description of how to set up a React app with Django as a backend. Follow step 4 to set up with a static server. https://stackoverflow.com/questions/53708640/how-to-configure-django-with-webpack-react-using-create-react-app-on-ubuntu-serv


## Server side parts {#server-side-parts}


### Adding files [client side]

The process of uploading movie files to the server can be a tedious task, when having hundreds or even thousands of movies in your collection. However, uploading each file through the web browser is chosen as the primary way of adding movies to the server for the following reasons:



*   Manual movie title confirmation by the user makes sure the right metadata is added for the movie
*   It ensures that the files are stored at the correct location on the server, and the server handles the downloading of external files such as cover pictures and trailers

Some functionality is added as a help of speeding up the upload process. An upload queue makes it possible to select a bunch of files, then when the user confirms the ID of a movie, move it to the upload queue. It also supports simultaneously uploading multiple movies from the queue. The maximum number of simultaneous uploads must be determined at a later stage during testing.


### Resumable upload {#resumable-upload}

Ensures reliable upload of large files. Since movie files can be of a big size (many GBs), it is important to have an upload system that can handle interruptions that may occur during the upload process. Following is a description of the implementation used to handle uploading of files to the server. The server takes care of adding the files to the correct location in the library after upload.

The upload consists of four different steps in total.



1. Initiate upload. Client sends file size and filename. Server responds with a hashed string of the query values that will represent the upload id, and will be the same for all chunks of the same file. The server also prepares a temporary directory to contain the received chunks belonging to the file. A json file with the received information is stored in the directory. The init is a GET request and contains no body.

	HTTP GET request. Query type=init&size=[some_size_in_bytes]&lastModified=[some_timestamp]



2. Chunk upload. The client sends chunks of the file together with the upload id and offset specifying what bytes of the file is being sent. Each chunk has an incremental chunk number to keep track of the process. If the received chunk’s number matches the previous chunk number + 1, the server appends the chunk to the file in the temporary directory. HTTP POST request, Query type=chunk&offset=[some_value]&chunkNr=[some_nr]&uploadId=[hashed_string]. Chunks are contained in the HTTP body.
3. When all chunks are sent, the client sends a message to indicate the end of transmission. It contains the hashed string as a query parameter. If the uploaded file size equals the size provided in the init request, the server adds the file to the library.

    Query type=end&uploadId=[hashed_string]


Note: Should find a way to detect already uploaded files. Either by filename, size, checksum etc.

One way might be to store the hash value of filename + size for all uploaded files in a file or db on the server. Then compare the new file to see if it already exists. This will not detect any file or name change...

..But when the imdb-id for the selected file is confirmed by the user, the user will be shown already uploaded versions of the movie (if any), so that the user can choose to either upload another version, replace a current version, or cancel the upload.


### Movapi  {#movapi}

API to retrieve movie metadata. Scrape IMDb

Extended functionality to retrieve from rottentomatoes and downloading movie trailers etc


### Server monitor {#server-monitor}

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


### Database models {#database-models}

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


## Front end {#front-end}


### Categories {#categories}

List of categories to show when browsing movies. Categories with belonging movies stored in the categories db table.


<table>
  <tr>
   <td><strong>Name</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>Norwegian
   </td>
   <td>Movies with country set to Norway
   </td>
  </tr>
  <tr>
   <td>High budget
   </td>
   <td>Movies with highest budgets in decreasing order
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



### Franchises {#franchises}

List of franchises to show when browsing movies. Stored in the collections db table

Top action/ adventure franchises here

[https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg](https://geekologie.com/image.php?path=/2013/06/28/highest-grossing-movie-franchises-large.jpg)


<table>
  <tr>
   <td><strong>Name</strong>
   </td>
   <td><strong>Description</strong>
   </td>
  </tr>
  <tr>
   <td>James Bond
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Star Wars
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Harry Potter
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Marvel Cinematic Universe
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Tolkien Saga
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Batman
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Pirates of the Caribbean
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Spider Man
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Indiana Jones
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Twilight
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>… and many more in the link
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



### Collections {#collections}


### Genres {#genres}


## Future ideas {#future-ideas}


### React native for appleTV  {#react-native-for-appletv}

Compile to an iOS app to run the front end as an Apple TV app. May also compile to android (run directly on smart tv?) or mobile apps. This opens up the possibility of not having to use a web browser to access the front end, and ideally Apple TV’s remote can be used to browse the front end app.


### Centralized hosting for user data

Having a public site for users to register and holds all accounts. Then users register their local movie servers. Makes it possible to link several users to the same movie server.

When installing a movie server, the user prompts a token linked to the user. It will show up in the users browser and now possible to interact with the server. Multiple users may have access to one server, and one user may have access to multiple servers, providing a larger movie library by merging the content when accessed in the browser.


### Backup server

Having the ability to host multiple servers for backup purposes as well as choosing the closest server to stream from. The servers need to synchronize in order to always have the same state in terms of uploaded files.
