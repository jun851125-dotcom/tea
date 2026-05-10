import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Category, Product, OrderStatus } from "@/src/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "react-use-cart";
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, X, User, Phone, CheckCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export default function Storefront() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customization, setCustomization] = useState({ ice: "正常冰", sugar: "正常甜", toppings: [] as string[] });
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const { addItem, items, updateItemQuantity, removeItem, cartTotal, emptyCart, totalItems } = useCart();

  useEffect(() => {
    const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
      if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id);
    });

    const qProds = query(collection(db, "products"));
    const unsubProds = onSnapshot(qProds, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    addItem({
      id: `${selectedProduct.id}-${customization.ice}-${customization.sugar}-${customization.toppings.join(",")}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      ice: customization.ice,
      sugar: customization.sugar,
      toppings: customization.toppings,
    }, 1);
    
    toast.success(`${selectedProduct.name} 已加入購物車`);
    setSelectedProduct(null);
    setCustomization({ ice: "正常冰", sugar: "正常甜", toppings: [] });
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("請填寫外帶/外送資訊");
      return;
    }

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          ice: (item as any).ice,
          sugar: (item as any).sugar,
          toppings: (item as any).toppings || []
        })),
        totalAmount: cartTotal,
        status: OrderStatus.PENDING,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setLastOrderId(docRef.id);
      setIsOrderSuccess(true);
      emptyCart();
      setIsCheckoutOpen(false);
      toast.success("訂單已送出！");
    } catch (e) {
        console.error(e);
      toast.error("送出訂單失敗");
    }
  };

  const filteredProducts = products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-2xl">
            <Badge className="mb-4 bg-orange-500 hover:bg-orange-600 border-none font-bold">NEW ARRIVAL</Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 font-display">
                品味極致 <span className="text-orange-400">萃茶趣</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
                嚴選上等茶葉，職人手刷工藝，為您呈現每一杯最真實的甘醇滋味。
            </p>
            <div className="flex gap-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 font-bold" onClick={() => {
                    const el = document.getElementById('menu-start');
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}>
                    立即點餐
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => setIsOrderSuccess(true)}>
                    追蹤訂單
                </Button>
            </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-500/20 to-transparent hidden md:block" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      </section>

      <div id="menu-start" className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar Categories */}
      <div className="md:col-span-1">
        <div className="sticky top-24 space-y-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">菜單分類</h2>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full rounded-lg px-4 py-3 text-left transition-all ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                  : "bg-white text-slate-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{cat.name}</span>
                {activeCategory === cat.id && <ChevronRight size={16} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="md:col-span-3 lg:col-span-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
            >
                <Card 
                className="overflow-hidden cursor-pointer border-none shadow-md hover:shadow-xl transition-all"
                onClick={() => setSelectedProduct(product)}
                >
                <div className="aspect-[4/3] bg-slate-100 relative">
                    {/* Image placeholder or real image if available */}
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <ShoppingCart size={48} />
                    </div>
                </div>
                <CardContent className="p-4 bg-white">
                    <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{product.description || "經典美味，值得品味"}</p>
                    </div>
                    <span className="text-lg font-black text-orange-500">${product.price}</span>
                    </div>
                    <Button className="mt-4 w-full bg-slate-900 hover:bg-orange-500 transition-colors">
                    <Plus size={16} className="mr-2" /> 點餐
                    </Button>
                </CardContent>
                </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Drawer (Trigger) */}
      {totalItems > 0 && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
              <Sheet>
                <SheetTrigger
                    render={
                        <Button size="lg" className="rounded-full px-8 py-6 h-auto shadow-2xl shadow-orange-300 bg-orange-500 hover:bg-orange-600 gap-4" />
                    }
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-orange-500">
                            {totalItems}
                        </span>
                    </div>
                    <span className="text-lg font-bold">查看購物車 · ${cartTotal}</span>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="text-orange-500" /> 我的點單
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col h-full pb-32">
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b pb-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between font-bold">
                                                <span>{item.name}</span>
                                                <span className="text-orange-500">${item.price * item.quantity}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 min-h-[1rem]">
                                                {(item as any).ice} / {(item as any).sugar}
                                            </div>
                                            <div className="mt-2 flex items-center gap-4">
                                                <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
                                                    <button 
                                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                        className="rounded bg-white p-1 shadow-sm hover:text-orange-500"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                        className="rounded bg-white p-1 shadow-sm hover:text-orange-500"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        
                        <div className="mt-auto pt-6 bg-white border-t space-y-4">
                            <div className="flex items-center justify-between text-lg font-bold">
                                <span>總計金額</span>
                                <span className="text-2xl text-orange-600">${cartTotal}</span>
                            </div>
                            <Button className="w-full py-6 text-lg font-bold bg-orange-500 hover:bg-orange-600" onClick={() => setIsCheckoutOpen(true)}>
                                立即結帳送出
                            </Button>
                        </div>
                    </div>
                </SheetContent>
              </Sheet>
          </div>
      )}

      {/* Product Customization Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{selectedProduct?.name}</DialogTitle>
                <div className="text-sm text-slate-500">${selectedProduct?.price}</div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
                <div className="space-y-3">
                    <Label className="text-base font-bold">甜度</Label>
                    <RadioGroup value={customization.sugar} onValueChange={(val) => setCustomization({...customization, sugar: val})} className="grid grid-cols-3 gap-2">
                        {["正常甜", "少糖", "半糖", "微糖", "二分糖", "無糖"].map(s => (
                            <div key={s}>
                                <RadioGroupItem value={s} id={`s-${s}`} className="sr-only" />
                                <Label htmlFor={`s-${s}`} className="flex cursor-pointer items-center justify-center rounded-md border-2 border-slate-100 bg-white p-2 transition-all hover:bg-slate-50 peer-data-checked:border-orange-500 peer-data-checked:bg-orange-50 peer-data-checked:text-orange-700 font-medium">
                                    {s}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label className="text-base font-bold">冰塊</Label>
                    <RadioGroup value={customization.ice} onValueChange={(val) => setCustomization({...customization, ice: val})} className="grid grid-cols-3 gap-2">
                        {["正常冰", "少冰", "微冰", "去冰", "完全去冰", "溫飲", "熱飲"].map(i => (
                            <div key={i}>
                                <RadioGroupItem value={i} id={`i-${i}`} className="sr-only" />
                                <Label htmlFor={`i-${i}`} className="flex cursor-pointer items-center justify-center rounded-md border-2 border-slate-100 bg-white p-2 transition-all hover:bg-slate-50 peer-data-checked:border-blue-500 peer-data-checked:bg-blue-50 peer-data-checked:text-blue-700 font-medium">
                                    {i}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </div>

            <DialogFooter>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleAddToCart}>
                    確認點餐
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Info Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>填寫收件資訊</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>姓名 / 稱呼</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <Input className="pl-10" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="例如：陳小姐" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>聯絡電話</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <Input className="pl-10" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="例如：0912-345-678" />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>取消</Button>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCheckout}>送出訂單</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isOrderSuccess} onOpenChange={setIsOrderSuccess}>
          <DialogContent className="sm:max-w-sm">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-green-100 p-4 text-green-500">
                      <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">訂單已送出</h2>
                  <p className="mt-2 text-slate-500">您的單號為：<span className="font-mono font-bold text-orange-600">#{lastOrderId.slice(-6).toUpperCase()}</span></p>
                  <p className="mt-1 text-sm text-slate-400">請等候製作，感謝您的訂購！</p>
                  <Button className="mt-8 w-full" onClick={() => setIsOrderSuccess(false)}>回首頁</Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
