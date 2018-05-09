# httpServer
The server to connect and obtain information from databaset


<<<<<<<<<<<Head

Location-based Quiz App and Question Setting App

=============================================================================
##There are three components: Location-based Quiz App, Question Setting App and a nodeJS server. The nodeJS server not only connect users (client) to the server, obtaining data from the administrator's database, but also can combine with phonegap serve to conduct App tests. 

##The Question Setting App use the nodeJS and phonegap serve to click coordinates and input information on html table. The data is converted by nodeJS server (app.post function) to and store in the database. The Question setting App is also browser-based, to allow users chose any point and set questions with possible answers. The map is obtained from OpenStreetMap, with initial set view on the central London.

##The Location-based App could track users' location and give a question on some points, which downloaded data from the Question App by using app.get function in nodeJS server. When users close to the given points, a popup will show they are approaching and please answer the quiz on different give points. And then a new difined app.post function will submit the results, which are name, question, and the answer value will transform to database. The nodeJS helps to connect the server and client, allow file exchanges and data processing for different kind of files. This investigation used JavaScript, html and css program to conduct the Apps and nodeJS.  

##To test the results, 5 points (around UCL main campus) are chosen, 3 of which locates near to IOE, and one is close to the Chadwick building. 








||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||****Created at 9th May 2018****
