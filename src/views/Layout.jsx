import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import LeftMenu from "./LeftMenu/LeftMenu";
import TopMenu from "./TopMenu/TopMenu";
import "./Layout.css";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
      // 如果不是移动端，关闭移动菜单
      if (window.innerWidth > 767) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* 移动端遮罩层 */}
      {isMobile && (
        <div 
          className={`menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        />
      )}
      
      <LeftMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
      />
      
      <main className="main-content">
        <TopMenu 
          onToggleMobileMenu={isMobile ? toggleMobileMenu : undefined}
          isMobile={isMobile}
        />
        <Outlet />
      </main>
    </div>
  );
}

