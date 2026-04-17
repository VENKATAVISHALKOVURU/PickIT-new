import { useState } from "react";
import { useGetShopOrders, getGetShopOrdersQueryKey, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { FileText, Printer, CheckCircle2, Copy } from "lucide-react";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function OwnerOrders() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: orders, isLoading } = useGetShopOrders({
    query: {
      queryKey: getGetShopOrdersQueryKey()
    }
  });

  const updateStatusMutation = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Order status updated");
        queryClient.invalidateQueries({ queryKey: getGetShopOrdersQueryKey() });
        setUpdatingId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update order status");
        setUpdatingId(null);
      }
    }
  });

  const handleUpdateStatus = (id: number, currentStatus: string) => {
    setUpdatingId(id);
    let nextStatus: "printing" | "ready" | "done" = "printing";
    if (currentStatus === "pending") nextStatus = "printing";
    if (currentStatus === "printing") nextStatus = "ready";
    if (currentStatus === "ready") nextStatus = "done";
    
    updateStatusMutation.mutate({
      id,
      data: { status: nextStatus }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "printing": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ready": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "done": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== "done") || [];
  const doneOrders = orders?.filter(o => o.status === "done") || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Orders</h1>
      
      {activeOrders.length === 0 && doneOrders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No orders yet</h3>
          <p className="text-muted-foreground">Orders placed by students will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Orders</h2>
              <div className="grid gap-4">
                <AnimatePresence>
                  {activeOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">{order.fileName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.studentName} • {order.pages} pages • {order.colorMode.toUpperCase()} • {order.copies} copies
                              </p>
                              {order.note && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded-md border text-muted-foreground">
                                  <span className="font-medium text-foreground">Note:</span> {order.note}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                            <div className="text-xl font-bold text-primary">
                              {formatINR(order.price)}
                            </div>
                            
                            <Button 
                              onClick={() => handleUpdateStatus(order.id, order.status)}
                              disabled={updatingId === order.id}
                              className="w-full sm:w-auto"
                            >
                              {updatingId === order.id ? (
                                "Updating..."
                              ) : order.status === "pending" ? (
                                "Start Printing"
                              ) : order.status === "printing" ? (
                                "Mark as Ready"
                              ) : (
                                "Mark as Done"
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {doneOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold opacity-70">Completed Orders</h2>
              <div className="grid gap-4 opacity-70">
                {doneOrders.map((order) => (
                  <Card key={order.id} className="bg-muted/30">
                    <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{order.fileName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium text-primary">
                        {formatINR(order.price)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
