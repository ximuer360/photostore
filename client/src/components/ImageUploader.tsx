import React from 'react';
import { Upload, Modal, message } from 'antd';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';

interface ImageUploaderProps {
  fileList: UploadFile[];
  onFileListChange: (fileList: UploadFile[]) => void;
  maxCount?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  fileList,
  onFileListChange,
  maxCount = 8
}) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewTitle, setPreviewTitle] = React.useState('');

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    onFileListChange(info.fileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        accept="image/*"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        beforeUpload={(file: File) => {
          if (!file.type.startsWith('image/')) {
            message.error('只能上传图片文件！');
            return Upload.LIST_IGNORE;
          }
          
          const isLt5M = file.size / 1024 / 1024 < 5;
          if (!isLt5M) {
            message.error('图片不能超过5MB！');
            return Upload.LIST_IGNORE;
          }

          return false;
        }}
        onChange={handleChange}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default ImageUploader; 