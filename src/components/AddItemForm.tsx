
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition, useRef } from "react";
import { addItemAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Paperclip, X } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const addItemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters."),
  image: z.any()
    .refine((file) => file, "Image is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer."),
  category: z.string({ required_error: "Please select a category." }),
});

type AddItemInputs = z.infer<typeof addItemSchema>;

const categories = [
    "Groceries",
    "Snacks",
    "Stationery",
    "Medicine",
    "Wellness",
    "Personal Care",
    "Health Devices",
    "Ayurvedic Care",
    "Baby Care",
    "Other"
];

interface AddItemFormProps {
    storeId: string;
    onItemAdded: () => void;
}

export default function AddItemForm({ storeId, onItemAdded }: AddItemFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<AddItemInputs>({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            name: "",
            description: "",
            price: undefined,
            stock: 0,
            image: undefined,
        }
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue("image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const onSubmit: SubmitHandler<AddItemInputs> = (data) => {
        const reader = new FileReader();
        reader.readAsDataURL(data.image);
        reader.onloadend = () => {
            const imageDataUri = reader.result as string;
            startTransition(async () => {
                const result = await addItemAction({ 
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    category: data.category,
                    storeId, 
                    imageDataUri 
                });

                if (result.success) {
                    toast({ title: "Success!", description: "New item has been added to your store." });
                    form.reset();
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    onItemAdded();
                } else {
                    toast({ title: "Error", description: result.error, variant: "destructive" });
                }
            });
        };
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <div className="mt-2">
                                <FormControl>
                                    <div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="mr-2" />
                                            {imagePreview ? "Change Image" : "Upload Image"}
                                        </Button>
                                    </div>
                                </FormControl>
                            </div>
                            <FormMessage />
                             {imagePreview && (
                                <div className="relative w-32 h-32 mt-2">
                                    <Image
                                        src={imagePreview}
                                        alt="Image preview"
                                        fill
                                        className="rounded-md object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={() => {
                                            setImagePreview(null);
                                            form.resetField("image");
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                                <Input type="number" step="1" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
                    Add Item
                </Button>
            </form>
        </Form>
    );
}
