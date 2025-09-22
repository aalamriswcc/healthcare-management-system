import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  Building2, 
  Stethoscope, 
  Package, 
  Users, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'الرئيسية', labelEn: 'Dashboard', icon: Home },
    { path: '/hospitals', label: 'المستشفيات', labelEn: 'Hospitals', icon: Building2 },
    { path: '/devices', label: 'الأجهزة الطبية', labelEn: 'Medical Devices', icon: Stethoscope },
    { path: '/inventory', label: 'المخزون', labelEn: 'Inventory', icon: Package },
    { path: '/employees', label: 'الموظفين', labelEn: 'Employees', icon: Users },
    { path: '/reports', label: 'التقارير', labelEn: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  ];

  const NavItems = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground hidden lg:block">
              {item.labelEn}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-foreground">نظام إدارة الرعاية الصحية</h1>
              <p className="text-xs text-muted-foreground">Healthcare Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavItems />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 pb-4 border-b">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="font-bold">نظام إدارة الرعاية الصحية</h2>
                      <p className="text-xs text-muted-foreground">Healthcare Management</p>
                    </div>
                  </div>
                  <NavItems mobile />
                  <div className="pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
