import React from 'react';
import { Layout, Menu } from 'antd';
import { PictureOutlined, TagsOutlined, UploadOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'home';

  const items = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: 'manage',
      icon: <PictureOutlined />,
      label: <Link to="/manage">图片管理</Link>,
    },
    {
      key: 'tags',
      icon: <TagsOutlined />,
      label: <Link to="/tags">标签管理</Link>,
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: <Link to="/upload">上传图片</Link>,
    }
  ];

  return (
    <AntHeader style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[currentPath]}
        items={items}
      />
    </AntHeader>
  );
};

export default Header;