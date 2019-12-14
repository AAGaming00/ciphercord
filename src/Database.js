/**
 * CipherCord, secure E2EE chatting through Discord.
 * Copyright (C) 2019 Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto')
const { getModule } = require('powercord/webpack')

let userPassphrase = null

class Database {
  constructor (store) {
    this.store = store
  }

  // DATA MANAGEMENT
  isInitialized () {
    return !!this.store.get(`${this._userId}::_cc_test`)
  }

  get (key) {
    if (!userPassphrase) {
      throw new Error('Database not decrypted yet.')
    }

    const data = this.store.get(`${this._userId}::${key}`)
    return data ? this.decrypt(data, userPassphrase) : null
  }

  set (key, value) {
    if (!userPassphrase) {
      throw new Error('Database not decrypted yet.')
    }
    this.store.set(`${this._userId}::${key}`, this.encrypt(value, userPassphrase))
  }

  del (key) {
    if (!userPassphrase) {
      throw new Error('Database not decrypted yet.')
    }
    this.store.delete(`${this._userId}::${key}`)
  }

  // PASSPHRASE
  validatePassphrase (passphrase) {
    return typeof passphrase === 'string' && (/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{16,20})/).test(passphrase)
  }

  testPassphrase (passphrase) {
    try {
      const data = this.store.get(`${this._userId}::_cc_test`)
      this.decrypt(data, passphrase)
      return true
    } catch (_) {
      return false
    }
  }

  setPassphrase (passphrase) {
    if (userPassphrase) {
      for (const key of this.store.getKeys()) {
        const value = this.decrypt(this.store.get(key), userPassphrase)
        this.store.set(key, this.encrypt(value, passphrase))
      }
    }

    userPassphrase = passphrase
    this.set(`${this._userId}._cc_test`, 'owo whats this')
  }

  lock () {
    userPassphrase = null
  }

  // ENCODE/DECODE
  encrypt (data, passphrase) {
    const iv = randomBytes(16)
    const salt = randomBytes(32)
    const key = scryptSync(passphrase, salt, 32)

    const cipher = createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(JSON.stringify(data))
    encrypted = Buffer.concat([ encrypted, cipher.final() ])

    return `${salt.toString('hex')}::${iv.toString('hex')}::${encrypted.toString('hex')}`
  }

  decrypt (data, passphrase) {
    const [ salt, iv, encrypted ] = data.split('::')
    const key = scryptSync(passphrase, Buffer.from(salt, 'hex'), 32)

    const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'))
    decrypted = Buffer.concat([ decrypted, decipher.final() ])

    return JSON.parse(decrypted.toString())
  }

  // OTHER
  get _userId () {
    const userModule = getModule([ 'getCurrentUser' ], false)
    if (!userModule) throw new Error('User not logged in yet.')
    const user = userModule.getCurrentUser()
    if (!user) throw new Error('User not logged in yet.')
    return user.id
  }
}

module.exports = Database
