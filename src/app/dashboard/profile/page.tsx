
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
    const { user } = useAuth();

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };
      
    if (!user) {
        return null;
    }

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                     <Avatar className="h-20 w-20 text-3xl">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {getInitials(user.name || 'U')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-2xl font-semibold">{user.name}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-primary capitalize pt-1">{user.role?.replace('-', ' ')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
