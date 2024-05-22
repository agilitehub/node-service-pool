'use strict'

import { expect } from 'chai'

import mongoose from 'mongoose'

import TypeDetect from 'agilite-utils/type-detect.js'
import EnumsTypeDetect from 'agilite-utils/enums-type-detect.js'

import ServicePool from '../dist/index.js'

const id1 = 'id111'
const id2 = 'id222'
const id3 = 'id333'

const config = { max: 2 }
const pool = new ServicePool(config)

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

describe('Mongoose', () => {
  let service1 = null
  let service2 = null
  let service3 = null

  it('Check Max Prop is valid', (done) => {
    expect(pool.getConfig()).to.haveOwnProperty('max')
    expect(TypeDetect(pool.getConfig().max)).to.equal(EnumsTypeDetect.NUMBER)
    done()
  })

  it('Create First Pool Entry', (done) => {
    service1 = pool.add(serviceEntry1)
    expect(TypeDetect(service1)).to.equal(EnumsTypeDetect.PROMISE)
    done()
  })

  it('Test Connection is Active', (done) => {
    expect(pool.test(id1)).to.equal(true)
    done()
  })

  it('Check for 1 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(1)
    done()
  })

  it('Destroy Connection', (done) => {
    expect(pool.destroy(id1)).to.equal(true)
    done()
  })

  it('Check for 0 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(0)
    done()
  })

  it('Create 3 Pool Entries', (done) => {
    service1 = pool.add(serviceEntry1)
    service2 = pool.add(serviceEntry2)
    service3 = pool.add(serviceEntry3)

    expect(TypeDetect(service1)).to.equal(EnumsTypeDetect.PROMISE)
    expect(TypeDetect(service2)).to.equal(EnumsTypeDetect.PROMISE)
    expect(TypeDetect(service3)).to.equal(EnumsTypeDetect.PROMISE)
    done()
  })

  it(`Check for ${config.max} Active Service`, (done) => {
    expect(pool.getActiveServiceCount()).to.equal(config.max)
    done()
  })

  it('Add Duplicate Entry', (done) => {
    service2 = pool.add(serviceEntry22)
    expect(TypeDetect(service2)).to.equal(EnumsTypeDetect.PROMISE)
    done()
  })

  it('Destroy 2nd Connection', (done) => {
    expect(pool.destroy(id3)).to.equal(true)
    done()
  })

  it(`Check for ${config.max - 1} Active Service`, (done) => {
    expect(pool.getActiveServiceCount()).to.equal(config.max - 1)
    done()
  })

  it('Test 1st Service is Active', (done) => {
    expect(pool.test(id2)).to.equal(true)
    done()
  })

  it('Get 1st Service', (done) => {
    expect(TypeDetect(pool.get(id2))).to.equal(EnumsTypeDetect.OBJECT)
    done()
  })

  it('Reset Services', (done) => {
    expect(pool.reset()).to.equal(true)
    done()
  })

  it('Check for 0 Active Service', (done) => {
    expect(pool.getActiveServiceCount()).to.equal(0)
    done()
  })
})
