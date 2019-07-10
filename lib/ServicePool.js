'use strict'

const typeDetect = require('type-detect')
const Enums = require('./Enums')
const EnumsTypeDetect = require('./EnumsTypeDetect')

class ServicePool {
  /**
   * @param {Object} config
   */
  constructor (config) {
    config = config || {}

    this.max = typeDetect(config.max) === EnumsTypeDetect.NUMBER ? config.max : Enums.MAX_POOL_SIZE
    this.pool = {}
  }

  getConfig () {
    return { max: this.max }
  }

  getActiveClientCount () {
    return Object.keys(this.pool).length
  }

  getActiveIds () {
    let result = []

    for (let x in this.pool) {
      result.push(x)
    }

    return result
  }

  reset () {
    for (let x in this.pool) {
      this.pool[x].destroy(this.pool[x].client)
      delete this.pool[x]
    }

    return true
  }

  add (entry, callback) {
    let length = 0

    // Validate entry object returned
    if (typeDetect(entry) !== EnumsTypeDetect.OBJECT) {
      return callback('Invalid JS Object passed as parameter')
    } else if (!entry.onAdd) {
      return callback('JS Object missing onAdd function call')
    } else if (typeDetect(entry.onAdd) !== EnumsTypeDetect.FUNCTION) {
      return callback('onAdd property not a Function')
    }

    for (let x in this.pool) {
      if (x === entry.id) {
        // Destroy current client
        this.destroy(x)
      }
    }

    // If max is reached remove last client
    length = Object.keys(this.pool).length

    if ((this.max > 0) && (length >= this.max)) {
      this.destroy(Object.keys(this.pool)[0])
    }

    // Add new Client
    this.pool[entry.id] = {
      client: entry.onAdd(),
      test: entry.onTest,
      destroy: entry.onDestroy
    }

    return callback(null, this.pool[entry.id].client)
  }

  get (id) {
    if (this.pool[id]) {
      return this.pool[id].client
    } else {
      return null
    }
  }

  test (id) {
    if (this.pool[id]) {
      if (this.pool[id].test) {
        return this.pool[id].test(this.pool[id].client)
      }
    }

    return null
  }

  destroy (id) {
    if (this.pool[id]) {
      if (this.pool[id].destroy) {
        this.pool[id].destroy(this.pool[id].client)
      }

      delete this.pool[id]
      return true
    }

    return null
  }
}

module.exports = ServicePool
