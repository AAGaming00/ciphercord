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

const { React, getModuleByDisplayName } = require('powercord/webpack')
const { Button, AsyncComponent } = require('powercord/components')
const { TextInput } = require('powercord/components/settings')
const { close: closeModal } = require('powercord/modal')
const { Modal } = require('powercord/components/modal')

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'))

class PassphraseModal extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      passphrase: '',
      error: false
    }
  }

  render () {
    const { database } = this.props
    const initialized = database.isInitialized()

    return <Modal className='powercord-text ciphercord-passphrase'>
      <Modal.Header>
        <FormTitle tag='h4'>{initialized ? 'Unlock Database' : 'Welcome to CipherCord!'}</FormTitle>
      </Modal.Header>
      <Modal.Content className='contents'>
        {initialized
          ? <>You can skip this, but you won't be able to read or send messages to encrypted channels until you
            unlock the database.</>
          : <>Before you can use CipherCord, you must create a database. This database will contain all data CipherCord
            needs to function, including private keys to channels.<br/><br/>
            For your security, this database is saved encrypted and requires a passphrase to be read.</>}
        <TextInput
          type='password'
          error={this.state.error && 'Invalid passphrase'}
          note={this.renderNote()}
          defaultValue={this.state.passphrase}
          onChange={passphrase => this.setState({ passphrase })}
        >
          Passphrase
        </TextInput>
      </Modal.Content>
      <Modal.Footer>
        <Button
          onClick={() => {
            if (
              (initialized && database.testPassphrase(this.state.passphrase)) ||
              (!initialized && database.validatePassphrase(this.state.passphrase))
            ) {
              database.setPassphrase(this.state.passphrase)
              return closeModal()
            }
            this.setState({ error: true })
            return false
          }}
        >
          {initialized ? 'Unlock' : 'Create database'}
        </Button>
        {initialized &&
        <Button look={Button.Looks.LINK} color={Button.Colors.TRANSPARENT} onClick={closeModal}>Skip for now</Button>}
      </Modal.Footer>
    </Modal>
  }

  renderNote () {
    const length = <b className={this.state.passphrase.length >= 16 ? 'green' : 'red'}>16 characters long</b>
    const lower = <b className={(/[a-z]/).test(this.state.passphrase) ? 'green' : 'red'}>one lowercase letter</b>
    const upper = <b className={(/[A-Z]/).test(this.state.passphrase) ? 'green' : 'red'}>one uppercase letter</b>
    const number = <b className={(/[0-9]/).test(this.state.passphrase) ? 'green' : 'red'}>one number</b>
    const sp = <b className={(/[\W]/).test(this.state.passphrase) ? 'green' : 'red'}>one special character</b>

    return <>
      Must be at least {length}, and contain at least {lower}, {upper}, {number} and {sp}.
    </>
  }
}

module.exports = PassphraseModal
