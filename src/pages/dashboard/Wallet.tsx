import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, Check, TriangleAlert } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { useAuth } from "@/context/AuthContext";
import { log } from "console";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMoneyOpen, setAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const { toast } = useToast();
  const [walletError, setWalletError] = useState<string | null>(null);

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      setWalletError(null);
      try {
        try {
          const response = await axios.get(
            "/api/wallet/student/6820fbf11297ba9d3807abee",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              maxBodyLength: Infinity,
            }
          );
          setWalletData(response.data.data || null);
          setWalletError(null);
          console.log("Wallet data:", response.data.data);
        } catch (error: any) {
          setWalletData(null);
          const errMsg = error?.response?.data?.message || error?.message || "An error occurred while fetching wallet data.";
          setWalletError(errMsg);
          toast({
            title: "Oops! Something went wrong",
            description: "We couldn’t load your wallet right now. Please try again.",
            duration: 8000, // show for 8 seconds
            variant: "destructive",
            action: (
              <Button
                variant="secondary"
                className="bg-white text-red-600 hover:bg-red-100"
                onClick={() => toast.dismiss()}
              >
                Dismiss
              </Button>
            ),
          });

        }
      } catch (error) {
        setWalletData(null);
        setWalletError("An error occurred while fetching wallet data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchWallet();
  }, [token]);

  const handleAddMoney = async () => {
    setAddLoading(true);
    try {
      // Prepare deposit data
      const depositData = {
        amount: Number(addAmount),
        method: "bank_transfer",
        reference: `REF${Date.now()}`,
        description: "Deposit from bank"
      };

      // Use the wallet ID from walletData
      const walletId = user?._id;
      const response = await axios.post(
        `/api/wallet/deposit/${walletId}`,
        depositData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Optionally, refresh wallet data here
      // await fetchWallet(); // You may need to move fetchWallet out of useEffect for this
      console.log("Deposit response:", response.data);
      toast({
        title: "Deposit Successful",
        description: "Your deposit was successful.",
        variant: "default",
      });
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Error",
        description: error?.response?.data?.message || error?.message || "An error occurred while adding money.",
        variant: "destructive",
      });
    }
    setTimeout(() => {
      setAddLoading(false);
      setAddMoneyOpen(false);
      setAddAmount("");
      // Optionally, refresh wallet data here
    }, 1200);
  };

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      // You may need to get the student id from user context or walletError context
      // Here, using the same hardcoded id as above for demonstration
      const payload = {
        student: user?._id,
        currency: "USD",
      };
      const response = await axios.post(
        "/api/wallet/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
        }
      );
      setWalletData(response.data.data || null);
      setWalletError(null);
      toast({
        title: "🎉 Wallet Created Successfully",
        description: "Your wallet is ready to use. You can now start making transactions.",
        variant: "default",
        duration: 8000,
        action: (
          <Button
            variant="secondary"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => toast.dismiss()}
          >
            Got it
          </Button>
        ),
      });

    } catch (error: any) {
      toast({
        title: "Oops! Something went wrong",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "We couldn’t create your wallet right now. Please try again.",
        variant: "destructive",
        duration: 8000,
        action: (
          <Button
            variant="secondary"
            className="bg-white text-red-600 hover:bg-red-100"
            onClick={() => toast.dismiss()}
          >
            Dismiss
          </Button>
        ),
      });

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="justify-center items-center py-[10vh] text-center gap-11">
      <div className="flex justify-center items-center">
        <div className="loader">
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
        </div>
      </div>
      <div className="pt-10">

        Loading wallet...
      </div>
    </div>;
  }

  if (!walletData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center ">
        <div className="text-center">
          <TriangleAlert className="h-32 w-32 mx-auto text-red-500" />
          <h1 className="text-4xl font-bold mb-4">Error Loading Wallet</h1>
          <p className="text-xl text-gray-600 mb-4">{walletError || "Failed to load wallet data."}</p>
          <a
            href={window.location.pathname}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Reload
          </a>
          {walletError === "Wallet not found" && (
            <div className="mt-6">
              <Button onClick={handleCreateWallet} disabled={loading}>
                {loading ? (
                   <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-900"></div>
                </div>
                ) : (
                  "Create Wallet"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6">
      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyOpen} onOpenChange={setAddMoneyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Amount</label>
              <Input
                type="number"
                min={1}
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={addLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMoneyOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddMoney} disabled={addLoading || !addAmount || Number(addAmount) <= 0}>
              {addLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></span>
                  Adding...
                </span>
              ) : (
                "Add Money"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SectionTitle
        title="Wallet"
        description="Manage your balance and transactions"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {walletData.currency ? walletData.currency + " " : "$"}
                  {walletData.balance?.toFixed(2) ?? "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {walletData.updatedAt ? new Date(walletData.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 gap-1" onClick={() => setAddMoneyOpen(true)}>
                <Plus className="h-4 w-4" /> Add Money
              </Button>
              {/* <Button variant="outline" className="flex-1 gap-1">
                Withdraw
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Add Payment Method
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6.5l3-3"></path>
                  <path d="M12 2v6.5l-3-3"></path>
                  <path d="M17 20.66C15.46 21.95 13.75 22.73 12 23c-1.75-.27-3.46-1.05-5-2.34"></path>
                  <path d="M15.3 14.3a4 4 0 0 0-5.6 0"></path>
                  <path d="M18.5 11.5a8 8 0 0 0-13 0"></path>
                  <path d="M4.34 17A10 10 0 0 1 12 12c3.58 0 6.78 1.79 8.7 4.67"></path>
                </svg>
                Purchase Credits
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="M21 15l-5-5L5 21"></path>
                </svg>
                View Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions & Payment Methods */}
      <Tabs defaultValue="transactions" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="bg-white dark:bg-background border rounded-lg p-6">
          <div className="space-y-4">
            {/* Deposits */}
            {(walletData.deposits ?? []).map((transaction: any) => (
              <div key={transaction._id} className="flex items-center gap-4 p-3 border-b border-border last:border-0">
                <div className="rounded-full p-2 bg-green-100 text-green-600">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{transaction.description || "Deposit"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    +{walletData.currency ? walletData.currency + " " : "$"}
                    {Number(transaction.amount).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Check className="h-3 w-3 text-green-500" />
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
            {/* Withdrawals */}
            {(walletData.withdrawals ?? []).map((transaction: any) => (
              <div key={transaction._id} className="flex items-center gap-4 p-3 border-b border-border last:border-0">
                <div className="rounded-full p-2 bg-red-100 text-red-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{transaction.description || "Withdrawal"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">
                    -{walletData.currency ? walletData.currency + " " : "$"}
                    {Number(transaction.amount).toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Check className="h-3 w-3 text-green-500" />
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
            {/* If no transactions */}
            {(!walletData.deposits?.length && !walletData.withdrawals?.length) && (
              <div className="text-center text-muted-foreground py-8">No transactions found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {/* No payment methods in API response, so show a placeholder */}
            <div className="text-center text-muted-foreground py-8">
              No payment methods found.
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add New Payment Method
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Mock Badge component that should be imported from shadcn
const Badge = ({ variant, className, children }: any) => {
  return <span className={className}>{children}</span>;
};

export default Wallet;
