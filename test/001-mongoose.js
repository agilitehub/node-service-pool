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

const service1 = {
  id: id1,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const service2 = {
  id: id2,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const service22 = {
  id: id2,
  onAdd: mongoose.createConnection('mongodb://127.0.0.1/dbname'),
  onTest: function (service) {
    return service.readyState === 1
  },
  onDestroy: function (service) {
    return service.close()
  }
}

const service3 = {
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
  it ('Check Max Prop is valid', (done) => {
    expect(pool.getConfig()).to.haveOwnProperty('max')
    expect(typeDetect(pool.getConfig().max)).to.equal(enumsTypeDetect.NUMBER)
    done()
  })

  it ('Create First Pool Entry', (done) => {
    pool.add(service1, (err, result) => {
      expect(err).to.equal(null)
      done()
    })
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
    pool.add(service1, (err) => {
      expect(err).to.equal(null)

      pool.add(service2, (err2) => {
        expect(err2).to.equal(null)

        pool.add(service3, (err) => {
          expect(err).to.equal(null)
          done()
        })
      })
    })
  })

  it (`Check for ${config.max} Active Service`, (done) => {
    expect(pool.getActiveServiceCount()).to.equal(config.max)
    done()
  })

  it ('Add Duplicate Entry', (done) => {
    pool.add(service22, (err, result) => {
      expect(err).to.equal(null)
      done()
    })
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