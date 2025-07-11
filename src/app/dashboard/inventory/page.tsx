
'use client';

import { useEffect, useState } from 'react';
import type { Item } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { getItemsFromFirestore } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddItemForm from '@/components/AddItemForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EditItemForm from '@/components/EditItemForm';

export default function InventoryPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const storeId = 'quickart-essentials';

    useEffect(() => {
        async function fetchItems() {
            if (!user) return;
            setLoading(true);
            const fetchedItems = await getItemsFromFirestore(storeId);
            setItems(fetchedItems);
            setLoading(false);
        }
        fetchItems();
    }, [user, version]);

    const handleItemAdded = () => {
        setVersion(v => v + 1);
    }
    
    const handleItemUpdated = () => {
        setIsEditDialogOpen(false);
        setVersion(v => v + 1);
    }

    const handleEditClick = (item: Item) => {
        setSelectedItem(item);
        setIsEditDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Inventory</CardTitle>
                            <CardDescription>
                                A list of all products in your store.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hidden w-[100px] sm:table-cell">
                                            Image
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length > 0 ? (
                                        items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Image
                                                        alt={item.name}
                                                        className="aspect-square rounded-md object-cover"
                                                        height="64"
                                                        src={item.image}
                                                        width="64"
                                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64.png' }} // Fallback for broken images
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.stock > 0 ? item.stock : <span className="text-destructive">Out of stock</span>}</TableCell>
                                                <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="icon" onClick={() => handleEditClick(item)}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit Item</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No items in inventory. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-20">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Item</CardTitle>
                                <CardDescription>Fill out the form to add a new product.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddItemForm storeId={storeId} onItemAdded={handleItemAdded}/>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                </DialogHeader>
                {selectedItem && (
                    <EditItemForm 
                        item={selectedItem} 
                        onItemUpdated={handleItemUpdated} 
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
