
'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2, AlertCircle, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractPrescriptionAction, searchItemsFromFirestore } from '@/app/actions';
import type { ExtractPrescriptionOutput } from '@/ai/flows/extract-prescription-flow';
import { useCart } from '@/hooks/use-cart';
import type { Item } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PrescriptionUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractPrescriptionOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setExtractedData(null);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      startTransition(async () => {
        const result = await extractPrescriptionAction({ photoDataUri: base64String });
        if (result.isReadable && result.medicines.length > 0) {
            setExtractedData(result);
            setIsDialogOpen(true);
        } else {
            setError(result.error || "Could not read the prescription. Please upload a clearer image.");
            URL.revokeObjectURL(newPreviewUrl);
            setPreviewUrl(null);
        }
      });
    };
  };

  const handleContinueToOrder = async () => {
    if (!extractedData) return;

    setIsProcessingOrder(true);

    const allItems: Item[] = await searchItemsFromFirestore(''); // Fetch all
    
    let itemsAddedCount = 0;
    
    extractedData.medicines.forEach(medicine => {
        // Simple search: find an item whose name includes the extracted medicine name
        const foundItem = allItems.find(item => item.name.toLowerCase().includes(medicine.name.toLowerCase()));
        if (foundItem) {
            addToCart(foundItem, { silent: true });
            itemsAddedCount++;
        }
    });

    if (itemsAddedCount > 0) {
        toast({
            title: "Items Added to Cart",
            description: `${itemsAddedCount} medicine(s) from your prescription were found and added to your cart.`
        });
    } else {
        toast({
            title: "No Items Found",
            description: "We couldn't find any of the prescribed medicines in our inventory.",
            variant: "destructive"
        });
    }

    setIsProcessingOrder(false);
    setIsDialogOpen(false);
    resetState();
    router.push('/checkout');
  }

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    setIsDialogOpen(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <Card className="max-w-5xl mx-auto bg-primary/5 border-primary/20 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left side: Upload Prescription */}
          <div className="p-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-center">
            {isPending ? (
                <div className="flex flex-col items-center justify-center w-full min-h-[220px] gap-4 text-center">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <h3 className="text-xl font-bold text-foreground">Analyzing Prescription...</h3>
                    <p className="text-muted-foreground text-sm">Our AI is reading your upload. Please wait a moment.</p>
                </div>
            ) : (
                <div className='w-full text-center'>
                    <div className='relative w-full min-h-[220px] flex flex-col items-center justify-center'>
                    {previewUrl ? (
                         <Image
                            src={previewUrl}
                            alt="Prescription preview"
                            width={200}
                            height={200}
                            className="rounded-lg object-contain mx-auto max-h-48"
                         />
                    ): (
                        <>
                            <svg
                                width="120"
                                height="100"
                                viewBox="0 0 120 100"
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex-shrink-0"
                                aria-hidden="true"
                            >
                                <g transform="translate(10, 5) rotate(10, 85, 50)">
                                <path d="M95,35 L110,50 L75,85 L60,70 Z" fill="#B0C4DE" />
                                <path d="M93,33 L95,35 L60,70 L58,68 Z" fill="#A9BCD4" />
                                <path d="M110,50 L112,52 L77,87 L75,85 Z" fill="#778899" />
                                <rect x="109" y="49" width="5" height="5" rx="2" transform="rotate(45, 110, 50)" fill="#4682B4" />
                                </g>
                                <g>
                                <path d="M75 95H25C22.2 95 20 92.8 20 90V10C20 7.2 22.2 5 25 5H60L80 25V90C80 92.8 77.8 95 75 95Z" fill="#F0F4F8" />
                                <path d="M60 5L80 25H65C62.2 25 60 22.8 60 20V5Z" fill="#E1E8F0" />
                                <rect x="30" y="45" width="40" height="4" rx="2" fill="#D1DAE3" />
                                <rect x="30" y="55" width="40" height="4" rx="2" fill="#D1DAE3" />
                                <rect x="30" y="65" width="40" height="4" rx="2" fill="#D1DAE3" />
                                <rect x="30" y="75" width="25" height="4" rx="2" fill="#D1DAE3" />
                                <rect x="28" y="18" width="24" height="18" rx="4" fill="#A9BCD4" />
                                <text x="40" y="32" fontFamily="sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">Rx</text>
                                </g>
                            </svg>
                            <div className="text-center mt-4">
                                <h3 className="text-xl font-bold text-foreground mb-1">Order with Prescription</h3>
                                <p className="text-muted-foreground mb-4 text-sm">Upload prescription and we will deliver your medicines</p>
                            </div>
                        </>
                    )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                     <Button onClick={previewUrl ? resetState : handleUploadClick} disabled={isPending} variant={previewUrl ? 'outline' : 'default'}>
                        {previewUrl ? 'Upload another' : <><Paperclip className="mr-2" /> Upload</>}
                    </Button>
                </div>
            )}
             {error && (
                <Alert variant="destructive" className="mt-4 w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Extraction Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
          
          {/* Right side: How it works */}
          <div className="p-8 md:border-l border-primary/10 bg-background/30">
            <h4 className="font-semibold text-foreground mb-6">How does this work?</h4>
            <ul className="space-y-4">
                <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">1</div>
                <p className="text-muted-foreground text-sm mt-0.5">Upload a photo of your prescription</p>
                </li>
                <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">2</div>
                <p className="text-muted-foreground text-sm mt-0.5">Our AI assistant will read it and extract the medicine details</p>
                </li>
                <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">3</div>
                <p className="text-muted-foreground text-sm mt-0.5">Add delivery address and place the order</p>
                </li>
                <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center text-xs">4</div>
                <p className="text-muted-foreground text-sm mt-0.5">Now, sit back! Your medicines will get delivered at your doorstep</p>
                </li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetState()}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle className='flex items-center gap-2'><Wand2 className="text-primary"/> Prescription Details</DialogTitle>
                <DialogDescription>
                    Our AI assistant has extracted the following details from your prescription. Please review them before proceeding.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {extractedData?.medicines.map((med, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{med.name}</TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={resetState} disabled={isProcessingOrder}>Close</Button>
                <Button onClick={handleContinueToOrder} disabled={isProcessingOrder}>
                    {isProcessingOrder && <Loader2 className="animate-spin mr-2" />}
                    Continue to Order
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
