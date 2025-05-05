// src/Layout/Lobby.jsx
import React, { useState } from 'react';
import { Input, Button, Typography, List, Card, message } from 'antd';
import '../Lobby/Lobby.css';

const { Title } = Typography;

const Lobby = () => {
    const [gamePin, setGamePin] = useState('387 9574'); // Có thể random hoặc lấy từ props
    const [nickname, setNickname] = useState('');
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState([]);
    const [isStarted, setIsStarted] = useState(false);

    const handleJoin = () => {
        if (!nickname || !teamName) {
            message.warning('Vui lòng nhập cả tên và tên nhóm!');
            return;
        }
        const newPlayer = {
            name: nickname,
            team: teamName,
            id: Date.now(),
        };
        setPlayers([...players, newPlayer]);
        setNickname('');
        setTeamName('');
    };


    const handleStart = () => {
        if (players.length < 1) {
            message.error('Phải có ít nhất 1 người chơi để bắt đầu!');
            return;
        }
        setIsStarted(true);
        message.success('Trò chơi bắt đầu!');
    };

    return (
        <div className="lobby-container">
            <div className="header-container">
                <div className="pin-header">
                    <span className="pin-text">
                        Join at <b>www.kahoot.it</b> with Game PIN: <b>{gamePin}</b>
                    </span>
                </div>
            </div>
            <div className="title-bar">
                <h1 className="logo">QUIZZZZ!</h1>
            </div>
            <div className='button'>
                <Button type="primary" block style={{ backgroundColor: 'white', color: 'black', padding: '30px 30px', fontWeight: 'bold' }} onClick={handleJoin}>
                    Bắt đầu
                </Button>
            </div>
            <div className="player-list">
                <Title level={3} style={{ color: 'white' }}>Người chơi ({players.length})</Title>
                {players.length > 0 ? (
                    <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={players}
                        renderItem={(player) => (
                            <List.Item>
                                <Card title={player.name}>
                                    Nhóm: <b>{player.team}</b>
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="waiting-message">Waiting for players...</div>
                )}
            </div>


        </div>
    );
};

export default Lobby;