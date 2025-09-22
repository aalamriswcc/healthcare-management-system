import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  FileText,
  TrendingUp,
  Users,
  Building2,
  Stethoscope,
  Package,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    hospitalStats: [],
    devicesByStatus: [],
    employeesByDepartment: [],
    ordersOverTime: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetchReportData();
    fetchHospitals();
  }, [selectedPeriod, selectedHospital]);

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

  const fetchReportData = async () => {
    try {
      // Fetch hospital statistics
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          medical_devices:medical_devices(count),
          employees:employees(count),
          orders:orders(count)
        `);

      if (hospitalError) throw hospitalError;

      // Fetch device status distribution
      const { data: deviceData, error: deviceError } = await supabase
        .from('medical_devices')
        .select('status');

      if (deviceError) throw deviceError;

      // Process device status data
      const deviceStatusCounts = deviceData.reduce((acc, device) => {
        acc[device.status] = (acc[device.status] || 0) + 1;
        return acc;
      }, {});

      const devicesByStatus = [
        { name: 'في الخدمة', value: deviceStatusCounts.operational || 0, color: '#1AD9C7' },
        { name: 'تحت الصيانة', value: deviceStatusCounts.under_maintenance || 0, color: '#5FC8FF' },
        { name: 'خارج الخدمة', value: deviceStatusCounts.retired || 0, color: '#ef4444' }
      ];

      // Fetch employee department distribution
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select(`
          departments:department_id (
            name
          )
        `);

      if (employeeError) throw employeeError;

      // Process employee department data
      const departmentCounts = employeeData.reduce((acc, employee) => {
        const deptName = employee.departments?.name || 'غير محدد';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {});

      const employeesByDepartment = Object.entries(departmentCounts).map(([name, count]) => ({
        name,
        count
      }));

      // Fetch orders over time (mock data for now)
      const ordersOverTime = [
        { month: 'يناير', orders: 12, delivered: 10 },
        { month: 'فبراير', orders: 19, delivered: 16 },
        { month: 'مارس', orders: 15, delivered: 14 },
        { month: 'أبريل', orders: 22, delivered: 20 },
        { month: 'مايو', orders: 18, delivered: 17 },
        { month: 'يونيو', orders: 25, delivered: 23 }
      ];

      // Process hospital statistics
      const hospitalStats = hospitalData.map(hospital => ({
        name: hospital.name,
        devices: hospital.medical_devices?.length || 0,
        employees: hospital.employees?.length || 0,
        orders: hospital.orders?.length || 0
      }));

      setReportData({
        hospitalStats,
        devicesByStatus,
        employeesByDepartment,
        ordersOverTime
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1971E5', '#5FC8FF', '#1AD9C7', '#003EB1', '#000066'];

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
          <h1 className="text-3xl font-bold text-foreground">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل شامل لأداء النظام والإحصائيات</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير PDF
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">الفترة الزمنية:</span>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">أسبوع</SelectItem>
                  <SelectItem value="month">شهر</SelectItem>
                  <SelectItem value="quarter">ربع سنة</SelectItem>
                  <SelectItem value="year">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">المستشفى:</span>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستشفيات</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المستشفيات</p>
                <p className="text-2xl font-bold">{reportData.hospitalStats.length}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% من الشهر الماضي
                </p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأجهزة</p>
                <p className="text-2xl font-bold">
                  {reportData.devicesByStatus.reduce((sum, item) => sum + item.value, 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% من الشهر الماضي
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">
                  {reportData.employeesByDepartment.reduce((sum, item) => sum + item.count, 0)}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% من الشهر الماضي
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الطلبات هذا الشهر</p>
                <p className="text-2xl font-bold">
                  {reportData.ordersOverTime[reportData.ordersOverTime.length - 1]?.orders || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% من الشهر الماضي
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>إحصائيات المستشفيات</span>
            </CardTitle>
            <CardDescription>مقارنة الأجهزة والموظفين والطلبات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.hospitalStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="devices" fill="#1971E5" name="الأجهزة" />
                <Bar dataKey="employees" fill="#5FC8FF" name="الموظفين" />
                <Bar dataKey="orders" fill="#1AD9C7" name="الطلبات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>توزيع حالة الأجهزة</span>
            </CardTitle>
            <CardDescription>نسبة الأجهزة حسب حالة التشغيل</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.devicesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.devicesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>توزيع الموظفين حسب القسم</span>
            </CardTitle>
            <CardDescription>عدد الموظفين في كل قسم</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.employeesByDepartment} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#003EB1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>اتجاه الطلبات</span>
            </CardTitle>
            <CardDescription>الطلبات والتسليمات على مدار الوقت</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#1971E5" 
                  strokeWidth={2}
                  name="الطلبات"
                />
                <Line 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#1AD9C7" 
                  strokeWidth={2}
                  name="المسلم"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>ملخص التقرير</span>
          </CardTitle>
          <CardDescription>نظرة عامة على أداء النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">النقاط الإيجابية:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>زيادة في عدد الطلبات المسلمة بنسبة 15%</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>تحسن في كفاءة الأجهزة الطبية</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>زيادة في عدد الموظفين المؤهلين</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">نقاط التحسين:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>تحديث الأجهزة القديمة في بعض المستشفيات</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>تجديد التراخيص المنتهية الصلاحية</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>تحسين أوقات التسليم للطلبات</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
