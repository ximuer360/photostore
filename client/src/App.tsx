import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Upload from './pages/Upload';
import Home from './pages/Home';
import Header from './components/Header';
import Manage from './pages/Manage';
import './App.css';

const { Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <Layout className="layout">
      <Header />
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage" element={<Manage />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        PhotoStore ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;