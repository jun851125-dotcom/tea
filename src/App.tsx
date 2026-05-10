import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Storefront from "./components/Storefront";
import AdminPanel from "./components/AdminPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Settings } from "lucide-react";
import { CartProvider } from "react-use-cart";

export default function App() {
  const [view, setView] = useState<"store" | "admin">("store");

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
            
            <Tabs value={view} onValueChange={(v) => setView(v as "store" | "admin")}>
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
          {view === "store" ? <Storefront /> : <AdminPanel />}
        </main>

        <Toaster position="top-center" />
      </div>
    </CartProvider>
  );
}
