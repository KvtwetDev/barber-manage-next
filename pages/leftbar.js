import { useRouter } from 'next/router';
import './css/LeftBar.css';
import { useState, useEffect } from 'react';

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
      <div className="logo">
        <h2>Barber Manage</h2>
      </div>
      <nav className="menu">
        <ul>
          <li className="menu-item">
            <span
              className={activeItem === '/dashboard' ? 'active' : ''}
              onClick={() => handleNavigation('/dashboard')}
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
              className={activeItem === '/stock' ? 'active' : ''}
              onClick={() => handleNavigation('/stock')}
            >
              Serviços e Produtos
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

          <li className="menu-item" onClick={() => setAdminOpen(!isAdminOpen)}>
            <span>Administração</span>
            {isAdminOpen && (
              <ul className="submenu">
                <li>
                  <span
                    className={activeItem === '/admindashboard' ? 'active' : ''}
                    onClick={() => handleNavigation('/admindashboard')}
                  >
                    Dashboard
                  </span>
                </li>
                <li>
                  <span
                    className={activeItem === '/employees' ? 'active' : ''}
                    onClick={() => handleNavigation('/employees')}
                  >
                    Funcionários
                  </span>
                </li>
                <li>
                  <span
                    className={activeItem === '/reports' ? 'active' : ''}
                    onClick={() => handleNavigation('/reports')}
                  >
                    Relatórios
                  </span>
                </li>
                <li>
                  <span
                    className={activeItem === '/access-management' ? 'active' : ''}
                    onClick={() => handleNavigation('/access-management')}
                  >
                    Gestão de Acessos
                  </span>
                </li>
                <li>
                  <span
                    className={activeItem === '/logs' ? 'active' : ''}
                    onClick={() => handleNavigation('/logs')}
                  >
                    Logs de Atividades
                  </span>
                </li>
              </ul>
            )}
          </li>

          <li className="menu-item">
            <span
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
            <span onClick={() => handleNavigation('/logout')}>Sair</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeftBar;
