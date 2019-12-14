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

const { resolve } = require('path')
const { React, getModule } = require('powercord/webpack')
const { Plugin } = require('powercord/entities')
const { sleep } = require('powercord/util')
const { open: openModal } = require('powercord/modal')

const Database = require('./src/Database')
const PassphraseModal = require('./components/PassphraseModal')

module.exports = class CipherCord extends Plugin {
  constructor () {
    super()
    this.database = new Database(this.settings)
  }

  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'))

    this.injectMessages()
    this.injectChatBar()
    const userModule = await getModule([ 'getCurrentUser' ])
    while (!userModule.getCurrentUser()) await sleep(10)

    openModal(() => React.createElement(PassphraseModal, { database: this.database }))
  }

  pluginWillUnload () {
    // UwU
  }

  async injectMessages () {
    // owo
  }

  async injectChatBar () {
    // owo
  }
}
