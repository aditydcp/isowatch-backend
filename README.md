# IsoWatch Back-end

[![Status badge](https://img.shields.io/badge/status-completed-blue.svg)](https://shields.io/)

This is the server-side repository for Capstone Project: IsoWatch.

This project is not yet 100% complete. Our targets can be found on the **[issues](https://github.com/aditydcp/isowatch-backend/issues)**.

*Note*

Some things might change or not work due to Heroku new policy effective per Nov 28, 2022.

*Last deployed: Nov 25, 2022*

## About the Project

This project is a Capstone Project for our final year assignment. This is a simulation of IoT project using a wearable thing (in this case, WearOS wearables) to collect data, transmit it to server and have the data be presented on the client web app.

Tools used in this project:
* **Client-side Web App**
  * React.js
    * Rechart: for displaying graphs
    * React Hook Form: for making forms
    * Axios: for making API calls
    * Universal Cookie: for cookie management
  * Pusher: for listening on events of database change
* **Server-side Web App**
  * Node.js & Express.js
    * Mongoose: for creating collection schema and MongoDB connection, and also watching for database change
    * Body parser: for parsing JSON request bodies
    * Jsonwebtoken: for creating token of authorization
    * bcrypt: for encrypting password
  * MongoDB: for storing data
  * Pusher: for publishing events of database change
* **WearOS App**
  * Kotlin language
    * Android Wear dependencies: for enabling Wear-specific input, layout and materials
    * Retrofit: for sending HTTP requests
    * Moshi: for parsing JSON into and from Kotlin objects
    * OkHTTP: for dealing with backward compatibilities
    * Samsung Privileged SDK: for accessing sensors

**[Client-side repository]** can be found [here](https://github.com/aditydcp/isowatch-frontend).

**[WearOS App repository]** can be found [here](https://github.com/aditydcp/isowatch-app).

As this project is not yet 100% complete. The targets for each repository can be found on their corresponding **issues** page.

For more information about the project, please **[contact me](https://github.com/aditydcp)**.

Departemen Teknik Elektro dan Teknologi Informasi

Universitas Gadjah Mada

2022

## Installation

Some things you need to have installed:

- node
- npm
- nodemon

To start, clone this repository and go to the project directory in your terminal.

Install all the dependencies

    npm install

Start the app

    npm start

Setup <code>.env</code> file
// TO DO: env file configuration

Go to your Postman and create your API calls to http://localhost:3000/

## Changelog

v0.4.5: remove auth on Add Health Point to provide suitable use case for the Wear App

v0.4.4: minor modification on Create Pemeriksaan response

v0.4.3: add Get all Pemeriksaan endpoint and implement auto 'ID' increment for creating Pemeriksaan

v0.4.2: remove auth on Create Pemeriksaan to provide suitable use case for the Wear App

v0.4.1: added endpoint for updating Admin and Pasien on Pemeriksaan at the same time

v0.4.0: reworked pemeriksaan model to not depends on Admin and/or Pasien. Pemeriksaan is a strong entity, Admin and Pasien can be added on it. Added endpoint for updating Pasien on Pemeriksaan. implement Pusher and MongoDB change stream.

v0.3.1: create endpoints for Active Pemeriksaan

v0.3.0: created Pemeriksaan and Health Point entities and endpoints for them. Initialize deployment to Heroku.

v0.2.1: fixed Admins and auths problem

v0.2.0: problem with Admins. for now, will be handled via hardcode by frontend. ITMT, find a way to search on a specific collection

v0.1.0: initialize project. create endpoints for User and Admin registration and login