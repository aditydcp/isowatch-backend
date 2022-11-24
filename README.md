# IsoWatch Back-end

[![Status badge](https://img.shields.io/badge/status-development-blue.svg)](https://shields.io/)

This is the server-side repository for Capstone Project: IsoWatch.

Go to [client-side repository](https://github.com/aditydcp/isowatch-frontend).

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

v0.4.2: remove auth on Create Pemeriksaan to provide suitable use case for the Wear App

v0.4.1: added endpoint for updating Admin and Pasien on Pemeriksaan at the same time

v0.4.0: reworked pemeriksaan model to not depends on Admin and/or Pasien. Pemeriksaan is a strong entity, Admin and Pasien can be added on it. Added endpoint for updating Pasien on Pemeriksaan. implement Pusher and MongoDB change stream.

v0.3.1: create endpoints for Active Pemeriksaan

v0.3.0: created Pemeriksaan and Health Point entities and endpoints for them. Initialize deployment to Heroku.

v0.2.1: fixed Admins and auths problem

v0.2.0: problem with Admins. for now, will be handled via hardcode by frontend. ITMT, find a way to search on a specific collection

v0.1.0: initialize project. create endpoints for User and Admin registration and login