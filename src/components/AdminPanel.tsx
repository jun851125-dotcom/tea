import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Order, OrderStatus, Category, Product } from "@/src/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, CheckCircle2, Clock, Utensils, Package, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New Item states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [productForm, setProductForm] = useState({ name: "", categoryId: "", price: "", description: "" });

  useEffect(() => {
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    });

    const qCats = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    const qProds = query(collection(db, "products"));
    const unsubProds = onSnapshot(qProds, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    return () => {
      unsubOrders();
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        order: categories.length + 1
      });
      setNewCategoryName("");
      toast.success("分類已新增");
    } catch (e) {
      toast.error("新增失敗");
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.categoryId || !productForm.price) {
        toast.error("請填寫完整資訊");
        return;
    }
    try {
      await addDoc(collection(db, "products"), {
        name: productForm.name,
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        description: productForm.description,
        isAvailable: true
      });
      setProductForm({ name: "", categoryId: "", price: "", description: "" });
      toast.success("飲品已新增");
    } catch (e) {
      toast.error("新增失敗");
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast.success("訂單狀態已更新");
    } catch (e) {
      toast.error("更新失敗");
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={16} className="text-yellow-500" />;
      case OrderStatus.PREPARING: return <Utensils size={16} className="text-blue-500" />;
      case OrderStatus.READY: return <Package size={16} className="text-purple-500" />;
      case OrderStatus.COMPLETED: return <CheckCircle2 size={16} className="text-green-500" />;
      case OrderStatus.CANCELLED: return <XCircle size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">待處理</Badge>;
        case OrderStatus.PREPARING: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">製作中</Badge>;
        case OrderStatus.READY: return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">可取餐</Badge>;
        case OrderStatus.COMPLETED: return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">已完成</Badge>;
        case OrderStatus.CANCELLED: return <Badge variant="secondary">已取消</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="orders">訂單管理</TabsTrigger>
          <TabsTrigger value="inventory">商品管理</TabsTrigger>
          <TabsTrigger value="categories">分類管理</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>所有訂單</CardTitle>
              <CardDescription>管理顧客送出的點單</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間 / 單號</TableHead>
                      <TableHead>顧客</TableHead>
                      <TableHead>內容</TableHead>
                      <TableHead>總計</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="text-xs text-slate-500">
                            {order.createdAt ? format(order.createdAt.toDate(), "MM/dd HH:mm") : "處理中"}
                          </div>
                          <div className="font-mono text-[10px] font-bold">#{order.id.slice(-6).toUpperCase()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-slate-500">{order.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="mb-1 border-b border-dashed pb-1 last:border-0 uppercase">
                                {item.quantity}x {item.name} 
                                <span className="text-[10px] text-slate-400 ml-1">({item.ice}, {item.sugar})</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-orange-600">${order.totalAmount}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                             <Select 
                                value={order.status} 
                                onValueChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}
                             >
                                <SelectTrigger className="h-8 w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={OrderStatus.PENDING}>待處理</SelectItem>
                                    <SelectItem value={OrderStatus.PREPARING}>製作中</SelectItem>
                                    <SelectItem value={OrderStatus.READY}>可取餐</SelectItem>
                                    <SelectItem value={OrderStatus.COMPLETED}>已完成</SelectItem>
                                    <SelectItem value={OrderStatus.CANCELLED}>取消</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>新增飲品</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>名稱</Label>
                  <Input 
                    value={productForm.name} 
                    onChange={e => setProductForm({...productForm, name: e.target.value})} 
                    placeholder="例如：台灣四季春青"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分類</Label>
                  <Select 
                    value={productForm.categoryId} 
                    onValueChange={val => setProductForm({...productForm, categoryId: val})}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>價格</Label>
                  <Input 
                    type="number"
                    value={productForm.price} 
                    onChange={e => setProductForm({...productForm, price: e.target.value})} 
                    placeholder="30"
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                    <Plus size={16} className="mr-2" /> 新增飲品
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>現有飲品</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>分類</TableHead>
                      <TableHead>價格</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{categories.find(c => c.id === product.categoryId)?.name}</TableCell>
                            <TableCell>${product.price}</TableCell>
                            <TableCell>
                                <Badge variant={product.isAvailable ? "outline" : "secondary"}>
                                    {product.isAvailable ? "供應中" : "已停售"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => updateDoc(doc(db, "products", product.id), { isAvailable: !product.isAvailable })}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDoc(doc(db, "products", product.id))}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
           <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>新增分類</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input 
                        value={newCategoryName} 
                        onChange={e => setNewCategoryName(e.target.value)} 
                        placeholder="例如：超人氣系列"
                    />
                    <Button onClick={handleAddCategory}>新增</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>分類列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>順序</TableHead>
                                <TableHead>名稱</TableHead>
                                <TableHead>操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell>{cat.order}</TableCell>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDoc(doc(db, "categories", cat.id))}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
