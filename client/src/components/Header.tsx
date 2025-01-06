import React, { useState, useCallback } from 'react';
import { Layout, Menu, Input } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PictureOutlined, UploadOutlined, SearchOutlined, BarsOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const menuItems = [
    {
      key: '/',
      icon: <PictureOutlined />,
      label: <Link to="/">图库</Link>,
    },
    {
      key: '/manage',
      icon: <BarsOutlined />,
      label: <Link to="/manage">图片管理</Link>,
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: <Link to="/upload">上传</Link>,
    },
  ];

  // 使用 debounce 防抖，避免频繁搜索
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value) {
        navigate(`/?search=${encodeURIComponent(value)}`);
      } else {
        navigate('/');
      }
    }, 300),
    [navigate]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  return (
    <AntHeader style={{ 
      position: 'fixed', 
      zIndex: 1, 
      width: '100%', 
      background: '#fff', 
      padding: '0 24px', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: '0 24px 0 0', fontSize: '18px' }}>PhotoStore</h1>
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Search
          placeholder="搜索图片..."
          allowClear
          value={searchValue}
          onChange={handleChange}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
    </AntHeader>
  );
};

export default Header;