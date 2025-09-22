import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  Stethoscope,
  Search,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    is_headquarters: false
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .insert([newHospital])
        .select();

      if (error) throw error;

      setHospitals([...hospitals, ...data]);
      setNewHospital({ name: '', location: '', is_headquarters: false });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding hospital:', error);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-foreground">إدارة المستشفيات</h1>
          <p className="text-muted-foreground">إدارة شبكة المستشفيات والمرافق الطبية</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="healthcare-button">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مستشفى جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مستشفى جديد</DialogTitle>
              <DialogDescription>
                أدخل معلومات المستشفى الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم المستشفى</Label>
                <Input
                  id="name"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                  placeholder="مستشفى الملك فهد"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={newHospital.location}
                  onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                  placeholder="الرياض، المملكة العربية السعودية"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="headquarters"
                  checked={newHospital.is_headquarters}
                  onChange={(e) => setNewHospital({...newHospital, is_headquarters: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="headquarters">مقر رئيسي</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddHospital} className="healthcare-button">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في المستشفيات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="healthcare-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  {hospital.is_headquarters && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      مقر رئيسي
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{hospital.name}</CardTitle>
              <CardDescription className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{hospital.location || 'غير محدد'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">الموظفين</p>
                    <p className="text-muted-foreground">156</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">الأجهزة</p>
                    <p className="text-muted-foreground">89</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  عرض التفاصيل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hospitals Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستشفيات</CardTitle>
          <CardDescription>جدول تفصيلي بجميع المستشفيات في الشبكة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستشفى</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.location || 'غير محدد'}</TableCell>
                  <TableCell>
                    {hospital.is_headquarters ? (
                      <Badge variant="default" className="bg-yellow-500">
                        مقر رئيسي
                      </Badge>
                    ) : (
                      <Badge variant="secondary">فرع</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(hospital.created_at).toLocaleDateString('ar-SA')}
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

      {filteredHospitals.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد مستشفيات</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'لم يتم العثور على مستشفيات تطابق البحث' : 'لم يتم إضافة أي مستشفيات بعد'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="healthcare-button">
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول مستشفى
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hospitals;
