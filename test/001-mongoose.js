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

const service = {
  id: id1,
  onAdd: function () {
    const url = 'mongodb://127.0.0.1/dbname'
    return mongoose.createConnection(url)
  },
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
    pool.add(service, (err, result) => {
      expect(err).to.equal(null)
      done()
    })
  })

  it ('Test Connection is Active', (done) => {
    expect(pool.test(id1)).to.equal(true)
    done()
  })

  it ('Check for 1 Active Client', (done) => {
    expect(pool.getActiveClientCount()).to.equal(1)
    done()
  })

  it ('Destroy Connection', (done) => {
    expect(pool.destroy(id1)).to.equal(true)
    done()
  })

  it ('Check for 0 Active Client', (done) => {
    expect(pool.getActiveClientCount()).to.equal(0)
    done()
  })

  it ('Create 3 Pool Entries', (done) => {
    pool.add(service, (err, result) => {
      expect(err).to.equal(null)
      service.id = id2

      pool.add(service, (err2, result) => {
        expect(err2).to.equal(null)
        service.id = id3

        pool.add(service, (err, result) => {
          expect(err).to.equal(null)
          done()
        })
      })
    })
  })

  it (`Check for ${config.max} Active Client`, (done) => {
    expect(pool.getActiveClientCount()).to.equal(config.max)
    done()
  })

  it ('Add Duplicate Entry', (done) => {
    service.id = id2

    pool.add(service, (err, result) => {
      expect(err).to.equal(null)
      done()
    })
  })

  it ('Destroy 2nd Connection', (done) => {
    expect(pool.destroy(id3)).to.equal(true)
    done()
  })

  it (`Check for ${config.max - 1} Active Client`, (done) => {
    expect(pool.getActiveClientCount()).to.equal(config.max - 1)
    done()
  })

  it ('Test 1st Client is Active', (done) => {
    expect(pool.test(id2)).to.equal(true)
    done()
  })

  it ('Get 1st Client', (done) => {
    expect(typeDetect(pool.get(id2))).to.equal(enumsTypeDetect.OBJECT)
    done()
  })

  it ('Reset Clients', (done) => {
    expect(pool.reset()).to.equal(true)
    done()
  })

  it ('Check for 0 Active Client', (done) => {
    expect(pool.getActiveClientCount()).to.equal(0)
    done()
  })
})