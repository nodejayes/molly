# Molly

The goal of Molly is to create services that are as flexible and easy to configure as possible. Based on the schemata of models, a service will be created which will allow you to save, read, edit and delete these models. By adding further freely definable functions, a higher flexibility is achieved. The application possibilities of Molly Services are manifold and range from monolithic service to microservice architecture.

## Features

* standalone Server
* Websockets
* automatic Collection creation
* Validation
* Collection Lookup

## Howtos

[Setup Server](https://gitlab.sw-gis.de/root/molly/wikis/setup-server)

[Define some Models](https://gitlab.sw-gis.de/root/molly/wikis/how-to-define-models)

[Call the CRUD Operations over Request](https://gitlab.sw-gis.de/root/molly/wikis/call-over-request)

[Call over Websockets](https://gitlab.sw-gis.de/root/molly/wikis/use-websockets)

[Define Custom Operations](https://gitlab.sw-gis.de/root/molly/wikis/custom-operations)

## Release Notes

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
