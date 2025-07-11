'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { suggestAlternativesAction } from '@/app/actions';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: React.ReactNode;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi there! I'm the Quickart Assistant. Looking for a substitute for an out-of-stock item? Just ask!",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    const userQuery = inputValue;
    setInputValue('');

    startTransition(async () => {
      const result = await suggestAlternativesAction(userQuery);
      
      const assistantResponse: React.ReactNode = (
        <div className="space-y-4">
          <p>{result.responseMessage}</p>
          {result.suggestions && result.suggestions.length > 0 && (
            <div className='space-y-2'>
              <p className="font-semibold">Here are my top suggestions:</p>
              <ul className='space-y-3'>
                {result.suggestions.map((suggestion, index) => (
                   <li key={index} className='p-3 bg-background/50 rounded-md border'>
                        <h4 className='font-semibold'>{suggestion.name}</h4>
                        <p className='text-sm text-muted-foreground'>{suggestion.description}</p>
                        <p className='text-xs italic mt-2 text-primary'>"{suggestion.reason}"</p>
                   </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          <span className="sr-only">Toggle Chatbot</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in-50 duration-300">
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                Quickart Assistant
              </CardTitle>
              <CardDescription>Get help with product alternatives.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'rounded-lg p-3 max-w-[80%] text-sm',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.content}
                      </div>
                      {message.role === 'user' && (
                         <Avatar className="w-8 h-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                       <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                         <Loader2 className="w-4 h-4 animate-spin"/>
                         <span>Finding alternatives...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for an alternative..."
                  disabled={isPending}
                />
                <Button type="submit" size="icon" disabled={isPending || !inputValue.trim()}>
                  <Send className="w-4 h-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
