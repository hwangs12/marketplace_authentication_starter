FROM node:18
# // we specify the image name that we need to our project

WORKDIR /usr/src/app
# // setting the path of the working directory

COPY package*.json ./
# // copying both package.json & package-lock.json

RUN npm install
# // installing all the dependencies

COPY . .
# // copying all the rest of the files inside our project

EXPOSE 9999
# // exposing the port which our application runs on

CMD ["node", "build/index.js" ]
# // here, you can enter the command which we use to run our application