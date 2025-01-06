import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Switch, Input, Form, Select } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Image } from '../types';
import { imageService, UPLOADS_URL } from '../services/api';

interface ImageListProps {
  images: Image[];
  loading: boolean;
  onRefresh: () => void;
  existingTags: { id: number; name: string }[];
}

const ImageList: React.FC<ImageListProps> = ({ images, loading, onRefresh, existingTags }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [form] = Form.useForm();

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
          onRefresh();
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
        onRefresh();
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
    <>
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
          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入或选择标签"
              allowClear
            >
              {existingTags.map(tag => (
                <Select.Option key={tag.id} value={tag.name}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ImageList; 