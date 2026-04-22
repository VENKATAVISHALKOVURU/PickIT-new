import { useGetStudentOrders, getGetStudentOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FileText, CheckCircle2, RotateCcw, Printer } from "lucide-react";
import { Link } from "wouter";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

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
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                      <div className="bg-primary/10 p-3 rounded-full hidden sm:block shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate" title={order.fileName}>{order.fileName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 sm:gap-6">
                      <div className="text-sm text-muted-foreground text-right">
                        {order.pages} pgs · {order.copies ?? 1}× · {order.colorMode.toUpperCase()}
                      </div>
                      <div className="font-bold text-lg whitespace-nowrap">
                        {formatINR(order.price)}
                      </div>
                      <Button asChild size="sm" variant="default" className="gap-1.5 shrink-0" data-testid={`button-reprint-${order.id}`}>
                        <Link
                          href={`/student/upload?reprint=${encodeURIComponent(order.id)}` +
                            `&fileUrl=${encodeURIComponent(order.fileUrl)}` +
                            `&fileName=${encodeURIComponent(order.fileName)}` +
                            `&pages=${order.pages}` +
                            `&copies=${order.copies ?? 1}` +
                            `&colorMode=${order.colorMode}` +
                            (order.note ? `&note=${encodeURIComponent(order.note)}` : "")
                          }
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reprint
                        </Link>
                      </Button>
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
