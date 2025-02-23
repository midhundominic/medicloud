import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  CircularProgress,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import styles from './geminiChat.module.css'
import { chatWithBot, getChatHistory } from '../../../services/geminiServices';
import logo from "../../../assets/images/logo.png"


const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);




  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

 

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getChatHistory();
      if (response.success) {
        const formattedMessages = [];
        response.history.forEach(msg => {
          // Add user message
          formattedMessages.push({
            text: msg.message,
            sender: 'user',
            timestamp: new Date(msg.timestamp)
          });
          // Add bot response
          formattedMessages.push({
            text: msg.response,
            sender: 'bot',
            timestamp: new Date(msg.timestamp)
          });
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || isRateLimited) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await chatWithBot(inputMessage);
      
      if (response.success) {
        const botMessage = {
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className={styles.homecontainer}>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.header}>
        <img src={logo} alt="Logo" className={styles.logo} />
          <Typography variant="h5" component="h1">
            medicloud AI 
          </Typography>
        </div>

        <div className={styles.chatwrapper}>
          <Paper elevation={3} className={styles.chatbotcontainer}>
            <Box className={styles.chatbotheader}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#fff', color: '#0277bd' }}>
                  <SmartToyIcon />
                </Avatar>
                <Typography variant="h6">
                  Chat Assistant
                </Typography>
              </Box>
              <Tooltip title="Clear Chat">
                <IconButton 
                  onClick={clearChat} 
                  color="inherit" 
                  disabled={messages.length === 0}
                >
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box className={styles.messagescontainer}>
              {messages.length === 0 ? (
                <Box className={styles.emptyState}>
                  <SmartToyIcon sx={{ fontSize: 48, color: '#0277bd', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Welcome to AI Assistant!
                  </Typography>
                  <Typography color="textSecondary">
                    Start a conversation by typing a message below.
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Fade in={true} key={index}>
                    <Box
                      className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: message.sender === 'user' ? '#0277bd' : '#b3e5fc',
                            color: message.sender === 'user' ? '#fff' : '#0277bd',
                            width: 32,
                            height: 32
                          }}
                        >
                          {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <div className={styles.messagecontent}>
                            {message.text}
                          </div>
                          <div className={styles.timestamp}>
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                ))
              )}
              {isLoading && (
                <Box className={styles.messagebotmessage}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#b3e5fc',
                        color: '#0277bd',
                        width: 32,
                        height: 32
                      }}
                    >
                      <SmartToyIcon />
                    </Avatar>
                    <div className={styles.loadingdots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <form onSubmit={handleSendMessage} className={styles.inputcontainer}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={isRateLimited ? "Please wait..." : "Type your message..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading || isRateLimited}
                inputRef={inputRef}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    '&:focus-within': {
                      backgroundColor: '#ffffff'
                    }
                  }
                }}
              />
              <IconButton
                type="submit"
                disabled={isLoading || isRateLimited || !inputMessage.trim()}
                sx={{
                  bgcolor: '#0277bd',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#015384'
                  },
                  '&:disabled': {
                    bgcolor: '#e5e7eb',
                    color: '#9ca3af'
                  },
                  width: '50px',
                  height: '50px'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </form>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;