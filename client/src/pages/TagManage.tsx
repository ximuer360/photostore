import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, message, Form, Input, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Tag } from '../types';
import { imageService } from '../services/api';

const TagManage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();

  const loadTags = async () => {
    setLoading(true);
    try {
      console.log('Loading tags...');
      const data = await imageService.getAllTags();
      console.log('Loaded tags:', data);
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      message.error('加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setEditModalVisible(true);
  };

  const handleEdit = (record: Tag) => {
    setEditingTag(record);
    form.setFieldsValue({
      name: record.name
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await imageService.deleteTag(id);
      message.success('删除成功');
      loadTags();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await imageService.updateTag(editingTag.id, values);
        message.success('更新成功');
      } else {
        try {
          await imageService.createTag(values);
          message.success('创建成功');
        } catch (error: any) {
          if (error.response?.status === 409) {
            message.warning('标签已存在');
          } else {
            message.error('创建失败');
          }
          return;
        }
      }
      setEditModalVisible(false);
      await loadTags();
    } catch (error) {
      console.error('Form validation or submission error:', error);
    }
  };

  const columns: ColumnsType<Tag> = [
    {
      title: '标签名',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '使用次数',
      dataIndex: 'usage_count',
      key: 'usage_count',
      width: '20%',
      sorter: (a, b) => (a.usage_count || 0) - (b.usage_count || 0),
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '30%',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            description={
              record.usage_count > 0 
                ? `该标签已被使用 ${record.usage_count} 次，删除可能影响相关图片。`
                : undefined
            }
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.usage_count > 0}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="tag-manage-container" style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新建标签
        </Button>
        <span>
          共 {tags.length} 个标签
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={editModalVisible}
        onOk={handleSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="标签名"
            rules={[
              { required: true, message: '请输入标签名' },
              { min: 1, max: 50, message: '标签名长度应在1-50个字符之间' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManage; 