import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message, Switch, Input, Form } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Image } from '../types';
import { imageService, UPLOADS_URL } from '../services/api';

const Manage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [form] = Form.useForm();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await imageService.getAll();
      setImages(data);
    } catch (error) {
      message.error('获取图片列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleEdit = (record: Image) => {
    setEditingImage(record);
    form.setFieldsValue({
      title: record.title,
      is_public: record.is_public,
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
          fetchImages();
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
        await imageService.update(editingImage.id, values);
        message.success('更新成功');
        setEditModalVisible(false);
        fetchImages();  // 重新加载数据
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`更新失败: ${error.message}`);
      } else {
        message.error('更新失败');
      }
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
      <Table
        columns={columns}
        dataSource={images}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

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