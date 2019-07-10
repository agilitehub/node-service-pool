# service-pool
A simple, lightweight, Resource Pool Manager for NodeJS

Created by [Agilit-e](https://agilite.io)

## About

Inspired by [generic-pool](https://www.npmjs.com/package/generic-pool), service-pool aims to provide a simple means of managing service connections of any kind via a pool resource and accessing these services using a unique identifier.

## Installation

```sh
$ npm install service-pool [--save]
```

## Example

The below example shows how to setup a Service Pool with maximum 2 connections to a local MongoDB environment. It's similar to [generic-pool](https://www.npmjs.com/package/generic-pool), but take note of the 'id' property as well as the ability to test the service connection.

```js
// Step 1: Include relevant modules along with 'service-pool'
const mongoose = require('mongoose')
const servicePool = require("service-pool");

// Step 2: Create an instance of a Service Pool
const config = { max: 2 }
const pool = new servicePool(config)

// Step 3: Setup a service entry (A local MongoDB in this case)
const id = 'unique-id-value'

const serviceEntry = {
  id,
  onAdd: function () {
    const url = 'mongodb://localhost/dbname'
    return mongoose.createConnection(url)
  },
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

// Step 4: Add service entry to pool
pool.add(serviceEntry, (err, service) => {
  // service - the returned connection to MongoDb in this case
})

// Step 5: Get a service entry by id
let service = pool.get(id) // service - the returned connection to MongoDb in this case

// Step 6: Test a service entry by id
let serviceActive = pool.test(id) // serviceActive - A boolean value confirming if the service is active

// Step 7: Destroy a service entry by id
let isDestroyed = pool.destroy(id) // isDestroyed - A boolean value confirming if the service was removed. null is returned if there was a problem

// Step 8: Reset service pool
let isReset = pool.reset() // isReset - A boolean value confirming if the service pool was reset and cleared of service entries
```

## Run Tests

    $ npm install
    $ npm test

## License

[MIT License](https://github.com/agilitehub/node-service-pool/blob/master/LICENSE)

Copyright (c) 2019 Agilit-e