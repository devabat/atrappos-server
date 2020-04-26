atrappos-server

Node server for the project atrappos

Environment variables:

* MONGODB_URI : mongodb://192.168.56.12:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false <br>
* CLIENT_URL: localhost:3000

#### Docker Mongo RUN:

``
docker run -d --name atrappos-mongo \
-v /var/dockers/data/atrappos-mongodb:/data/db \
-v /var/dockers/data/atrappos-mongodb/backup:/backup \
-v /var/dockers/data/atrappos-mongodb/opt:/opt \
-m=4G --restart unless-stopped -p 27017:27017 \
-e "TZ=Europe/Athens" mongo:4.2.3-bionic
``




