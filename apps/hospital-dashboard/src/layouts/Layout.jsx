import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Activity, 
  Calendar, 
  Plus, 
  Shield, 
  User, 
  Users 
} from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Navigation } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

// Optimized Professional Card Component
const ProfessionalCard = ({ title, count, icon: Icon, color = "blue", trend, className = "" }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Performance optimized hover effect
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -3,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        willChange: "transform"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        willChange: "auto"
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50/90 to-blue-100/90 border-blue-200/50",
    green: "bg-gradient-to-br from-emerald-50/90 to-emerald-100/90 border-emerald-200/50",
    purple: "bg-gradient-to-br from-indigo-50/90 to-indigo-100/90 border-indigo-200/50",
    orange: "bg-gradient-to-br from-amber-50/90 to-amber-100/90 border-amber-200/50"
  };

  const iconColorClasses = {
    blue: "text-blue-600 bg-blue-100/80",
    green: "text-emerald-600 bg-emerald-100/80", 
    purple: "text-indigo-600 bg-indigo-100/80",
    orange: "text-amber-600 bg-amber-100/80"
  };

  return (
    <div
      ref={cardRef}
      className={`
        ${colorClasses[color]} 
        backdrop-blur-sm border rounded-xl p-6 
        will-change-transform shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColorClasses[color]} border border-white/50`}>
          <Icon size={20} weight="duotone" />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
};

// Simple Background Pattern
const ProfessionalBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Clean healthcare gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100" />
      
      {/* Subtle medical cross pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating healthcare elements */}
      <div className="absolute top-1/4 left-1/5 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 right-1/5 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
      <div className="absolute top-2/3 right-1/3 w-20 h-20 bg-indigo-200/20 rounded-full blur-2xl" />
    </div>
  );
};

// Optimized Subtle Heart Animation
const SubtleHeartSVG = () => {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Simple, performance-friendly heartbeat
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    
    tl.to(path, {
      scale: 1.05,
      duration: 0.4,
      ease: "power2.inOut",
      transformOrigin: "center"
    })
    .to(path, {
      scale: 1,
      duration: 0.3,
      ease: "power2.inOut"
    });

    return () => tl.kill();
  }, []);

  return (
    <div className="relative w-12 h-12">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.15))' }}
      >
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d="M50 85 C20 60, 5 35, 25 20 C35 10, 45 15, 50 25 C55 15, 65 10, 75 20 C95 35, 80 60, 50 85 Z"
          fill="url(#heartGradient)"
          className="will-change-transform"
        />
      </svg>
    </div>
  );
};

const Layout = () => {
  const layoutRef = useRef(null);
  const [stats] = useState({
    totalPatients: 1247,
    activeEmergencies: 8,
    availableBeds: 156,
    staffOnDuty: 89
  });

  useEffect(() => {
    // Smooth scrolling with optimized CSS scroll-behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Simple entrance animation
    gsap.fromTo(layoutRef.current, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power2.out",
        onComplete: () => {
          // Set will-change to auto after animation completes
          layoutRef.current.style.willChange = 'auto';
        }
      }
    );

    // Optimize scroll performance
    const optimizeScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflow = 'auto';
    };

    optimizeScroll();

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <>
      <ProfessionalBackground />
      <div ref={layoutRef} className="min-h-screen" style={{ willChange: 'transform' }}>
        <Navigation />
        
        {/* Hero Section */}
        <main className="pt-24 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <SubtleHeartSVG />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                AlertX Healthcare
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Professional emergency response and hospital management system
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <ProfessionalCard
                title="Total Patients"
                count={stats.totalPatients.toLocaleString()}
                icon={Users}
                color="blue"
                trend={8.2}
              />
              <ProfessionalCard
                title="Active Emergencies"
                count={stats.activeEmergencies}
                icon={Activity}
                color="orange"
                trend={-2.1}
              />
              <ProfessionalCard
                title="Available Beds"
                count={stats.availableBeds}
                icon={Shield}
                color="green"
                trend={5.3}
              />
              <ProfessionalCard
                title="Staff on Duty"
                count={stats.staffOnDuty}
                icon={User}
                color="purple"
                trend={1.7}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 mb-12 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl transition-all duration-200 border border-blue-200/50 hover:border-blue-300/50">
                  <Plus size={20} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">New Emergency</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl transition-all duration-200 border border-emerald-200/50 hover:border-emerald-300/50">
                  <Calendar size={20} className="text-emerald-600" />
                  <span className="font-semibold text-emerald-900">Schedule Appointment</span>
                </button>
                <button className="flex items-center gap-3 p-4 bg-indigo-50/80 hover:bg-indigo-100/80 rounded-xl transition-all duration-200 border border-indigo-200/50 hover:border-indigo-300/50">
                  <Activity size={20} className="text-indigo-600" />
                  <span className="font-semibold text-indigo-900">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;