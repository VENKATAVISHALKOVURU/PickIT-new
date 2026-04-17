import { useGetStudentOrders, getGetStudentOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FileText, CheckCircle2 } from "lucide-react";

export default function StudentHistory() {
  const { data: orders, isLoading } = useGetStudentOrders({
    query: {
      queryKey: getGetStudentOrdersQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const doneOrders = orders?.filter(o => o.status === "done") || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Order History</h1>
      
      {doneOrders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No past orders</h3>
          <p className="text-muted-foreground">Your completed print jobs will appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {doneOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="bg-primary/10 p-3 rounded-full hidden sm:block">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{order.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
                      <div className="text-sm text-muted-foreground text-right">
                        {order.pages} pgs • {order.colorMode.toUpperCase()}
                      </div>
                      <div className="font-bold text-lg">
                        ${order.price.toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
