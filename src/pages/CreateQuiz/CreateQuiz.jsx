import React, { useEffect, useState } from 'react';
import {
  Layout,
  Input,
  Upload,
  Button,
  Select,
  Typography,
  Row,
  Col,
  Card,
  Checkbox,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  CopyOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import './CreateQuiz.css';
import {
  getQuizQuestions,
  updateQuizQuestion,
  createQuizQuestion,
  deleteQuizQuestion,
} from '../../services/QuizServices';
import { useLocation, useNavigate } from 'react-router-dom';
const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const answerStyles = [
  { color: 'red', icon: '▲' },
  { color: 'blue', icon: '◆' },
  { color: 'yellow', icon: '●' },
  { color: 'green', icon: '■' },
];

const CreateQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = location.pathname.split('/').pop();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [timeLimit, setTimeLimit] = useState(20);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleAddQuestion = async () => {
    try {
      const response = await createQuizQuestion(quizId, {
        quizId: quizId,
        text: 'New Question',
        timeLimit: 20,
        imageUrl: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctOption: 0,
        orderIndex: questions.length,
        createdTime: new Date().toISOString(),
        status: 'active',
      });
      setQuestions([...questions, response.data]);
      setSelectedQuestion(questions.length);
      setAnswers(['', '', '', '']);
      setCorrectAnswer(null);
    } catch (error) {
      console.error('Error creating quiz question:', error);
    }
  };

  const handleRemoveQuestion = async (index) => {
    // const updatedQuestions = questions.filter((_, i) => i !== index);
    // setQuestions(updatedQuestions);
    // if (selectedQuestion >= updatedQuestions.length) {
    //   setSelectedQuestion(updatedQuestions.length - 1);
    // }
    try {
      await deleteQuizQuestion(questions[index].questionId);
      setQuestions(questions.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting quiz question:', error);
    }
  };

  const handleSaveQuestion = async () => {
    const question = getQuestion();
    const updatedData = {
      questionId: question.questionId,
      quizId: quizId,
      text: question.text,
      timeLimit: timeLimit,
      imageUrl: question.imageUrl,
      option1: answers[0],
      option2: answers[1],
      option3: answers[2],
      option4: answers[3],
      orderIndex: question.orderIndex,
      correctOption: correctAnswer,
      status: question.status,
    };
    try {
      const response = await updateQuizQuestion(
        question.questionId,
        updatedData
      );
      console.log(response);
    } catch (error) {
      console.error('Error updating quiz question:', error);
    }
  };

  const getQuestion = () => {
    const question = questions.find((q) => q.questionId === selectedQuestion);
    console.log(question);
    return question;
  };

  useEffect(() => {
    const fetchQuizQuestion = async () => {
      console.log(quizId);
      const response = await getQuizQuestions(quizId);
      setQuestions(response.data);
      setSelectedQuestion(response.data[0].questionId);
      setAnswers([
        response.data[0].option1,
        response.data[0].option2,
        response.data[0].option3,
        response.data[0].option4,
      ]);
      setCorrectAnswer(response.data[0].correctOption);
      setTimeLimit(response.data[0].timeLimit);
    };
    fetchQuizQuestion();
  }, [quizId]);

  return (
    <Layout className="createquiz-container">
      {/* Sidebar */}
      <Sider width={200} className="quiz-sider">
        <div className="quiz-sider-scroll">
          {questions.map((q, index) => (
            <div
              key={q.questionId}
              className={`question-thumb ${
                selectedQuestion === q.questionId ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedQuestion(q.questionId);
                setAnswers([q.option1, q.option2, q.option3, q.option4]);
                setCorrectAnswer(q.correctOption);
                setTimeLimit(q.timeLimit);
              }}
            >
              <div className="question-thumb-header">
                <span className="question-number">Câu {index + 1}</span>
                <CloseOutlined
                  className="remove-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuestion(index);
                  }}
                />
              </div>
              {/* <p>{q.text}</p> */}
              <div className="question-preview" />
            </div>
          ))}
        </div>
        <Button
          className="add-question-btn"
          icon={<PlusOutlined />}
          onClick={handleAddQuestion}
        >
          Thêm câu hỏi
        </Button>
      </Sider>

      {/* Main Content */}
      <Content className="quiz-content">
        <Title level={4} className="quiz-title">
          Bắt đầu nhập câu hỏi
        </Title>
        {getQuestion() && (
          <Input
            className="question-input-text"
            placeholder="Nhập câu hỏi"
            value={getQuestion().text || ''}
            onChange={(e) => {
              setQuestions(
                questions.map((q) =>
                  q.questionId === selectedQuestion
                    ? { ...q, text: e.target.value }
                    : q
                )
              );
            }}
          />
        )}
        {/* 
        <div className="media-upload-box">
          <Upload>
            <Button icon={<UploadOutlined />}>Tải tệp tin lên</Button>
          </Upload>
        </div> */}

        <Row gutter={[16, 16]}>
          {[0, 1, 2, 3].map((i) => {
            const isFilled = !!answers[i];
            const styleClass = isFilled
              ? `answer-card answer-${answerStyles[i].color}`
              : 'answer-card default';

            return (
              <Col span={12} key={i}>
                <Card
                  className={`${styleClass} ${
                    correctAnswer === i ? 'selected' : ''
                  }`}
                  onClick={() => {
                    if (isFilled) {
                      setQuestions(
                        questions.map((q) => {
                          if (q.questionId === selectedQuestion) {
                            return { ...q, correctOption: i };
                          }
                          return q;
                        })
                      );
                      setCorrectAnswer(i);
                    }
                  }}
                >
                  <div className="answer-header-b">
                    <span className="answer-icon">{answerStyles[i].icon}</span>
                    {isFilled && (
                      <Checkbox
                        checked={correctAnswer === i}
                        onChange={() => {
                          setQuestions(
                            questions.map((q) => {
                              if (q.questionId === selectedQuestion) {
                                return { ...q, correctOption: i };
                              }
                              return q;
                            })
                          );
                        }}
                        className="answer-checkbox"
                      />
                    )}
                  </div>
                  <Input
                    className="answer-input"
                    placeholder={`Thêm đáp án ${i + 1} ${
                      i >= 2 ? '(không bắt buộc)' : ''
                    }`}
                    value={answers[i]}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Content>

      {/* Settings Panel */}
      <Sider width={280} className="quiz-settings" theme="light">
        <div className="setting-group">
          <p className="setting-label">Giới hạn thời gian</p>
          <InputNumber
            min={5}
            max={60}
            value={timeLimit}
            onChange={(value) => setTimeLimit(value)}
          />
        </div>

        <div className="setting-actions">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/UserMenu')}
          >
            Quay lại
          </Button>
          <Button icon={<SaveOutlined />} onClick={handleSaveQuestion}>
            Lưu
          </Button>
        </div>
      </Sider>
    </Layout>
  );
};

export default CreateQuiz;
