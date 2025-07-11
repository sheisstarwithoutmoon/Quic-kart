
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { updateItemAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Item } from "@/lib/types";

const editItemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative integer."),
  category: z.string({ required_error: "Please select a category." }),
});

type EditItemInputs = z.infer<typeof editItemSchema>;

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

interface EditItemFormProps {
    item: Item;
    onItemUpdated: () => void;
}

export default function EditItemForm({ item, onItemUpdated }: EditItemFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<EditItemInputs>({
        resolver: zodResolver(editItemSchema),
        defaultValues: {
            name: item.name,
            description: item.description,
            price: item.price,
            stock: item.stock,
            category: item.category,
        }
    });

    const onSubmit: SubmitHandler<EditItemInputs> = (data) => {
        startTransition(async () => {
            const result = await updateItemAction({ 
                id: item.id,
                ...data
            });

            if (result.success) {
                toast({ title: "Success!", description: "Item has been updated." });
                onItemUpdated();
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
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
                                <Input type="number" step="0.01" {...field} />
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
                                <Input type="number" step="1" {...field} />
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
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
