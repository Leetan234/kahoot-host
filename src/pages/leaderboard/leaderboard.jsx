import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, List, message, Button } from 'antd';
import { CrownFilled } from '@ant-design/icons';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from '@microsoft/signalr';
import './Leaderboard.css';
import CustomModal from './CustomModal'; // Import the custom modal

const { Title, Text } = Typography;

const medalIcons = {
  1: <CrownFilled style={{ color: '#FFD700', fontSize: 24 }} />,
  2: <CrownFilled style={{ color: '#C0C0C0', fontSize: 24 }} />,
  3: <CrownFilled style={{ color: '#cd7f32', fontSize: 24 }} />,
};

const Leaderboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [hubConnection, setHubConnection] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // First, get session info to determine game mode
        const sessionRes = await axios.get(
          `https://localhost:7153/api/gamesession/GetById/${sessionId}`
        );
        const mode = sessionRes.data.data.gameMode?.toLowerCase(); // adjust property name if different

        if (mode === 'team') {
          // Team mode: fetch team rankings
          const teamRes = await axios.get(
            `https://localhost:7153/api/team-results/ranking/session/${sessionId}`
          );
          const teamData = teamRes.data.data || [];
          // Map team results into common shape
          const mapped = teamData.map(item => ({
            ranking: item.rank,
            nickname: item.teamName,
            score: item.totalScore,
          }));
          setPlayers(mapped);
        } else {
          // Solo mode (default): fetch individual leaderboard
          const soloRes = await axios.get(
            `https://localhost:7153/api/gamesession/GetLeaderboard/${sessionId}`
          );
          setPlayers(soloRes.data.data || []);
        }
      } catch (err) {
        console.error('[fetchLeaderboard] Error:', err);
        message.error('Không thể tải bảng điểm');
      }
    };
    const conn = new HubConnectionBuilder()
      .withUrl(`https://localhost:7153/gameSessionHub`, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        console.log('[SignalR] Connected');
        conn.on('ReceiveNextQuestion', (data) => {
          console.log('[ReceiveNextQuestion] Data:', data);
          navigate(`/QuestionPage/${data.sessionId}/${data.qigId}`);
        });
      })
      .catch((err) => {
        console.error('[SignalR] Connect Error:', err);
        message.error('Không thể kết nối đến server');
      });

    setHubConnection(conn);

    if (sessionId) fetchLeaderboard();

    return () => {
      if (conn.state === HubConnectionState.Connected) {
        conn.stop();
        console.log('[SignalR] Connection stopped');
      }
    };
  }, [sessionId]);

  const handleNextClick = async () => {
    if (!hubConnection || hubConnection.state !== HubConnectionState.Connected) {
      message.error('Chưa kết nối server');
      return;
    }

    const qigStr = localStorage.getItem('QuestionInGame');
    if (!qigStr) {
      message.error('Không có QuestionInGame');
      return;
    }

    const qigId = parseInt(qigStr, 10);
    if (isNaN(qigId)) {
      message.error('QuestionInGame không hợp lệ');
      return;
    }

    try {
      console.log('[handleNextClick] Gọi NextQuestion:', sessionId, qigId);
      await hubConnection.invoke('NextQuestion', parseInt(sessionId, 10), qigId);

      const res = await axios.get(`https://localhost:7153/api/game-sessions/${sessionId}/questions-in-game`);
      console.log('[handleNextClick] API response:', res.data);
  
      const questions = Array.isArray(res.data.data) ? res.data.data : [];

      if (questions.length === 0) {
        message.error('Không có câu hỏi nào trong game');
        return;
      }

      const currentQuestion = questions.find(q => q.questionInGameId === qigId);
      if (!currentQuestion) {
        message.error('Không tìm thấy câu hỏi hiện tại');
        return;
      }

      const nextQuestion = questions
        .filter(q => q.orderIndex > currentQuestion.orderIndex)
        .sort((a, b) => a.orderIndex - b.orderIndex)[0];

      console.log('Next question:', nextQuestion);

      if (nextQuestion) {
        navigate(`/HostQuestionPage/${sessionId}/${nextQuestion.questionInGameId}`);
      } else {
        setModalContent('Đã hết câu hỏi. Bạn có muốn kết thúc trò chơi không?');
        setModalVisible(true);
      }
    } catch (err) {
      console.error('[handleNextClick] Error:', err);
      message.error('Lỗi khi tải câu hỏi tiếp theo');
    }
  };

  const handleModalConfirm = async () => {
    console.log('Game Ended');
    if (!hubConnection || hubConnection.state !== HubConnectionState.Connected) {
      message.error('Chưa kết nối server');
      return;
    }

    try {
      console.log('SessionId:', sessionId);
      await hubConnection.invoke('EndGameSession', parseInt(sessionId, 10));
      setModalVisible(false);
      message.success('Game ended successfully');
    } catch (err) {
      console.error('Error calling EndGameSession:', err);
      message.error('Failed to end game');
    }
  };

  const handleModalClose = () => {
    console.log('Game continues');
    setModalVisible(false);
  };

  return (
    <div className="leaderboard-wrapper">
      <div className="done-button-wrapper">
        <Button className="done-button" onClick={handleNextClick}>
          Next
        </Button>
      </div>
      <Title level={2} className="leaderboard-title" style={{ color: 'white' }}>
        Leaderboard
      </Title>
      <List
        itemLayout="horizontal"
        dataSource={players}
        style={{ width: '100%' }}
        renderItem={(item) => {
          const icon = medalIcons[item.ranking];
          return (
            <List.Item className="leader-item">
              <Row align="middle" style={{ width: '100%' }}>
                <Col flex="auto" className="leader-info">
                  <Col
                    flex="2px"
                    className="leader-rank"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
                    <Text strong>{item.ranking}</Text>
                  </Col>
                  <div className="leader-name">{item.nickname}</div>
                  <div className="leader-score">{item.score}</div>
                </Col>
              </Row>
            </List.Item>
          );
        }}
      />
      <CustomModal
        isVisible={isModalVisible}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        content={modalContent}
      />
    </div>
  );
};

export default Leaderboard;
