import React from 'react';
import { Form, Input, Button, Card, message, Switch } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { imageService } from '../services/api';
import ImageUploader from '../components/ImageUploader';

const UploadPage: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async (values: { title: string; is_public: boolean }) => {
    if (fileList.length === 0) {
      message.error('请选择要上传的图片');
      return;
    }

    setUploading(true);
    try {
      for (const file of fileList) {
        const result = await imageService.upload(file.originFileObj as File, {
          title: `${values.title}_${file.name}`,
          is_public: values.is_public
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      message.success('上传成功');
      setFileList([]);
      form.resetFields();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title="上传图片">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ is_public: false }}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入图片标题' }]}
          >
            <Input placeholder="请输入图片标题（多张图片会自动添加序号）" />
          </Form.Item>

          <Form.Item
            label="是否公开"
            name="is_public"
            valuePropName="checked"
          >
            <Switch checkedChildren="公开" unCheckedChildren="私密" />
          </Form.Item>

          <Form.Item label="图片">
            <ImageUploader
              fileList={fileList}
              onFileListChange={setFileList}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              disabled={fileList.length === 0}
              block
            >
              {uploading ? '上传中...' : '开始上传'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UploadPage; 