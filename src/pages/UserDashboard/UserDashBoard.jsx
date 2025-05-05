import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Input,
  Table,
  Tag,
  Space,
  Button,
  Avatar,
  Row,
  Col,
  Dropdown,
} from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  SearchOutlined,
  BellOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './UserDashBoard.css';
import { useNavigate } from 'react-router-dom';
import {
  getAllQuiz,
  updateQuiz,
  createQuiz,
  deleteQuiz,
} from '../../services/QuizServices';
import GameSessionModal from './HostModal'; 
// import { getQuizByUserId } from '../../services/UserServices';
const { Header, Sider, Content } = Layout;


const UserDashBoard = () => {
  const currentUser =
    JSON.parse(localStorage.getItem('user')) &&
    JSON.parse(localStorage.getItem('user')).data &&
    JSON.parse(localStorage.getItem('user')).data.user;

  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [editedUser, setEditedUser] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);


  const handleHost = (quizId) => {
    setSelectedQuizId(quizId);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };


  const edit = (record) => {
    setEditingKey(record.quizId);
    setEditedUser({ ...record });
  };

  const save = async (key) => {
    const newData = data.map((item) =>
      item.quizId === key ? editedUser : item
    );

    try {
      const response = await updateQuiz(key, editedUser);
      setData(newData);
      setEditingKey('');
      console.log('Response:', response);
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const cancel = () => setEditingKey('');

  const handleChange = (e, field) => {
    setEditedUser({ ...editedUser, [field]: e.target.value });
  };

  const handleCreateQuiz = async () => {
    const newQuiz = {
      title: 'New Quiz',
      description: 'New Description',
      createdBy: currentUser && currentUser.userId,
      status: 'Inactive',
    };
    try {
      const response = await createQuiz(newQuiz);
      setData((prevData) => [...prevData, response.data]);
      setEditingKey(response.data.quizId);
      setEditedUser(response.data);
      console.log('Response:', response);
    } catch (error) {
      console.log('New Quiz: ', newQuiz);
      console.error('Error creating quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await deleteQuiz(quizId);
      console.log('Response:', response);
      setData(data.filter((item) => item.quizId !== quizId));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };
  const columns = [
    {
      title: 'Quizzz ID',
      dataIndex: 'quizId',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      render: (text, record) =>
        editingKey === record.quizId ? (
          <Input
            value={editedUser.title}
            onChange={(e) => handleChange(e, 'title')}
          />
        ) : (
          <>
            {record.title}
            <br />
          </>
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (text, record) =>
        editingKey === record.quizId ? (
          <Input
            value={editedUser.description}
            onChange={(e) => handleChange(e, 'description')}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '',
      render: (_, record) =>
        editingKey === record.quizId ? (
          <Space>
            <Button
              icon={<CheckOutlined />}
              type="primary"
              onClick={() => save(record.quizId)}
            />
            <Button icon={<CloseOutlined />} onClick={cancel} />
          </Space>
        ) : (
          <Button icon={<EditOutlined />} onClick={() => edit(record)}>
            Edit
          </Button>
        ),
    },
    {
      title: '',
      render: (_, record) => (
        <Button onClick={() => navigate(`/creator/${record.quizId}`)}>
          Questions
        </Button>
      ),
    },
    {
      title: '',
      render: (_, record) =>
        currentUser.role === 'Admin' ? (
          <Button
            style={{ backgroundColor: 'red', color: 'white' }}
            onClick={() => handleDeleteQuiz(record.quizId)}
          >
            Delete
          </Button>
        ) : (
              <Button onClick={() => handleHost(record.quizId)}>Host</Button>
        ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user data from local storage
    localStorage.removeItem('isLoggedIn'); // Remove login status from local storage
    console.log('Logging out');
    navigate('/'); // Redirect to login page
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzes = await getAllQuiz();
        console.log('Quizzes:', quizzes);
        setData(quizzes.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };
    fetchQuizzes();
    console.log(JSON.parse(localStorage.getItem('user')).data.user);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div
          style={{
            color: 'MenuText',
            padding: '20px 24px',
            fontWeight: 'bold',
            fontSize: 24,
          }}
        >
          QUIZZZZZZ
        </div>
        <Menu mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            Cá nhân
          </Menu.Item>
          <Menu.Item key="2" icon={<AppstoreOutlined />}>
            Thư viện
          </Menu.Item>
          <Menu.Item key="3" icon={<LineChartOutlined />}>
            Báo cáo
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="custom-header">
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BellOutlined style={{ fontSize: 18 }} />
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Profile',
                    icon: <UserOutlined />,
                    // onClick: () => navigate('/profile') // Navigate to the profile page
                  },
                  {
                    key: '2',
                    label: 'Logout',
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button type="text" style={{ padding: 0 }}>
                <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" />
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col>
              <h2 style={{ margin: 0 }}>Your Quizzzes</h2>
            </Col>
            {currentUser.role === 'Admin' && (
              <Col>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleCreateQuiz()}
                >
                  Create
                </Button>
              </Col>
            )}
          </Row>
          <Table columns={columns} dataSource={data} pagination={false} />
        </Content>
      </Layout>
      <GameSessionModal
        visible={isModalVisible}
        quizId={selectedQuizId}
        onClose={closeModal}
      />
    </Layout>
  );
};

export default UserDashBoard;
