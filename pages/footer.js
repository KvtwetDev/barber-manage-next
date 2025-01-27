import React, { Component } from 'react'

export default class Footer extends Component {
    render() {
        return (
            <footer className="homepage-footer">
                <div className='footer-content'>
                    <p>© 2024 Barber Manage. Todos os direitos reservados.</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p>Criado por:</p>
                    <a href='https://github.com/KvtwetDev' target='_blank'>Lucas Eduardo | Dev</a>
                </div>
            </footer>
        )
    }
}
