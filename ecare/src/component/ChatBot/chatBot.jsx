import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import styles from './chatBot.module.css';
import { chatWithBot, getChatHistory } from '../../services/chatServices';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getChatHistory();
      if (response.success) {
        setMessages(response.history.reverse());
      }
    } catch (error) {
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const userMessage = newMessage.trim();
    setNewMessage('');

    try {
      const response = await chatWithBot(userMessage);
      if (response.success) {
        setMessages(prev => [...prev, {
          message: userMessage,
          response: response.response,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <Paper className={styles.chatContainer} elevation={3}>
      <Box className={styles.chatHeader}>
        <Typography variant="h6">
          Medical Assistant
        </Typography>
        <Tooltip title="Clear chat">
          <IconButton onClick={clearChat} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box className={styles.messagesContainer}>
        {messages.length === 0 && !isLoading && (
          <Box className={styles.emptyState}>
            <Typography color="textSecondary">
              No messages yet. Start a conversation!
            </Typography>
          </Box>
        )}

        {messages.map((msg, index) => (
          <Box key={index} className={styles.messageWrapper}>
            <Box className={styles.userMessage}>
              <Typography>{msg.message}</Typography>
              <Typography variant="caption" className={styles.timestamp}>
                <AccessTimeIcon fontSize="small" />
                {formatTimestamp(msg.timestamp)}
              </Typography>
            </Box>
            <Box className={styles.botMessage}>
              <Typography>{msg.response}</Typography>
              <Typography variant="caption" className={styles.timestamp}>
                <AccessTimeIcon fontSize="small" />
                {formatTimestamp(msg.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box className={styles.loadingIndicator}>
            <CircularProgress size={20} />
            <Typography variant="body2">AI is thinking...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <form onSubmit={handleSend} className={styles.inputContainer}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your health-related question..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isLoading}
          inputRef={inputRef}
          InputProps={{
            className: styles.input
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
          disabled={isLoading || !newMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </Button>
      </form>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ChatBot;