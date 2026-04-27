import { useGetStudentOrders, getGetStudentOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { FileText, Clock, Printer, CheckCircle2, RadioTower } from "lucide-react";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function StudentOrders() {
  const { data: orders, isLoading, dataUpdatedAt } = useGetStudentOrders({
    query: {
      queryKey: getGetStudentOrdersQueryKey(),
      refetchInterval: 4000,
      refetchOnWindowFocus: true,
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Active Orders</h1>
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== "done") || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "printing": return <Printer className="w-5 h-5 text-blue-500" />;
      case "ready": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "printing": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ready": return "bg-green-500/10 text-green-600 border-green-500/20";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Waiting in queue";
      case "printing": return "Currently printing";
      case "ready": return "Ready for pickup!";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Active Orders</h1>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100" data-testid="live-indicator">
          <RadioTower className="h-3 w-3" />
          Live · updated {dataUpdatedAt ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) : "just now"}
        </span>
      </div>
      
      {activeOrders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No active orders</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-1">
            You don't have any prints currently processing. Head over to Upload to start a new job.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {activeOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className={`overflow-hidden border-2 ${order.status === 'ready' ? 'border-green-500/30 shadow-green-500/10 shadow-lg' : 'border-border'}`}>
                  <CardContent className="p-0">
                    <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl">{order.fileName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded-md">{order.pages} pages</span>
                          <span className="px-2 py-1 bg-muted rounded-md">{order.copies} copies</span>
                          <span className="px-2 py-1 bg-muted rounded-md uppercase">{order.colorMode}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end justify-center gap-4 bg-muted/20 md:bg-transparent p-4 md:p-0 rounded-lg md:min-w-[200px]">
                        <div className="text-2xl font-bold text-primary text-left md:text-right">
                          {formatINR(order.price)}
                        </div>
                        
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-semibold capitalize leading-none">{order.status}</p>
                            <p className="text-xs opacity-80 mt-1">{getStatusText(order.status)}</p>
                          </div>
                        </div>
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
