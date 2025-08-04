
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { UserPlus, AlertCircle } from 'lucide-react';
import type { User, RegisterUserInput } from '../../../server/src/schema';

interface UserRegistrationProps {
  onUserRegistered: (user: User) => void;
}

export function UserRegistration({ onUserRegistered }: UserRegistrationProps) {
  const [formData, setFormData] = useState<RegisterUserInput>({
    username: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // STUB: This will always succeed with placeholder data
      const user = await trpc.registerUser.mutate(formData);
      onUserRegistered(user);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev: RegisterUserInput) => ({ ...prev, username: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <span>Join ChatApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleUsernameChange}
              disabled={isLoading}
              className="text-center text-lg"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 text-center">
              Username must be 3-50 characters (letters, numbers, underscore, hyphen only)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !formData.username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Creating Account...' : 'Start Chatting 🚀'}
          </Button>
        </form>

        {/* Stub Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Demo Mode:</strong> Registration always succeeds with ID #1. 
            In production, this would check for existing usernames.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
