import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/config';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isInitial?: boolean;
}

interface FirstAidChatbotProps {
  visible: boolean;
  onClose: () => void;
  symptoms?: string[];
  emergencyId?: string;
}

const FirstAidChatbot: React.FC<FirstAidChatbotProps> = ({ 
  visible, 
  onClose, 
  symptoms = [], 
  emergencyId 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialGuidanceLoaded, setInitialGuidanceLoaded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load initial first aid guidance when modal opens
  useEffect(() => {
    if (visible && !initialGuidanceLoaded && symptoms.length > 0) {
      loadInitialGuidance();
    }
  }, [visible, symptoms]);

  const loadInitialGuidance = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth-token');
      const apiUrl = getApiUrl();

      const response = await axios.post(
        `${apiUrl}/first-aid/guidance`,
        {
          symptoms,
          message: null,
          conversationHistory: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Safely extract text from response
      let guidanceText = '';
      const guidance = response.data.data.guidance;
      if (typeof guidance === 'string') {
        guidanceText = guidance;
      } else if (guidance && typeof guidance === 'object') {
        guidanceText = guidance.message || guidance.text || guidance.output || JSON.stringify(guidance);
      } else {
        guidanceText = 'I\'m here to help. What would you like to know?';
      }

      const botMessage: Message = {
        id: Date.now(),
        text: guidanceText,
        sender: 'bot' as const,
        timestamp: new Date(),
        isInitial: true,
      };

      setMessages([botMessage]);
      setInitialGuidanceLoaded(true);
    } catch (error) {
      console.error('❌ Failed to load initial guidance:', error);
      // Show fallback message
      const fallbackMessage: Message = {
        id: Date.now(),
        text: '🏥 **Emergency First Aid**\n\n' +
          '1. Stay calm - ambulance is on the way\n' +
          '2. Monitor breathing and pulse\n' +
          '3. Keep the person comfortable\n' +
          '4. Do not move unless in danger\n\n' +
          '💬 Ask me any questions about first aid!',
        sender: 'bot' as const,
        timestamp: new Date(),
        isInitial: true,
      };
      setMessages([fallbackMessage]);
      setInitialGuidanceLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth-token');
      const apiUrl = getApiUrl();

      const conversationHistory = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await axios.post(
        `${apiUrl}/first-aid/guidance`,
        {
          symptoms,
          message: inputValue,
          conversationHistory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Safely extract text from response
      let guidanceText = '';
      const guidance = response.data.data.guidance;
      if (typeof guidance === 'string') {
        guidanceText = guidance;
      } else if (guidance && typeof guidance === 'object') {
        guidanceText = guidance.message || guidance.text || guidance.output || JSON.stringify(guidance);
      } else {
        guidanceText = 'I understand. How else can I help?';
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: guidanceText,
        sender: 'bot' as const,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error. Please try again or wait for the ambulance.',
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInitialGuidanceLoaded(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="medical" size={24} color="#fff" />
            <Text style={styles.headerTitle}>First Aid Guidance</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              {message.sender === 'bot' && (
                <View style={styles.botIcon}>
                  <Ionicons name="medical-outline" size={16} color="#2563eb" />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  message.sender === 'user' ? styles.userMessageContent : styles.botMessageContent,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp,
                  ]}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Analyzing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about first aid..."
            placeholderTextColor="#9CA3AF"
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSendMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[styles.sendButton, (!inputValue.trim() || isLoading) && styles.sendButtonDisabled]}
            disabled={!inputValue.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EF4444',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DC2626',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  botIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageContent: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageContent: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  botMessageContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#DBEAFE',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

export default FirstAidChatbot;
