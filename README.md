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

* Setup a simple Server at http://localhost:8086

```Typescript
import { ExpressServer } from 'molly';

let server = new ExpressServer();
server.start({
    binding: 'localhost',
    port: 8086,
    mongoUrl: 'mongodb://localhost:27017/',
    mongoDatabase: 'test_molly'
});
```

* create a Model User that can Create, Read, Update and Delete

```Typescript
import { collection, validation, BaseTypes } from 'molly';

@collection({
    allow: 'CUD'
})
class User {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    username: string;
    @validation({type: BaseTypes.hexadecimal})
    password: string;
    @validation({type: BaseTypes.email})
    email: string;
}
```

    This definition creates a MongoDb Collection named User. All objects of type User are stored in this collection. The "allow" attribute of the collection decorator determines whether the object can be created, modified or deleted. For example,'CXD' only allows you to create or delete,'CXX' only allows you to create and'XXX' only allows you to read.

    In the validate decorator, a type is specified for which the property is validated. If the validation fails, an appropriate message is returned in the API.

* create a unique Index on username

```Typescript
import { collection, validation, BaseTypes } from 'molly';

@collection({
    allow: 'CUD',
    index: async (coll) => {
        coll.setIndex({
            username: 1
        }, {
            background: true,
            unique: true
        });
    }
})
class User {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    username: string;
    @validation({type: BaseTypes.hexadecimal})
    password: string;
    @validation({type: BaseTypes.email})
    email: string;
}
```

* use Group as nested Object

```Typescript
import { collection, validation, BaseTypes, JoinType, MongoLookup } from 'molly';

@collection({
    allow: 'CUD'
})
class Group {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    name: string;
}

@collection({
    allow: 'CUD',
    index: async (coll) => {
        coll.setIndex({
            username: 1
        }, {
            background: true,
            unique: true
        });
    },
    lookup: [
        new MongoLookup('Group', 'group', '_id', JoinType.ONEONE)
    ]
})
class User {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    username: string;
    @validation({type: BaseTypes.hexadecimal})
    password: string;
    @validation({type: BaseTypes.email})
    email: string;
    group: Group;
}
```

* example with multiple nested Groups

```Typescript
import { collection, validation, BaseTypes, JoinType, MongoLookup } from 'molly';

@collection({
    allow: 'CUD'
})
class Group {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    name: string;
}

@collection({
    allow: 'CUD',
    index: async (coll) => {
        coll.setIndex({
            username: 1
        }, {
            background: true,
            unique: true
        });
    },
    lookup: [
        new MongoLookup('Group', 'groups', '_id', JoinType.ONEMANY)
    ]
})
class User {
    @validation({type: BaseTypes.mongoDbObjectId})
    _id?: string;
    @validation({type: BaseTypes.stringDefaultLength})
    username: string;
    @validation({type: BaseTypes.hexadecimal})
    password: string;
    @validation({type: BaseTypes.email})
    email: string;
    groups: Group[];
}
```
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
