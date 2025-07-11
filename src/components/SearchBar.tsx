"use client";

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { describeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SearchBar() {
  const router = useRouter();
  const queryRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = queryRef.current?.value;
    if (searchQuery && searchQuery.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      router.push(searchUrl);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      startTransition(async () => {
        try {
          const result = await describeImageAction({ photoDataUri: base64String });
          
          if (result.isProduct) {
            toast({
              title: "Image Scanned!",
              description: `Searching for: "${result.description}"`,
            });
            router.push(`/search?q=${encodeURIComponent(result.description)}`);
          } else {
            toast({
              title: "Could not identify product",
              description: result.description,
              variant: "destructive",
            });
            clearImage();
          }
        } catch (error) {
          console.error('Image analysis failed:', error);
          toast({
            title: "Error analyzing image",
            description: "Please try again",
            variant: "destructive",
          });
          clearImage();
        }
      });
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      toast({
        title: "Error reading file",
        description: "Please try again",
        variant: "destructive",
      });
      clearImage();
    };
    
    reader.readAsDataURL(file);
  };
  
  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="flex items-center gap-2 md:gap-4 p-2 bg-background rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring">
        <div className="relative flex-grow flex items-center">
          {!imagePreview && (
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
          )}
          
          {imagePreview && (
            <div className="relative w-10 h-10 ml-2 mr-2 flex-shrink-0">
              <Image 
                src={imagePreview} 
                alt="search preview" 
                fill 
                className="rounded object-cover" 
                unoptimized
              />
            </div>
          )}
          
          <Input
            ref={queryRef}
            type="search"
            placeholder={imagePreview ? "Analyzing image..." : "Search for groceries, essentials..."}
            className={`w-full border-none shadow-none focus-visible:ring-0 h-12 text-base ${
              imagePreview ? 'pl-2' : 'pl-12'
            } disabled:opacity-100 disabled:cursor-wait`}
            disabled={!!imagePreview || isPending}
          />
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          disabled={isPending}
        />
        
        {isPending && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
        
        {!isPending && imagePreview && (
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
            onClick={clearImage}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Clear image</span>
          </Button>
        )}
        
        {!isPending && !imagePreview && (
          <>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground" 
              onClick={handleImageUploadClick}
            >
              <Camera className="h-5 w-5" />
              <span className="sr-only">Search by image</span>
            </Button>
            <Button type="submit" size="lg" className="h-12">
              <Search className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
