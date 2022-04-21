# Getting Started with HYPNOS API Project

This project was bootstrapped with [Express Js](https://expressjs.com/fr/).
Access to the project trello with this link

[Trello Hypnos](https://trello.com/b/YA1G3kH0/projet-hypnos).

### Requirements

You will need nodeJs (v7.5), npm (15.8), MariaDB (v10.6) to run the project.

## Available Scripts

In the project directory, you can run:

### `npm install or yum install`

Install & config all dependncies needed for the project

## Install & config Prisma CLI

You can learn more in the [Prisma-express documentation](https://www.prisma.io/express)

after configuring Prisma and installing dependencies, You need to change database variables set in the .env.

Put it your own configuration to access to your DB.

### `service mysql start`

Don't forget to start MySql service before to start migrations

### `npx prisma migrate dev`

If all is done, you can run prisma migrate commande, to generate the DB if not exist & the project migrations.

### `npm run devStart`

Runs the app in the development mode.<br>
Open [http://localhost:3006](http://localhost:3006) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Learn More

You can learn more in the [Prisma documentation](https://www.prisma.io/docs/getting-started).
