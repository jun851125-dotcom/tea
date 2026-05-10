import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Storefront from "./components/Storefront";
import AdminPanel from "./components/AdminPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Settings, Lock } from "lucide-react";
import { CartProvider } from "react-use-cart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function App() {
  const [view, setView] = useState<"store" | "admin">("store");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleTabChange = (value: string) => {
    if (value === "admin" && !isAdminAuthenticated) {
      setIsPasswordDialogOpen(true);
    } else {
      setView(value as "store" | "admin");
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "1234") {
      setIsAdminAuthenticated(true);
      setIsPasswordDialogOpen(false);
      setView("admin");
      setPasswordInput("");
      toast.success("管理伺服器已解鎖");
    } else {
      toast.error("密碼錯誤，請重試");
      setPasswordInput("");
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-orange-500 p-2 text-white">
                <Coffee size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                萃茶趣 <span className="text-orange-500 text-sm font-medium">Tea Shop</span>
              </h1>
            </div>
            
            <Tabs value={view} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="store" className="gap-2">
                  <Coffee size={14} /> 點餐
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2">
                  <Settings size={14} /> 管理
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {view === "store" ? (
            <Storefront />
          ) : (
            isAdminAuthenticated ? <AdminPanel /> : <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
              <Lock size={48} />
              <p>後台區域已鎖定，請先登入</p>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>輸入密碼</Button>
            </div>
          )}
        </main>

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="text-orange-500" size={20} /> 管理權限驗證
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">請輸入管理密碼</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="請輸入密碼..."
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>取消</Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handlePasswordSubmit}>驗證登入</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster position="top-center" />
      </div>
    </CartProvider>
  );
}
