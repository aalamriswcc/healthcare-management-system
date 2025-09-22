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
  Users, 
  Plus, 
  Search,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Award,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isAddLicenseDialogOpen, setIsAddLicenseDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department_id: '',
    hire_date: ''
  });
  const [newLicense, setNewLicense] = useState({
    employee_id: '',
    license_name: '',
    license_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees with related data
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email,
            phone_number
          ),
          departments:department_id (
            name,
            hospitals:hospital_id (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (employeesError) throw employeesError;

      // Fetch licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from('employee_licenses')
        .select(`
          *,
          employees:employee_id (
            employee_id,
            users:user_id (
              first_name,
              last_name
            )
          )
        `)
        .order('expiry_date', { ascending: true });

      if (licensesError) throw licensesError;

      // Fetch hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name')
        .order('name');

      if (hospitalsError) throw hospitalsError;

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name, hospital_id')
        .order('name');

      if (departmentsError) throw departmentsError;

      setEmployees(employeesData || []);
      setLicenses(licensesData || []);
      setHospitals(hospitalsData || []);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      // First create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          username: newEmployee.email,
          email: newEmployee.email,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          phone_number: newEmployee.phone_number,
          password_hash: 'temp_password' // In real app, this should be properly hashed
        }])
        .select();

      if (userError) throw userError;

      // Then create employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert([{
          ...newEmployee,
          user_id: userData[0].id
        }])
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email,
            phone_number
          ),
          departments:department_id (
            name,
            hospitals:hospital_id (
              name
            )
          )
        `);

      if (employeeError) throw employeeError;

      setEmployees([...employeeData, ...employees]);
      setNewEmployee({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        job_title: '',
        department_id: '',
        hire_date: ''
      });
      setIsAddEmployeeDialogOpen(false);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleAddLicense = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_licenses')
        .insert([newLicense])
        .select(`
          *,
          employees:employee_id (
            employee_id,
            users:user_id (
              first_name,
              last_name
            )
          )
        `);

      if (error) throw error;

      setLicenses([...data, ...licenses]);
      setNewLicense({
        employee_id: '',
        license_name: '',
        license_number: '',
        issuing_authority: '',
        issue_date: '',
        expiry_date: ''
      });
      setIsAddLicenseDialogOpen(false);
    } catch (error) {
      console.error('Error adding license:', error);
    }
  };

  const getLicenseStatusBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return (
        <Badge className="status-critical">
          <AlertTriangle className="h-3 w-3 mr-1" />
          منتهي الصلاحية
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-yellow-500">
          <Clock className="h-3 w-3 mr-1" />
          ينتهي قريباً
        </Badge>
      );
    } else {
      return (
        <Badge className="status-operational">
          <CheckCircle className="h-3 w-3 mr-1" />
          ساري
        </Badge>
      );
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.users?.first_name || ''} ${employee.users?.last_name || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHospital = hospitalFilter === 'all' || 
                           employee.departments?.hospitals?.name === hospitalFilter;
    
    return matchesSearch && matchesHospital;
  });

  const employeeStats = {
    total: employees.length,
    doctors: employees.filter(e => e.job_title?.includes('طبيب') || e.job_title?.includes('Doctor')).length,
    nurses: employees.filter(e => e.job_title?.includes('ممرض') || e.job_title?.includes('Nurse')).length,
    technicians: employees.filter(e => e.job_title?.includes('فني') || e.job_title?.includes('Technician')).length
  };

  const expiringLicenses = licenses.filter(license => {
    const today = new Date();
    const expiry = new Date(license.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });

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
          <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
          <p className="text-muted-foreground">إدارة الموظفين وتراخيصهم في جميع المستشفيات</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isAddLicenseDialogOpen} onOpenChange={setIsAddLicenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                إضافة ترخيص
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة ترخيص جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات الترخيص الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="employee">الموظف</Label>
                  <Select value={newLicense.employee_id} onValueChange={(value) => setNewLicense({...newLicense, employee_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {`${employee.users?.first_name || ''} ${employee.users?.last_name || ''} - ${employee.employee_id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="license_name">اسم الترخيص</Label>
                    <Input
                      id="license_name"
                      value={newLicense.license_name}
                      onChange={(e) => setNewLicense({...newLicense, license_name: e.target.value})}
                      placeholder="ترخيص مزاولة المهنة"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="license_number">رقم الترخيص</Label>
                    <Input
                      id="license_number"
                      value={newLicense.license_number}
                      onChange={(e) => setNewLicense({...newLicense, license_number: e.target.value})}
                      placeholder="LIC123456"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issuing_authority">الجهة المصدرة</Label>
                  <Input
                    id="issuing_authority"
                    value={newLicense.issuing_authority}
                    onChange={(e) => setNewLicense({...newLicense, issuing_authority: e.target.value})}
                    placeholder="الهيئة السعودية للتخصصات الصحية"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="issue_date">تاريخ الإصدار</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={newLicense.issue_date}
                      onChange={(e) => setNewLicense({...newLicense, issue_date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newLicense.expiry_date}
                      onChange={(e) => setNewLicense({...newLicense, expiry_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddLicenseDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddLicense} className="healthcare-button">
                  إضافة
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="healthcare-button">
                <Plus className="h-4 w-4 mr-2" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة موظف جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات الموظف الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">الاسم الأول</Label>
                    <Input
                      id="first_name"
                      value={newEmployee.first_name}
                      onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                      placeholder="أحمد"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">اسم العائلة</Label>
                    <Input
                      id="last_name"
                      value={newEmployee.last_name}
                      onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                      placeholder="محمد"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employee_id">رقم الموظف</Label>
                  <Input
                    id="employee_id"
                    value={newEmployee.employee_id}
                    onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                    placeholder="EMP001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="ahmed@hospital.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone_number">رقم الهاتف</Label>
                    <Input
                      id="phone_number"
                      value={newEmployee.phone_number}
                      onChange={(e) => setNewEmployee({...newEmployee, phone_number: e.target.value})}
                      placeholder="+966501234567"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="job_title">المسمى الوظيفي</Label>
                  <Input
                    id="job_title"
                    value={newEmployee.job_title}
                    onChange={(e) => setNewEmployee({...newEmployee, job_title: e.target.value})}
                    placeholder="طبيب أطفال"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">القسم</Label>
                    <Select value={newEmployee.department_id} onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hire_date">تاريخ التوظيف</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={newEmployee.hire_date}
                      onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddEmployee} className="healthcare-button">
                  إضافة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{employeeStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الأطباء</p>
                <p className="text-2xl font-bold text-blue-600">{employeeStats.doctors}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الممرضين</p>
                <p className="text-2xl font-bold text-green-600">{employeeStats.nurses}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تراخيص تنتهي قريباً</p>
                <p className="text-2xl font-bold text-yellow-600">{expiringLicenses.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="licenses">التراخيص</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="البحث في الموظفين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="تصفية حسب المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستشفيات</SelectItem>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.name}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employees Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الموظفين</CardTitle>
              <CardDescription>جدول تفصيلي بجميع الموظفين في الشبكة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الموظف</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>المسمى الوظيفي</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>المستشفى</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>تاريخ التوظيف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-mono text-sm">
                        {employee.employee_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {`${employee.users?.first_name || ''} ${employee.users?.last_name || ''}`}
                      </TableCell>
                      <TableCell>{employee.job_title || 'غير محدد'}</TableCell>
                      <TableCell>{employee.departments?.name || 'غير محدد'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.departments?.hospitals?.name || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.users?.email || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.hire_date 
                          ? new Date(employee.hire_date).toLocaleDateString('ar-SA')
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

        <TabsContent value="licenses" className="space-y-4">
          {/* Licenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>تراخيص الموظفين</CardTitle>
              <CardDescription>جدول تفصيلي بجميع تراخيص الموظفين</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>اسم الترخيص</TableHead>
                    <TableHead>رقم الترخيص</TableHead>
                    <TableHead>الجهة المصدرة</TableHead>
                    <TableHead>تاريخ الإصدار</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">
                        {`${license.employees?.users?.first_name || ''} ${license.employees?.users?.last_name || ''}`}
                        <div className="text-xs text-muted-foreground">
                          {license.employees?.employee_id}
                        </div>
                      </TableCell>
                      <TableCell>{license.license_name}</TableCell>
                      <TableCell className="font-mono text-sm">{license.license_number}</TableCell>
                      <TableCell>{license.issuing_authority}</TableCell>
                      <TableCell>
                        {new Date(license.issue_date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(license.expiry_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getLicenseStatusBadge(license.expiry_date)}</TableCell>
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
      </Tabs>

      {filteredEmployees.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا يوجد موظفين</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || hospitalFilter !== 'all' 
                ? 'لم يتم العثور على موظفين يطابقون المعايير المحددة' 
                : 'لم يتم إضافة أي موظفين بعد'}
            </p>
            {!searchTerm && hospitalFilter === 'all' && (
              <Button onClick={() => setIsAddEmployeeDialogOpen(true)} className="healthcare-button">
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول موظف
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Employees;
