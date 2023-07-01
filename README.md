# Authentication Server

Save user info for authentication. We will never save plain text in case the db gets hacked. The key question is can we make hackers unable to authenticate? Even after the hacker listens to the host DB? Key thing to note, there is always a limitation such as once client of the host gets hacked and track the keystroke of the user, we wouldn't be able to prevent from our end for the hacker to login. Or can we??

## development steps

1. Download postman desktop version
2. Download docker desktop
3. Download this repository to your local machine
   - run `git clone <url>`
4. Change current directory to the cloned folder
   - `cd <folder_name>`
5. Install dependent packages
   - `npm install`
6. Spin up mongo database server through docker
   - run `docker-compose up -d -f ./docker/docker-compose.yaml`
7. Spin up this server
   - run `npm run start:transpile` then open another terminal then run `npm run start:execute`

## Running your server locally with docker

1. docker build . -t auth-mongo-express:latest -f ./Dockerfile --no-cache
2. docker run -d -p 5050:9999 auth-mongo-express (5050 is the access point through your localhost and 9999 is the port docker opens up with and node listens to)
