import React, { useState } from 'react';
import { Input, Button, Checkbox, Typography, Divider, message } from 'antd';
import { GoogleOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createUser } from '../../services/UserServices';
import './RegisterMail.css';

const { Title, Text } = Typography;

const EmailRegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHuman, setIsHuman] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname; // 👈 nhận nickname từ bước trước

  const handleRegister = async () => {
    if (!email || !password) {
      message.error('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    if (!nickname) {
      message.error('Không có tên đăng nhập, vui lòng quay lại bước trước!');
      navigate('/register/username');
      return;
    }

    try {
      const result = await createUser({
        username: nickname,
        email,
        password,
      });

      message.success('Đăng ký thành công!');
      localStorage.setItem('user', JSON.stringify(result.data));
      localStorage.setItem('isLoggedIn', 'true');

      navigate('/');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      message.error('Đăng ký thất bại, vui lòng thử lại!');
    }
  };

  return (
    <div className="email-register-container">
      <Title level={2} className="title" style={{ color: 'white' }}>Tạo tài khoản</Title>

      <div className="register-box">
        <Title level={4}>Đăng ký bằng địa chỉ email</Title>

        <div className="field-group">
          <Text strong>Email</Text>
          <Input
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="large"
          />
        </div>

        <div className="field-group">
          <Text strong>Mật khẩu</Text>
          <Input.Password
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="large"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </div>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleRegister}
        >
          Đăng ký
        </Button>

        <div className="terms">
          Bằng việc đăng ký, bạn chấp nhận{' '}
          <Link href="#" target="_blank">Điều khoản và điều kiện</Link> của chúng tôi.
          Vui lòng đọc <Link href="#" target="_blank">Thông báo quyền riêng tư</Link>.
        </div>

        <Divider plain>hoặc</Divider>

        <Button icon={<GoogleOutlined />} block size="large">
          Tiếp tục với Google
        </Button>

        <div className="login-footer">
          <Text>Bạn đã có tài khoản? </Text>
          <Button type="link" className="login-link">
            <Link to="/">Đăng Nhập ngay</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailRegisterPage;