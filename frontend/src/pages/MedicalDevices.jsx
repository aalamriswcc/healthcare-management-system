import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Stethoscope, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MedicalDevices = () => {
  const [devices, setDevices] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    hospital_id: '',
    purchase_date: '',
    warranty_expiry_date: '',
    status: 'operational'
  });

  useEffect(() => {
    fetchDevices();
    fetchHospitals();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_devices')
        .select(`
          *,
          hospitals:hospital_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleAddDevice = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_devices')
        .insert([newDevice])
        .select(`
          *,
          hospitals:hospital_id (
            name
          )
        `);

      if (error) throw error;

      setDevices([...data, ...devices]);
      setNewDevice({
        name: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        hospital_id: '',
        purchase_date: '',
        warranty_expiry_date: '',
        status: 'operational'
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="status-operational">
            <CheckCircle className="h-3 w-3 mr-1" />
            تشغيل
          </Badge>
        );
      case 'under_maintenance':
        return (
          <Badge className="status-maintenance">
            <Clock className="h-3 w-3 mr-1" />
            صيانة
          </Badge>
        );
      case 'retired':
        return (
          <Badge className="status-critical">
            <AlertTriangle className="h-3 w-3 mr-1" />
            خارج الخدمة
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const deviceStats = {
    total: devices.length,
    operational: devices.filter(d => d.status === 'operational').length,
    maintenance: devices.filter(d => d.status === 'under_maintenance').length,
    retired: devices.filter(d => d.status === 'retired').length
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
          <h1 className="text-3xl font-bold text-foreground">إدارة الأجهزة الطبية</h1>
          <p className="text-muted-foreground">تتبع وإدارة الأجهزة الطبية في جميع المستشفيات</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="healthcare-button">
              <Plus className="h-4 w-4 mr-2" />
              إضافة جهاز طبي
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إضافة جهاز طبي جديد</DialogTitle>
              <DialogDescription>
                أدخل معلومات الجهاز الطبي الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم الجهاز</Label>
                  <Input
                    id="name"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    placeholder="جهاز الأشعة المقطعية"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                  <Input
                    id="manufacturer"
                    value={newDevice.manufacturer}
                    onChange={(e) => setNewDevice({...newDevice, manufacturer: e.target.value})}
                    placeholder="Siemens"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="model">الموديل</Label>
                  <Input
                    id="model"
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                    placeholder="SOMATOM Force"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serial_number">الرقم التسلسلي</Label>
                  <Input
                    id="serial_number"
                    value={newDevice.serial_number}
                    onChange={(e) => setNewDevice({...newDevice, serial_number: e.target.value})}
                    placeholder="SN123456789"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hospital">المستشفى</Label>
                <Select value={newDevice.hospital_id} onValueChange={(value) => setNewDevice({...newDevice, hospital_id: value})}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">تاريخ الشراء</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={newDevice.purchase_date}
                    onChange={(e) => setNewDevice({...newDevice, purchase_date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="warranty_expiry_date">انتهاء الضمان</Label>
                  <Input
                    id="warranty_expiry_date"
                    type="date"
                    value={newDevice.warranty_expiry_date}
                    onChange={(e) => setNewDevice({...newDevice, warranty_expiry_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={newDevice.status} onValueChange={(value) => setNewDevice({...newDevice, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">تشغيل</SelectItem>
                    <SelectItem value="under_maintenance">تحت الصيانة</SelectItem>
                    <SelectItem value="retired">خارج الخدمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddDevice} className="healthcare-button">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأجهزة</p>
                <p className="text-2xl font-bold">{deviceStats.total}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">في الخدمة</p>
                <p className="text-2xl font-bold text-green-600">{deviceStats.operational}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تحت الصيانة</p>
                <p className="text-2xl font-bold text-yellow-600">{deviceStats.maintenance}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">خارج الخدمة</p>
                <p className="text-2xl font-bold text-red-600">{deviceStats.retired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الأجهزة..."
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
                <SelectItem value="operational">في الخدمة</SelectItem>
                <SelectItem value="under_maintenance">تحت الصيانة</SelectItem>
                <SelectItem value="retired">خارج الخدمة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأجهزة الطبية</CardTitle>
          <CardDescription>جدول تفصيلي بجميع الأجهزة الطبية في الشبكة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الجهاز</TableHead>
                <TableHead>الشركة المصنعة</TableHead>
                <TableHead>الموديل</TableHead>
                <TableHead>الرقم التسلسلي</TableHead>
                <TableHead>المستشفى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>انتهاء الضمان</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.manufacturer || 'غير محدد'}</TableCell>
                  <TableCell>{device.model || 'غير محدد'}</TableCell>
                  <TableCell className="font-mono text-sm">{device.serial_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{device.hospitals?.name || 'غير محدد'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>
                    {device.warranty_expiry_date ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(device.warranty_expiry_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    ) : (
                      'غير محدد'
                    )}
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

      {filteredDevices.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد أجهزة طبية</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'لم يتم العثور على أجهزة تطابق المعايير المحددة' 
                : 'لم يتم إضافة أي أجهزة طبية بعد'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="healthcare-button">
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول جهاز طبي
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalDevices;
