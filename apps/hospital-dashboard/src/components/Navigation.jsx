import { gsap } from 'gsap';
import { 
  Activity, 
  Bell, 
  Calendar, 
  ChartLineUp, 
  Gear, 
  House, 
  HeartStraight, 
  SignOut, 
  User, 
  Users 
} from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';

const Navigation = () => {
  const navRef = useRef(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Simple entrance animation for navigation
    gsap.fromTo(navRef.current, 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'emergencies', label: 'Emergencies', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: ChartLineUp },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <HeartStraight size={20} className="text-white" weight="bold" />
            </div>
            <span className="text-xl font-bold text-slate-900">AlertX</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon size={18} weight={isActive ? "duotone" : "regular"} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <Gear size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" weight="bold" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-900">Dr. Sarah Chen</p>
                  <p className="text-xs text-slate-600">Administrator</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/60 backdrop-blur-lg overflow-hidden">
                  <div className="p-3 border-b border-slate-200/60">
                    <p className="text-sm font-medium text-slate-900">Dr. Sarah Chen</p>
                    <p className="text-xs text-slate-600">Administrator</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors">
                      <User size={16} className="text-slate-600" />
                      <span className="text-sm text-slate-700">Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors">
                      <Gear size={16} className="text-slate-600" />
                      <span className="text-sm text-slate-700">Settings</span>
                    </button>
                    <hr className="my-2 border-slate-200" />
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600">
                      <SignOut size={16} />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navigation };