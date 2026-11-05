import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { categoryService } from '../../services/categoryService';
import { roadmapService } from '../../services/roadmapService';
import AddRoadmapModal from '../roadmaps/AddRoadmapModal';
import AddCategoryModal from '../roadmaps/AddCategoryModal';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('devpath-sidebar-collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [isAddRoadmapOpen, setIsAddRoadmapOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const handleToggleCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('devpath-sidebar-collapsed', collapsed ? 'true' : 'false');
  };

  const loadNavData = async () => {
    try {
      const [catsRes, roadmapsRes] = await Promise.all([
        categoryService.getCategories(),
        roadmapService.getRoadmaps({ limit: 100, summaryOnly: true }),
      ]);
      setCategories(catsRes || []);
      setRoadmaps(roadmapsRes || []);
    } catch (err) {
      console.error('Failed to load navigation data:', err);
    }
  };

  useEffect(() => {
    loadNavData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5F2] dark:bg-[#12151A] flex text-[#202620] dark:text-[#F3F4F6]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        categories={categories}
        roadmaps={roadmaps}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <TopHeader
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onOpenAddRoadmap={() => setIsAddRoadmapOpen(true)}
          onOpenAddCategory={() => setIsAddCategoryOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ categories, roadmaps, refreshNavData: loadNavData }} />
        </main>
      </div>

      {/* Global Modals for Add Roadmap & Add Category */}
      <AddRoadmapModal
        isOpen={isAddRoadmapOpen}
        onClose={() => setIsAddRoadmapOpen(false)}
        categories={categories}
        onSuccess={() => {
          setIsAddRoadmapOpen(false);
          loadNavData();
        }}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={() => {
          setIsAddCategoryOpen(false);
          loadNavData();
        }}
      />
    </div>
  );
}
