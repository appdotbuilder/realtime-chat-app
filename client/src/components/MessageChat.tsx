
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/utils/trpc';
import { Send, RefreshCw, Info } from 'lucide-react';
import type { User, Message, SendMessageInput } from '../../../server/src/schema';

interface MessageChatProps {
  currentUser: User;
  chatUser: User;
}

export function MessageChat({ currentUser, chatUser }: MessageChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // STUB: Create some demo messages for demonstration
  const demoMessages: Message[] = [
    {
      id: 1,
      sender_id: chatUser.id,
      receiver_id: currentUser.id,
      content: `Hey ${currentUser.username}! How are you doing? 👋`,
      created_at: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 2,
      sender_id: currentUser.id,
      receiver_id: chatUser.id,
      content: "Hi there! I'm doing great, thanks for asking! How about you?",
      created_at: new Date(Date.now() - 3300000) // 55 minutes ago
    },
    {
      id: 3,
      sender_id: chatUser.id,
      receiver_id: currentUser.id,
      content: "I'm doing well too! This chat app is pretty cool 😎",
      created_at: new Date(Date.now() - 3000000) // 50 minutes ago
    }
  ];

  const loadMessageHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const messageHistory = await trpc.getMessageHistory.query({
        user1_id: currentUser.id,
        user2_id: chatUser.id,
        limit: 50,
        offset: 0
      });

      // STUB: Since getMessageHistory returns empty array, use demo messages
      if (messageHistory.length === 0) {
        setMessages(demoMessages);
      } else {
        // Sort messages by creation date (oldest first for chat display)
        setMessages(messageHistory.sort((a: Message, b: Message) => 
          a.created_at.getTime() - b.created_at.getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
      // STUB: Fallback to demo messages on error
      setMessages(demoMessages);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, chatUser.id, demoMessages]);

  useEffect(() => {
    loadMessageHistory();
  }, [loadMessageHistory]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    const messageContent = newMessage.trim();
    setIsSending(true);

    try {
      const messageInput: SendMessageInput = {
        sender_id: currentUser.id,
        receiver_id: chatUser.id,
        content: messageContent
      };

      const sentMessage = await trpc.sendMessage.mutate(messageInput);
      
      // Add the new message to the list
      setMessages((prev: Message[]) => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // STUB: Even if API fails, add message locally for demo purposes
      const stubMessage: Message = {
        id: Date.now(), // Use timestamp as ID for demo
        sender_id: currentUser.id,
        receiver_id: chatUser.id,
        content: messageContent,
        created_at: new Date()
      };
      setMessages((prev: Message[]) => [...prev, stubMessage]);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i: number) => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p>Start the conversation by sending a message below! 💬</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message) => {
              const isCurrentUser = message.sender_id === currentUser.id;
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.created_at)}</span>
                      <Badge 
                        variant={isCurrentUser ? 'secondary' : 'outline'} 
                        className="ml-2 text-xs"
                      >
                        #{message.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder={`Type a message to ${chatUser.username}...`}
            value={newMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
            maxLength={1000}
          />
          <Button 
            type="button"
            variant="outline"
            onClick={loadMessageHistory}
            disabled={isLoading}
            className="px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            type="submit" 
            disabled={isSending || !newMessage.trim()}
            className="px-6"
          >
            {isSending ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {newMessage.length}/1000 characters
        </div>
      </div>

      {/* Stub Notice */}
      <Alert className="m-4 bg-yellow-50 border-yellow-200">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-yellow-800">
          <strong>Demo Chat:</strong> Messages are simulated and won't persist. 
          Real-time updates require WebSocket implementation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
