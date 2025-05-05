import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputNumber, Radio } from 'antd';
import axios from 'axios';
import moment from 'moment'; // nếu chưa cài, chạy: npm install moment
import { useNavigate } from 'react-router-dom';

const GameSessionModal = ({ visible, onClose, quizId }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [generatedPin, setGeneratedPin] = useState('');
  const navigate = useNavigate();

  // hàm sinh PIN 6 chữ số
  const generatePin = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  useEffect(() => {
    if (visible) {
      // mỗi lần mở modal:
      const pin = generatePin();
      setGeneratedPin(pin);
      form.resetFields();
      form.setFieldsValue({
        quizId,
        gameMode: 'solo', // default
        maxPlayers: 1,
      });
    }
  }, [visible, quizId, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        quizId: values.quizId,
        startedAt: moment().toISOString(),  // auto timestamp
        status: 'Pending',                 // auto pending
        pin: generatedPin,
        enableSpeedBonus: true,
        enableStreak: true,
        gameMode: values.gameMode,
        maxPlayers: values.maxPlayers,
        autoAdvance: true,
        showLeaderboard: true,
        loadingInGame: true,
      };

      await axios.post(
        'https://localhost:7153/api/gamesession/Create',
        payload
      );

      onClose();
      // chuyển hướng dựa trên chế độ chơi
      if (values.gameMode === 'solo') {
        navigate(`/host/${generatedPin}`);
      } else {
        navigate(`/teamlobbyhost/${generatedPin}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Tạo Game Session"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        {/* Quiz ID (readonly) */}
        <Form.Item name="quizId">
          <InputNumber value={quizId} disabled style={{ width: '100%' }} />
        </Form.Item>

        {/* Game Mode: team hoặc solo */}
        <Form.Item
          name="gameMode"
          label="Chế độ chơi"
          rules={[{ required: true, message: 'Chọn chế độ chơi' }]}
        >
          <Radio.Group>
            <Radio value="solo">Solo</Radio>
            <Radio value="team">Team</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Max Players */}
        <Form.Item
          name="maxPlayers"
          label="Số người chơi tối đa"
          rules={[{ required: true, message: 'Nhập số người chơi tối đa' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        {/* Submit / Cancel */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create
          </Button>
          <Button style={{ marginTop: 8 }} onClick={onClose} block>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GameSessionModal;
