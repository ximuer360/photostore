import React from 'react';
import { Menu } from 'antd';
import { PictureOutlined, TagsOutlined, UploadOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();

  const items = [
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
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname.split('/')[1] || 'home']}
      items={items}
    />
  );
};

export default Layout; 