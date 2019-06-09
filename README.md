[![Build Status](https://travis-ci.org/nodejayes/molly.svg?branch=master)](https://travis-ci.org/nodejayes/molly)
[![Coverage Status](https://coveralls.io/repos/github/nodejayes/molly/badge.svg?branch=master)](https://coveralls.io/github/nodejayes/molly?branch=master)
[![devDependency Status](https://david-dm.org/nodejayes/molly/dev-status.svg)](https://david-dm.org/nodejayes/molly#info=devDependencies)
[![npm version](https://badge.fury.io/js/molly.svg)](https://badge.fury.io/js/molly)
![npm](https://img.shields.io/npm/l/molly.svg)
![npm](https://img.shields.io/npm/dt/molly.svg)
![npm](https://img.shields.io/npm/dw/molly.svg)
![npm](https://img.shields.io/npm/dm/molly.svg)
![npm](https://img.shields.io/npm/dy/molly.svg)

# Molly

The goal of Molly is to create services that are as flexible and easy to configure as possible. Based on the schemata of models, a service will be created which will allow you to save, read, edit and delete these models. By adding further freely definable functions, a higher flexibility is achieved. The application possibilities of Molly Services are manifold and range from monolithic service to microservice architecture.

## What is needed?

* You need an installed MongoDb instance to connect to

## Features

| Feature               | Description                                                |
|-----------------------|------------------------------------------------------------|
| Class Decorators      | Description of collections based on classes                |
| Subclasses            | Nested objects                                             |
| Class extension       | support for inherited classes                              |
| Collection Setup      | automatic creation of non-existing collections in MongoDb  |
| predefined Types      | some Datatype Validations                                  |
| Websocket Support     | Use of Websockets or Request/Responses                     |
| Swagger Documentation | automatic generation of swagger definition at server start |


## Documentation

https://github.com/nodejayes/molly/wiki

## Release Notes
1.6.6

* implement base properties (_id, createdAt, modifiedAt, version) on every model
* variable Transaction Lock Timeout on Configuration
* update mongodb dependency

1.6.5

* change travis CI and update packages

1.6.4

* add more node versions to test

1.6.3

* change npm api token

1.6.2

* update Dependencies
* fix Tests

1.6.1

* add CORS Options in configuration

1.6.0

* support of transactions (MongoDb 4.0 and ReplicaSets only)
* recursive lookups not end in endless loop anymore
* put models in configuration no call of constructor is required anymore

1.5.3

* update Dependencies
* fix Deprecated usage of MongoDb Driver URL Parser

1.5.1

* fix travis ci missing build

1.5.0

* move Project to GitHub
* add Documentation in the RADME.md
* add NPM Badges
* setup Travis CI and Coveralls

1.4.6

* fix TS1040 error
* remove insecure dependencies

1.4.5

* fix spectacle not found error
* fix tsc error async modifier
* change Swagger Documentation

1.4.4

* change Module Resolution

1.4.3

* add tsconfi.json in publish package

1.4.2

* fix export bug

1.4.1

* fix Error in dist Folder Structure

1.4.0

* automatic API Documentation with spectacle
* clear all Configurations with Method clearConfiguration
* add a custom Function to implement authentication

1.3.2

* create only takes one Object (multiple Objects implement later with transactions)

1.3.1

* when create many Models the errors was not created for example duplicates are not inserted the other models was

1.3.0

* add schema Route to get JSON Schema from Models
* support extended Classes
* add gzip to Server
* add static File support for Server
* fix Joi validation

1.2.0

* add Https Support

1.1.0

* add Decorators collection, validation and operation for better define Models and Operations

1.0.0

* First Release
