
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { Search, MessageCircle, Users, Info } from 'lucide-react';
import type { User } from '../../../server/src/schema';

interface UserListProps {
  currentUser: User;
  onStartChat: (user: User) => void;
}

export function UserList({ currentUser, onStartChat }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // STUB: Create some demo users for demonstration
  const demoUsers: User[] = [
    { id: 2, username: 'alice_demo', created_at: new Date() },
    { id: 3, username: 'bob_chat', created_at: new Date() },
    { id: 4, username: 'charlie_2024', created_at: new Date() },
    { id: 5, username: 'diana_messages', created_at: new Date() }
  ];

  const loadAllUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await trpc.getAllUsers.query();
      // STUB: Since getAllUsers returns empty array, use demo users
      if (allUsers.length === 0) {
        setUsers(demoUsers.filter((user: User) => user.id !== currentUser.id));
      } else {
        setUsers(allUsers.filter((user: User) => user.id !== currentUser.id));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // STUB: Fallback to demo users on error
      setUsers(demoUsers.filter((user: User) => user.id !== currentUser.id));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser.id, demoUsers]);

  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchUsername.trim()) {
      setSearchError('Please enter a username to search');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const user = await trpc.getUserByUsername.query({ username: searchUsername.trim() });
      if (user && user.id !== currentUser.id) {
        setSearchResult(user);
      } else if (user && user.id === currentUser.id) {
        setSearchError("You can't message yourself!");
      } else {
        // STUB: Check demo users if API returns null
        const demoUser = demoUsers.find((u: User) => 
          u.username.toLowerCase() === searchUsername.trim().toLowerCase()
        );
        if (demoUser) {
          setSearchResult(demoUser);
        } else {
          setSearchError('User not found. Try one of the suggested usernames below.');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = (user: User) => {
    onStartChat(user);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
          <Search className="w-5 h-5" />
          <span>Search for a User</span>
        </div>
        
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter username to search..."
            value={searchUsername}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchUsername(e.target.value);
              if (searchError) setSearchError(null);
            }}
            disabled={isSearching}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isSearching || !searchUsername.trim()}
            className="px-6"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {searchError && (
          <Alert variant="destructive">
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        {searchResult && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {searchResult.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{searchResult.username}</p>
                    <p className="text-sm text-gray-600">
                      Joined {searchResult.created_at.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">ID: {searchResult.id}</Badge>
                </div>
                <Button 
                  onClick={() => handleStartChat(searchResult)}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Users Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
            <Users className="w-5 h-5" />
            <span>Available Users</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAllUsers}
            disabled={isLoadingUsers}
          >
            {isLoadingUsers ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {isLoadingUsers ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i: number) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No other users found. Try searching for specific usernames above.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {users.map((user: User) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">
                          Joined {user.created_at.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">ID: {user.id}</Badge>
                    </div>
                    <Button 
                      onClick={() => handleStartChat(user)}
                      className="flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stub Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Demo Users Available:</p>
            <p>Try searching for: <strong>alice_demo</strong>, <strong>bob_chat</strong>, <strong>charlie_2024</strong>, or <strong>diana_messages</strong></p>
            <p className="mt-2 text-xs">In production, this would show real registered users from the database.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
