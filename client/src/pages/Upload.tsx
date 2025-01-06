import React, { useState, useEffect } from 'react';
import { Upload as AntUpload, Form, Input, Switch, Button, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Tag } from '../types';
import { imageService } from '../services/api';

const Upload: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // 加载可用标签
  useEffect(() => {
    const loadAvailableTags = async () => {
      try {
        console.log('Loading available tags...');
        const tagList = await imageService.getAllTags();
        console.log('Available tags:', tagList);
        if (Array.isArray(tagList)) {
          setAvailableTags(tagList);
        }
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadAvailableTags();
  }, []);

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (!fileList[0]?.originFileObj) {
        message.error('请选择要上传的图片');
        return;
      }

      setUploading(true);

      const result = await imageService.upload(fileList[0].originFileObj, {
        title: values.title,
        is_public: values.is_public,
        tags: values.tags || []
      });

      if (result.success) {
        message.success('上传成功');
        setFileList([]);
        form.resetFields();
      } else {
        message.error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    setFileList([{ uid: '-1', name: file.name, originFileObj: file } as UploadFile]);
    return false;
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入图片标题" />
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
            options={availableTags.map(tag => ({
              label: `${tag.name} (${tag.usage_count})`,
              value: tag.name
            }))}
          />
        </Form.Item>

        <Form.Item
          name="is_public"
          label="是否公开"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        <Form.Item label="图片">
          <AntUpload
            listType="picture"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onRemove={() => {
              setFileList([]);
              return true;
            }}
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </AntUpload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            style={{ width: '100%' }}
          >
            {uploading ? '上传中...' : '开始上传'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Upload; 