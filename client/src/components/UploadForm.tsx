import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { imageService } from '../services/api';
import type { Tag } from '../types';

const UploadForm: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    // 加载已有标签
    const loadTags = async () => {
      try {
        const tagList = await imageService.getAllTags();
        setTags(tagList);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  return (
    <Form>
      {/* 其他表单项 */}
      <Form.Item name="tags" label="标签">
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
    </Form>
  );
};

export default UploadForm; 