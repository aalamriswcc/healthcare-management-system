import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Truck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Inventory = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    hospital_id: '',
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch orders with related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          hospitals:hospital_id (name),
          suppliers:supplier_id (name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name')
        .order('name');

      if (hospitalsError) throw hospitalsError;

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');

      if (suppliersError) throw suppliersError;

      setOrders(ordersData || []);
      setHospitals(hospitalsData || []);
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select(`
          *,
          hospitals:hospital_id (name),
          suppliers:supplier_id (name)
        `);

      if (error) throw error;

      setOrders([...data, ...orders]);
      setNewOrder({
        hospital_id: '',
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        status: 'pending'
      });
      setIsAddOrderDialogOpen(false);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            قيد الانتظار
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            موافق عليه
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-yellow-500">
            <Truck className="h-3 w-3 mr-1" />
            تم الشحن
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="status-operational">
            <CheckCircle className="h-3 w-3 mr-1" />
            تم التسليم
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="status-critical">
            <AlertTriangle className="h-3 w-3 mr-1" />
            ملغي
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.hospitals?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.suppliers?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المخزون والطلبات</h1>
          <p className="text-muted-foreground">تتبع وإدارة طلبات المستلزمات الطبية والمخزون</p>
        </div>
        
        <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="healthcare-button">
              <Plus className="h-4 w-4 mr-2" />
              طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إنشاء طلب جديد</DialogTitle>
              <DialogDescription>
                أدخل معلومات الطلب الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hospital">المستشفى</Label>
                <Select value={newOrder.hospital_id} onValueChange={(value) => setNewOrder({...newOrder, hospital_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">المورد</Label>
                <Select value={newOrder.supplier_id} onValueChange={(value) => setNewOrder({...newOrder, supplier_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order_date">تاريخ الطلب</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={newOrder.order_date}
                    onChange={(e) => setNewOrder({...newOrder, order_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected_delivery_date">تاريخ التسليم المتوقع</Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={newOrder.expected_delivery_date}
                    onChange={(e) => setNewOrder({...newOrder, expected_delivery_date: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddOrderDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddOrder} className="healthcare-button">
                إنشاء الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-gray-600">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">موافق عليها</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تم التسليم</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ملغية</p>
                <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="approved">موافق عليه</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الطلبات</CardTitle>
              <CardDescription>جدول تفصيلي بجميع طلبات المستلزمات الطبية</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>المستشفى</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>التسليم المتوقع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{order.hospitals?.name || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.suppliers?.name || 'غير محدد'}</TableCell>
                      <TableCell>
                        {new Date(order.order_date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery_date 
                          ? new Date(order.expected_delivery_date).toLocaleDateString('ar-SA')
                          : 'غير محدد'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.total_amount 
                          ? `${order.total_amount.toLocaleString()} ريال`
                          : 'غير محدد'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">إدارة المخزون</h3>
              <p className="text-muted-foreground mb-4">
                هذا القسم قيد التطوير. سيتم إضافة إدارة المخزون قريباً.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">إدارة الموردين</h3>
              <p className="text-muted-foreground mb-4">
                هذا القسم قيد التطوير. سيتم إضافة إدارة الموردين قريباً.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredOrders.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'لم يتم العثور على طلبات تطابق المعايير المحددة' 
                : 'لم يتم إنشاء أي طلبات بعد'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsAddOrderDialogOpen(true)} className="healthcare-button">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء أول طلب
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
