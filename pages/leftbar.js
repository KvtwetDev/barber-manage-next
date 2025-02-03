import { useRouter } from 'next/router';
import './css/LeftBar.css';
import { useState, useEffect } from 'react';
import Footer from './footer';

import './css/Layout.css';

const LeftBar = () => {
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const router = useRouter();

  const handleActiveItem = (item) => {
    setActiveItem(item);
  };

  const handleNavigation = (path) => {
    router.push(path);
    handleActiveItem(path);
  };

  useEffect(() => {
    function adjustFontSize() {
      const width = window.innerWidth;
      const fontSize = Math.max(12, width / 100) + 'px';
      document.querySelector('.leftbar').style.fontSize = fontSize;
    }
    window.addEventListener('load', adjustFontSize);
    window.addEventListener('resize', adjustFontSize);

    return () => {
      window.removeEventListener('load', adjustFontSize);
      window.removeEventListener('resize', adjustFontSize);
    };
  }, []);
  

  return (
    <div className="leftbar" id="root">
      <div>
        <div className="logo">
          <h2>Barbearia</h2>
        </div>
        <nav className="menu">
          <ul>
            <li className="menu-item">
              <span
                className={activeItem === '/' ? 'active' : ''}
                onClick={() => handleNavigation('/')}
              >
                Página Inicial
              </span>
            </li>

            <li className="menu-item">
              <span
                className={activeItem === '/appointments' ? 'active' : ''}
                onClick={() => handleNavigation('/appointments')}
              >
                Agendamentos
              </span>
            </li>

            <li className="menu-item">
              <span
                className={activeItem === '/costumers' ? 'active' : ''}
                onClick={() => handleNavigation('/costumers')}
              >
                Clientes
              </span>
            </li>

            <li className="menu-item">
              <span
                className={activeItem === '/cash' ? 'active' : ''}
                onClick={() => handleNavigation('/cash')}
              >
                Caixa e Pagamentos
              </span>
            </li>

            <li className="menu-item">
              <span
                className={activeItem === '/admin' ? 'active' : ''}
                onClick={() => handleNavigation('/admin')}
              >
                Administração
              </span>
            </li>

            <li className="menu-item">
              <span style={{color: 'red'}}
                className={activeItem === '/settings' ? 'active' : ''}
                onClick={() => handleNavigation('/settings')}
              >
                Configurações
              </span>
            </li>
          </ul>
        </nav>
        <div className="logout">
          <ul>
            <li className="menu-item">
              <span style={{color: 'red'}} onClick={() => handleNavigation('/logout')}>Sair</span>
            </li>
          </ul>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default LeftBar;
