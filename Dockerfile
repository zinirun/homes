# It uses Yarn, Forever
# Bind to build_n_run.sh in current directory

FROM node:12
RUN npm install -g yarn; yarn global add forever;
COPY package.json /src/package.json
RUN  cd /src; yarn install;
COPY . /src
EXPOSE 3000 80 443
WORKDIR /src

CMD yarn start