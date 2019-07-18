'use strict'

const typeDetect = require('type-detect')
const Enums = require('./Enums')
const EnumsTypeDetect = require('./EnumsTypeDetect')

class ServicePool {
  constructor (config) {
    config = config || {}

    this.max = typeDetect(config.max) === EnumsTypeDetect.NUMBER ? config.max : Enums.MAX_POOL_SIZE
    this.pool = {}
  }

  getConfig () {
    return { max: this.max }
  }

  getActiveServiceCount () {
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
      if(this.pool[x].destroy) {
        this.pool[x].destroy(this.pool[x].service)
      }
  
      delete this.pool[x]
    }

    return true
  }

  async add (entry) {
    let length = 0
    let msg = null;

    return new Promise((resolve, reject) => {
      // Validate entry object returned
      if (typeDetect(entry) !== EnumsTypeDetect.OBJECT) {
        msg = 'Invalid JS Object passed as parameter'
      } else if (!entry.onAdd) {
        msg = 'JS Object missing onAdd function call'
      }

      if(msg) {
        reject(msg)
      }

      for (let x in this.pool) {
        if (x === entry.id) {
          // Destroy current service
          this.destroy(x)
        }
      }

      // If max is reached remove last service
      length = Object.keys(this.pool).length

      if ((this.max > 0) && (length >= this.max)) {
        this.destroy(Object.keys(this.pool)[0])
      }

      // Add new Service
      this.pool[entry.id] = {
        service: entry.onAdd,
        test: entry.onTest,
        destroy: entry.onDestroy
      }

      resolve(this.pool[entry.id].service)
    })
  }

  get (id) {
    if (this.pool[id]) {
      return this.pool[id].service
    } else {
      return null
    }
  }

  test (id) {
    if (this.pool[id]) {
      if (this.pool[id].test) {
        return this.pool[id].test(this.pool[id].service)
      }
    }

    return null
  }

  destroy (id) {
    if (this.pool[id]) {
      if (this.pool[id].destroy) {
        this.pool[id].destroy(this.pool[id].service)
      }

      delete this.pool[id]
      return true
    }

    return null
  }
}

module.exports = ServicePool
