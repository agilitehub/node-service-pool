'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
const expect = require('chai').expect
const typeDetect = require('type-detect')

const servicePool = require('../lib/ServicePool')
const enumsTypeDetect = require('../lib/EnumsTypeDetect')

let id1 = 'id111'
let id2 = 'id222'
let id3 = 'id333'

const config = { max: 2 }
const pool = new servicePool(config)

const serviceEntry1 = {
  id: id1,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const serviceEntry2 = {
  id: id2,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const serviceEntry22 = {
  id: id2,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const serviceEntry3 = {
  id: id3,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

describe ('Mongoose', () => {
  let service1 = null
  let service2 = null
  let service3 = null

  it ('Check Max Prop is valid', (done) => {
    expect(pool.getConfig()).to.haveOwnProperty('max')
    expect(typeDetect(pool.getConfig().max)).to.equal(enumsTypeDetect.NUMBER)
    done()
  })

  it ('Create First Pool Entry', (done) => {
      service1 = pool.add(serviceEntry1)
      expect(typeDetect(service1)).to.equal(enumsTypeDetect.PROMISE)
      done()
  })

  it ('Test Connection is Active', (done) => {
    expect(pool.test(id1)).to.equal(true)
    done()
  })

  it ('Check for 1 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(1)
    done()
  })

  it ('Destroy Connection', (done) => {
    expect(pool.destroy(id1)).to.equal(true)
    done()
  })

  it ('Check for 0 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(0)
    done()
  })

  it ('Create 3 Pool Entries', (done) => {
    service1 = pool.add(serviceEntry1)
    service2 = pool.add(serviceEntry2)
    service3 = pool.add(serviceEntry3)
      
    expect(typeDetect(service1)).to.equal(enumsTypeDetect.PROMISE)
    expect(typeDetect(service2)).to.equal(enumsTypeDetect.PROMISE)
    expect(typeDetect(service3)).to.equal(enumsTypeDetect.PROMISE)
    done()
  })

  it (`Check for ${config.max} Active Service`, (done) => {
    expect(pool.getActiveServiceCount()).to.equal(config.max)
    done()
  })

  it ('Add Duplicate Entry', (done) => {
    service2 = pool.add(serviceEntry22)
    expect(typeDetect(service2)).to.equal(enumsTypeDetect.PROMISE)
    done()
  })

  it ('Destroy 2nd Connection', (done) => {
    expect(pool.destroy(id3)).to.equal(true)
    done()
  })

  it (`Check for ${config.max - 1} Active Service`, (done) => {
    expect(pool.getActiveServiceCount()).to.equal(config.max - 1)
    done()
  })

  it ('Test 1st Service is Active', (done) => {
    expect(pool.test(id2)).to.equal(true)
    done()
  })

  it ('Get 1st Service', (done) => {
    expect(typeDetect(pool.get(id2))).to.equal(enumsTypeDetect.OBJECT)
    done()
  })

  it ('Reset Services', (done) => {
    expect(pool.reset()).to.equal(true)
    done()
  })

  it ('Check for 0 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(0)
    done()
  })
})