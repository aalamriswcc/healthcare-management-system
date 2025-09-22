import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Stethoscope, 
  Package, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    hospitals: 0,
    devices: 0,
    employees: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch hospitals count
        const { count: hospitalsCount } = await supabase
          .from('hospitals')
          .select('*', { count: 'exact', head: true });

        // Fetch devices count
        const { count: devicesCount } = await supabase
          .from('medical_devices')
          .select('*', { count: 'exact', head: true });

        // Fetch employees count
        const { count: employeesCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });

        // Fetch orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        setStats({
          hospitals: hospitalsCount || 0,
          devices: devicesCount || 0,
          employees: employeesCount || 0,
          orders: ordersCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'المستشفيات',
      titleEn: 'Hospitals',
      value: stats.hospitals,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      title: 'الأجهزة الطبية',
      titleEn: 'Medical Devices',
      value: stats.devices,
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12.3%',
      changeType: 'positive'
    },
    {
      title: 'الموظفين',
      titleEn: 'Employees',
      value: stats.employees,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5.1%',
      changeType: 'positive'
    },
    {
      title: 'الطلبات',
      titleEn: 'Orders',
      value: stats.orders,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-1.2%',
      changeType: 'negative'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'device_maintenance',
      title: 'صيانة جهاز الأشعة المقطعية',
      titleEn: 'CT Scanner Maintenance',
      hospital: 'مستشفى الملك فهد',
      time: '2 ساعات مضت',
      status: 'completed'
    },
    {
      id: 2,
      type: 'new_order',
      title: 'طلب جديد للمستلزمات الطبية',
      titleEn: 'New Medical Supplies Order',
      hospital: 'مستشفى الملك عبدالعزيز',
      time: '4 ساعات مضت',
      status: 'pending'
    },
    {
      id: 3,
      type: 'license_expiry',
      title: 'انتهاء صلاحية ترخيص طبيب',
      titleEn: 'Doctor License Expiry',
      hospital: 'مستشفى الملك خالد',
      time: '6 ساعات مضت',
      status: 'warning'
    }
  ];

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
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">لوحة المعلومات الرئيسية</h1>
        <p className="text-muted-foreground">نظرة عامة على نظام إدارة الرعاية الصحية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="healthcare-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{stat.titleEn}</span>
                  <Badge 
                    variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>الأنشطة الأخيرة</span>
            </CardTitle>
            <CardDescription>آخر الأحداث في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.titleEn}</p>
                    <p className="text-xs text-muted-foreground">{activity.hospital} • {activity.time}</p>
                  </div>
                  <Badge variant={
                    activity.status === 'completed' ? 'default' :
                    activity.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {activity.status === 'completed' ? 'مكتمل' :
                     activity.status === 'pending' ? 'قيد الانتظار' :
                     'تحذير'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start healthcare-button">
                <Package className="h-4 w-4 mr-2" />
                طلب جديد
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Stethoscope className="h-4 w-4 mr-2" />
                إضافة جهاز طبي
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                إضافة موظف
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                جدولة صيانة
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>حالة النظام</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>أداء الخوادم</span>
                  <span>98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>استخدام قاعدة البيانات</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>مساحة التخزين</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span>تنبيهات</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">3 تراخيص تنتهي هذا الأسبوع</p>
                  <p className="text-xs text-yellow-600">يجب تجديد التراخيص قبل انتهاء صلاحيتها</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800">جهاز خارج الخدمة</p>
                  <p className="text-xs text-red-600">جهاز الأشعة في مستشفى الملك خالد</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
