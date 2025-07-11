
'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, User, ShoppingCart, Clock, DollarSign, ListOrdered, Phone, KeyRound, Check, Truck, IndianRupee, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { assignDeliveryPersonAction, getDeliveryPeople, updateOrderStatusAction, verifyOtpAndCompleteOrderAction } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from './ui/input';


function DeliveryAssigner({ order }: { order: Order }) {
    const [isPending, startTransition] = useTransition();
    const [deliveryPeople, setDeliveryPeople] = useState<UserProfile[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchDeliveryPeople() {
            const people = await getDeliveryPeople();
            setDeliveryPeople(people);
        }
        if (order.status === 'confirmed') {
            fetchDeliveryPeople();
        }
    }, [order.status]);

    const handleAssign = (deliveryPersonId: string) => {
        const deliveryPerson = deliveryPeople.find(p => p.uid === deliveryPersonId);
        if (!deliveryPerson) return;

        startTransition(async () => {
            const result = await assignDeliveryPersonAction({ orderId: order.id, deliveryPerson });
            if (result.success) {
                toast({ title: "Order Assigned!", description: `Order #${order.id.substring(0, 6)} assigned to ${deliveryPerson.name}.` });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    }

    if (order.status !== 'confirmed') return null;

    return (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Assign Delivery</h4>
            {deliveryPeople.length > 0 ? (
                 <Select onValueChange={handleAssign} disabled={isPending}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a delivery person..." />
                    </SelectTrigger>
                    <SelectContent>
                        {deliveryPeople.map(person => (
                            <SelectItem key={person.uid} value={person.uid}>{person.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : <p className="text-xs text-muted-foreground">No delivery personnel available.</p>}
        </div>
    );
}

function StatusSelector({ orderId, currentStatus }: { orderId: string, currentStatus: Order['status'] }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const orderStatuses: Order['status'][] = ['placed', 'confirmed', 'out-for-delivery', 'delivered'];
    const currentStatusIndex = orderStatuses.indexOf(currentStatus);

    const handleStatusChange = (newStatus: Order['status']) => {
        startTransition(async () => {
            const result = await updateOrderStatusAction({ orderId, status: newStatus });
            if (result.success) {
                toast({ title: "Status Updated!", description: `Order #${orderId.substring(0,6)} is now ${newStatus.replace('-', ' ')}.` });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    }
    
    const canUpdateStatus = currentStatus !== 'delivered';

    return (
        <Select onValueChange={handleStatusChange} defaultValue={currentStatus} disabled={isPending || !canUpdateStatus}>
            <SelectTrigger className="w-[180px] h-9 focus:ring-primary">
                <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
                {orderStatuses.map((status, index) => (
                    <SelectItem key={status} value={status} className="capitalize" disabled={index < currentStatusIndex || status === 'out-for-delivery'}>
                        {status.replace('-', ' ')}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}


function StoreDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const initialLoad = useRef(true);

    const storeId = 'quickart-essentials';

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("storeId", "==", storeId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newOrders: Order[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt?.toDate() ?? new Date()).toISOString() } as Order));
            
            if (!initialLoad.current) {
                const existingOrderIds = new Set(orders.map(o => o.id));
                const trulyNewOrders = newOrders.filter(o => !existingOrderIds.has(o.id));

                if (trulyNewOrders.length > 0) {
                     toast({
                        title: "🎉 New Order Received!",
                        description: `Order #${trulyNewOrders[0].id.substring(0,6)} has been placed.`,
                    });
                }
            } else {
                initialLoad.current = false;
            }

            // Sort manually on the client-side
            newOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(newOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders: ", error);
            toast({ title: "Error", description: "Could not fetch orders.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    const statusColors: {[key: string]: string} = {
        placed: 'bg-blue-500/20 text-blue-700 border-blue-400',
        confirmed: 'bg-yellow-500/20 text-yellow-700 border-yellow-400',
        'out-for-delivery': 'bg-orange-500/20 text-orange-700 border-orange-400',
        delivered: 'bg-green-500/20 text-green-700 border-green-400',
      };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <Card key={order.id} className="transition-shadow hover:shadow-md">
                                <CardHeader>
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                    <CardTitle>Order #{order.id.substring(0, 6)}</CardTitle>
                                    <CardDescription>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </CardDescription>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Badge variant="outline" className={`capitalize ${statusColors[order.status]}`}>{order.status.replace('-', ' ')}</Badge>
                                        <StatusSelector orderId={order.id} currentStatus={order.status} />
                                    </div>
                                </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><User className="w-4 h-4 text-muted-foreground" /> Customer Details</h4>
                                        <div className="pl-6 text-sm text-muted-foreground space-y-1">
                                            <p>{order.userName || 'Guest User'} ({order.userEmail})</p>
                                            <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> {order.phone}</p>
                                            <p>
                                                <span className="font-medium">Address:</span> {order.deliveryAddress}
                                            </p>
                                        </div>
                                    </div>
                                    {order.deliveryPersonName && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Truck className="w-4 h-4 text-muted-foreground" /> Delivery Person</h4>
                                            <div className="pl-6 text-sm text-muted-foreground">
                                                <p>{order.deliveryPersonName}</p>
                                            </div>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-muted-foreground" /> Items</h4>
                                        <ul className="space-y-1 text-sm pl-6">
                                        {order.items.map(item => (
                                            <li key={item.id} className="flex justify-between text-muted-foreground">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        </ul>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-base pl-6">
                                        <span>Total</span>
                                        <span>₹{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <DeliveryAssigner order={order} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="max-w-md mx-auto">
                            <Package className="w-16 h-16 bg-muted text-muted-foreground p-4 rounded-full mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No Orders Yet
                            </h3>
                            <p className="text-muted-foreground">
                                When customers place orders, they will appear here in real-time.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
            <div className="lg:col-span-1">
                 <div className="sticky top-20 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Store Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <DollarSign className="w-5 h-5 text-muted-foreground mr-4"/>
                                <div>
                                    <div className="text-muted-foreground text-sm">Total Revenue</div>
                                    <div className="font-bold text-2xl">₹{totalRevenue.toFixed(2)}</div>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <ListOrdered className="w-5 h-5 text-muted-foreground mr-4"/>
                                <div>
                                    <div className="text-muted-foreground text-sm">Total Orders</div>
                                    <div className="font-bold text-2xl">{orders.length}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}

function ConsumerDashboard() {
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
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userOrders: Order[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt?.toDate() ?? new Date()).toISOString() } as Order));
            setOrders(userOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user orders: ", error);
            toast({ title: "Error", description: "Could not fetch your orders.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);
    
    const getStatusProgress = (status: Order['status']) => {
        const statuses = ['placed', 'confirmed', 'out-for-delivery', 'delivered'];
        const index = statuses.indexOf(status);
        if (index === -1) return 0;
        return ((index + 1) / statuses.length) * 100;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
        );
    }
    
    return (
        <div>
             {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order.id} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Order #{order.id.substring(0, 6)}</CardTitle>
                                    <Badge variant="outline">{new Date(order.createdAt).toLocaleDateString()}</Badge>
                                </div>
                                <CardDescription>Delivered to: {order.deliveryAddress}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                                    {order.items.map(item => (
                                    <li key={item.id} className="flex justify-between">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                    ))}
                                </ul>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg my-4">
                                    <span>Total</span>
                                    <span>₹{order.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground"/> Order Status</span>
                                        <span className="capitalize text-primary">{order.status.replace('-', ' ')}</span>
                                    </div>
                                    <Progress value={getStatusProgress(order.status)} className="h-2" />
                                    <div className="grid grid-cols-4 text-xs text-muted-foreground text-center">
                                        <span>Placed</span>
                                        <span>Confirmed</span>
                                        <span>Out for Delivery</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>
                                {order.status === 'out-for-delivery' && (
                                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                    <div className="flex items-center gap-3">
                                        <KeyRound className="w-8 h-8 text-blue-600"/>
                                        <div>
                                            <h4 className="font-semibold text-blue-800">Your Delivery OTP</h4>
                                            <p className="text-2xl font-bold tracking-widest text-blue-700">{order.otp}</p>
                                            <p className="text-xs text-blue-600">Share this with the delivery person.</p>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
             ) : (
                <Card className="text-center py-20">
                    <div className="max-w-md mx-auto">
                        <ShoppingCart className="w-16 h-16 bg-muted text-muted-foreground p-4 rounded-full mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            You haven't placed any orders yet.
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Start shopping to see your orders here.
                        </p>
                        <Button asChild>
                            <Link href="/">Start Shopping</Link>
                        </Button>
                    </div>
                </Card>
             )}
        </div>
    );
}

function OtpVerifier({ orderId }: { orderId: string }) {
    const [otp, setOtp] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleVerification = () => {
        if (otp.length !== 4) {
            toast({ title: "Invalid OTP", description: "Please enter a 4-digit OTP.", variant: "destructive" });
            return;
        }
        startTransition(async () => {
            const result = await verifyOtpAndCompleteOrderAction({ orderId, otp });
            if (result.success) {
                toast({ title: "Delivery Complete!", description: `Order #${orderId.substring(0, 6)} marked as delivered.` });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    }

    return (
        <div className="p-4 bg-muted/50 rounded-lg mt-4 flex items-center gap-2">
            <Input 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                maxLength={4}
                placeholder="Enter OTP"
                className="flex-grow"
                disabled={isPending}
            />
            <Button onClick={handleVerification} disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                Verify
            </Button>
        </div>
    );
}

function DeliveryPersonDashboard() {
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
            where("status", "in", ["out-for-delivery", "delivered"])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const deliveryOrders: Order[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt?.toDate() ?? new Date()).toISOString() } as Order));
            deliveryOrders.sort((a, b) => {
                if (a.status === 'out-for-delivery' && b.status !== 'out-for-delivery') return -1;
                if (a.status !== 'out-for-delivery' && b.status === 'out-for-delivery') return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setOrders(deliveryOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching delivery orders: ", error);
            toast({ title: "Error", description: "Could not fetch your assigned deliveries.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const activeDeliveries = orders.filter(o => o.status === 'out-for-delivery');
    const completedDeliveries = orders.filter(o => o.status === 'delivered');

    return (
        <div className="space-y-6">
             {orders.length > 0 ? (
                <div className="space-y-6">
                    <div>
                        <h2 className='text-xl font-bold mb-2'>Active Deliveries ({activeDeliveries.length})</h2>
                        {activeDeliveries.length > 0 ? activeDeliveries.map(order => (
                            <Card key={order.id} className="border-primary mt-2">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>Order #{order.id.substring(0, 6)}</CardTitle>
                                            <CardDescription>
                                                Assigned at {new Date(order.createdAt).toLocaleTimeString()}
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-orange-500/20 text-orange-700 border-orange-400">Out for Delivery</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><User className="w-4 h-4 text-muted-foreground" /> Customer Details</h4>
                                        <div className="pl-6 text-sm text-muted-foreground space-y-1">
                                            <p>{order.userName}</p>
                                            <p className='font-medium text-foreground'>{order.deliveryAddress}</p>
                                            <p className="flex items-center gap-2"><Phone className="w-3 h-3"/> {order.phone}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-muted-foreground" /> Items</h4>
                                        <ul className="space-y-1 text-sm pl-6 text-muted-foreground">
                                            {order.items.map(item => (
                                                <li key={item.id}>{item.name} x{item.quantity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <OtpVerifier orderId={order.id} />
                                </CardFooter>
                            </Card>
                        )) : <p className="text-sm text-muted-foreground mt-2">No active deliveries.</p>}
                    </div>

                    <div>
                        <h2 className='text-xl font-bold mt-6 mb-2'>Completed Deliveries ({completedDeliveries.length})</h2>
                        {completedDeliveries.length > 0 ? (
                            <div className="space-y-2">
                                {completedDeliveries.map(order => (
                                <Card key={order.id} className="opacity-70">
                                <CardHeader className="py-4">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base">Order #{order.id.substring(0, 6)}</CardTitle>
                                            <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-400">Delivered</Badge>
                                        </div>
                                </CardHeader>
                                </Card>
                            ))}
                            </div>
                        ) : (
                            <p className='text-sm text-muted-foreground mt-2'>No completed deliveries yet.</p>
                        )}
                    </div>
                </div>
             ) : (
                <Card className="text-center py-20">
                    <div className="max-w-md mx-auto">
                        <Truck className="w-16 h-16 bg-muted text-muted-foreground p-4 rounded-full mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                           No assigned deliveries yet.
                        </h3>
                        <p className="text-muted-foreground">
                           Once a store assigns an order to you, it will appear here.
                        </p>
                    </div>
                </Card>
             )}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return null; // Layout handles the main loading/auth check

    switch(user.role) {
        case 'store-owner':
            return <StoreDashboard />;
        case 'consumer':
            return <ConsumerDashboard />;
        case 'delivery-person':
            return <DeliveryPersonDashboard />;
        default:
            return <ConsumerDashboard />; // Fallback to consumer dashboard
    }
}

    
