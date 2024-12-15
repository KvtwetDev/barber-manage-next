import React from 'react';
import LeftBar from './leftbar';
import './css/Layout.css';

const Layout = ({ children }) => {

  return (
    <div className="layout" id="root">
      <div className="leftbar">
      <LeftBar />
      </div>
        <div className="content">{children}</div>
    </div>
  );
};

export default Layout;