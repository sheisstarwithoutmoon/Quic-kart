
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, IndianRupee, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EARNING_PERCENTAGE = 0.20; // 20%

export default function EarningsPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("deliveryPersonId", "==", user.uid),
            where("status", "==", "delivered")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const deliveryOrders: Order[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt?.toDate() ?? new Date()).toISOString() } as Order));
            deliveryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(deliveryOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching delivery orders: ", error);
            toast({ title: "Error", description: "Could not fetch your earnings.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const totalEarnings = orders.reduce((acc, order) => acc + (order.total * EARNING_PERCENTAGE), 0);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Performance</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                Deliveries Completed
                            </p>
                            <p className="text-2xl font-bold">{orders.length}</p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-4 rounded-md border p-4">
                        <IndianRupee className="h-8 w-8 text-primary" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                Total Earnings
                            </p>
                            <p className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Order Total</TableHead>
                                <TableHead className="text-right">Your Earning</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length > 0 ? (
                                orders.map((order) => {
                                    const earning = order.total * EARNING_PERCENTAGE;
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="font-semibold">₹{earning.toFixed(2)}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No completed deliveries yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
