import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Empty, Spin, Image as AntImage, Button, message } from 'antd';
import { LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { imageService, UPLOADS_URL } from '../services/api';
import { Image } from '../types';

const { Meta } = Card;

const Home: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    fetchImages(searchQuery);
  }, [location.search]);

  const fetchImages = async (searchQuery: string = '') => {
    try {
      setLoading(true);
      const data = await imageService.getAll(searchQuery);
      setImages(data);
    } catch (error) {
      message.error('获取图片列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (image: Image) => {
    const imageUrl = `${UPLOADS_URL}${image.filepath}`;
    try {
      await navigator.clipboard.writeText(imageUrl);
      message.success('图片链接已复制到剪贴板');
    } catch (error) {
      message.error('复制失败，请手动复制');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await imageService.delete(id);
      message.success('删除成功');
      fetchImages();
    } catch (error) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="home-container">
      {images.length === 0 && !loading && location.search && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Empty 
            description={
              <span>
                没有找到匹配的图片
                <Button type="link" onClick={() => window.location.href = '/'}>
                  查看全部图片
                </Button>
              </span>
            }
          />
        </div>
      )}
      <Row gutter={[16, 24]}>
        {images.length > 0 ? (
          images.map((image) => (
            <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
              <Card
                hoverable
                cover={
                  <div className="card-image-container">
                    <AntImage
                      alt={image.title}
                      src={`${UPLOADS_URL}${image.filepath}`}
                      preview={{
                        src: `${UPLOADS_URL}${image.filepath}`,
                      }}
                    />
                  </div>
                }
                actions={[
                  <Button
                    key="copy"
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => handleCopyLink(image)}
                  >
                    复制链接
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(image.id)}
                  >
                    删除
                  </Button>
                ]}
              >
                <Meta
                  title={image.title}
                  description={
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(image.created_at).toLocaleString()}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="暂无图片" />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Home;
