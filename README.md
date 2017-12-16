# ListAnything-api

> Bak-End do site ListAnything

ListAnything é um site designado para a criação de listas sobre quaisquer 'assuntos'.
Tais assuntos são divididos em 'abas' e são constituidos por um conjunto de 'campos'.

Clique [aqui](https://imgur.com/a/K2s8p) para ver algumas imagens do site.

## Desenvolvimento

### Construido com

* [Express 4.16.2](https://www.npmjs.com/package/express)
* [Mongoose 4.13.5](https://www.npmjs.com/package/mongoose)
* [Nodemailer 4.4.0](https://www.npmjs.com/package/nodemailer)

### Pré-requisitos

* [NodeJS 8.9.1](https://nodejs.org/en/)
* [MongoDb 3.4.10](https://www.mongodb.com/)
* [Yarn 1.3.2](https://yarnpkg.com/pt-BR/) [Opcional]

### Setting up Dev

Primeiro deve-se instalar o [NodeJs](https://nodejs.org/en/download/) e o [MongoDB](https://docs.mongodb.com/getting-started/shell/installation/), caso ainda não os tenha.
Em seguida deve-se abrir uma janela do terminal e deve-se inicializar o banco de dados executando o comando:
```shell
mongod
```

Agora deve-se abrir uma nova janela do terminal e deve-se executar os comandos:
```shell
git clone https://github.com/nogenem/list-anything-api
cd list-anything-api
yarn install
yarn start
```

**Observação**: o comando yarn é opcional e pode ser trocado por npm:
```shell
npm install
npm start
```

Por ultimo, deve-se seguir os passos descritos na parte de "Setting up Dev" do README do [Front-End](https://github.com/nogenem/list-anything-react).

## Guia de estilo de código

O código foi escrito utilizando:
* [Eslint 4.12.0](https://www.npmjs.com/package/eslint)
* [Eslint-config-airbnb 15.0.1](https://www.npmjs.com/package/eslint-config-airbnb)
* [Prettier 1.8.2](https://www.npmjs.com/package/prettier)

Além disso, ele foi escrito no [Visual Studio Code](https://code.visualstudio.com/) utilizando o plugin do [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) configurado para formatar o código automáticamente no salvamento dos arquivos.
