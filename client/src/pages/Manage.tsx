import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message, Switch, Input, Form, Select, Tag as AntTag, Spin, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Image, Tag } from '../types';
import { imageService, UPLOADS_URL } from '../services/api';

const Manage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [form] = Form.useForm();
  const [tags, setTags] = useState<Tag[]>([]);

  const loadData = async () => {
    if (loading) return; // 防止重复加载
    
    setLoading(true);
    try {
      console.log('Loading data...');
      
      // 获取图片列表
      const imagesData = await imageService.getAll();
      console.log('Loaded images:', imagesData);
      
      // 获取标签列表
      const tagsData = await imageService.getAllTags();
      console.log('Loaded tags:', tagsData);

      // 只有当两个请求都成功时才更新状态
      setImages(imagesData);
      setTags(tagsData);

    } catch (error) {
      // 不显示错误提示，只记录日志
      console.error('Data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 修改初始化逻辑
  useEffect(() => {
    loadData();
  }, []); // 移除错误处理，简化逻辑

  const handleEdit = (record: Image) => {
    setEditingImage(record);
    form.setFieldsValue({
      title: record.title,
      is_public: record.is_public,
      tags: record.tags || []
    });
    setEditModalVisible(true);
  };

  const handleDelete = (record: Image) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除 "${record.title}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await imageService.delete(record.id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingImage) {
        await imageService.update(editingImage.id, {
          title: values.title,
          is_public: values.is_public,
          tags: values.tags
        });
        message.success('更新成功');
        setEditModalVisible(false);
        loadData();
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  const columns: ColumnsType<Image> = [
    {
      title: '预览',
      key: 'preview',
      width: 100,
      render: (_, record) => (
        <img
          src={`${UPLOADS_URL}${record.filepath}`}
          alt={record.title}
          style={{ width: 50, height: 50, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: '是否公开',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (is_public: boolean) => (
        <Switch checked={is_public} disabled />
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, record) => (
        <span>
          {record.tags && record.tags.map(tag => (
            <AntTag key={tag} color="blue">{tag}</AntTag>
          ))}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="manage-container">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Empty description="暂无图片" />
          <Button 
            type="primary" 
            onClick={loadData} 
            style={{ marginTop: '16px' }}
          >
            重新加载
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={images}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      )}

      <Modal
        title="编辑图片信息"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="选择或输入标签"
              allowClear
            >
              {tags.map(tag => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="is_public"
            label="是否公开"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Manage; 