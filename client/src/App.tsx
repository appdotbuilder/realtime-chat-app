
import { useState, useEffect } from 'react';
import { UserRegistration } from '@/components/UserRegistration';
import { UserList } from '@/components/UserList';
import { MessageChat } from '@/components/MessageChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, LogOut } from 'lucide-react';
import type { User } from '../../server/src/schema';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [view, setView] = useState<'users' | 'chat'>('users');

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleUserRegistered = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedChatUser(null);
    setView('users');
    localStorage.removeItem('currentUser');
  };

  const handleStartChat = (user: User) => {
    setSelectedChatUser(user);
    setView('chat');
  };

  const handleBackToUsers = () => {
    setSelectedChatUser(null);
    setView('users');
  };

  // If no user is logged in, show registration
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 ChatApp</h1>
            <p className="text-gray-600">Connect and chat with friends instantly</p>
          </div>
          <UserRegistration onUserRegistered={handleUserRegistered} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">💬 ChatApp</h1>
              <p className="text-sm text-gray-600">Welcome back, {currentUser.username}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {view === 'chat' && selectedChatUser && (
              <Button
                variant="outline"
                onClick={handleBackToUsers}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Back to Users</span>
              </Button>
            )}
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>ID: {currentUser.id}</span>
            </Badge>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {view === 'users' ? (
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Find Users to Chat With</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserList 
                currentUser={currentUser} 
                onStartChat={handleStartChat} 
              />
            </CardContent>
          </Card>
        ) : (
          selectedChatUser && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span>Chat with {selectedChatUser.username}</span>
                  <Badge variant="outline">ID: {selectedChatUser.id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MessageChat 
                  currentUser={currentUser} 
                  chatUser={selectedChatUser} 
                />
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Stub Data Notice */}
      <div className="fixed bottom-4 right-4">
        <Card className="bg-yellow-50 border-yellow-200 max-w-sm">
          <CardContent className="p-3 text-sm">
            <p className="text-yellow-800 font-medium mb-1">⚠️ Demo Mode</p>
            <p className="text-yellow-700">Using stub data - messages won't persist between sessions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
