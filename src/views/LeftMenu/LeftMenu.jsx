import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "antd";
import "./LeftMenu.css";
import logoImage from "../../images/logo.png";
import { logout } from "../../store/authSlice";
import { resetAll as resetProduct } from "../../store/productSlice";
import { resetAll as resetOrder } from "../../store/orderSlice";
import { resetAll as resetEmail } from "../../store/emailAnnouncementSlice";
import { useDispatch } from "react-redux";

export default function LeftMenu({ isMobileMenuOpen, onCloseMobileMenu }) {
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  

  const menuItems = [
    { id: 1, name: "用户中心", icon: "👤", path: "/user-center" },
    {
      id: 2, name: "统计中心", icon: "📊", path: "/analysis",
      hasSubmenu: true,
      submenu: [
        { id: 20, name: "统计中心", icon: "📊", path: "/analysis" },
        { id: 21, name: "订单流水", icon: "💰", path: "/order-flow" },
        { id: 22, name: "退货流水", icon: "💸", path: "/return-flow" },
        { id: 23, name: "取消订单", icon: "❌", path: "/cancel-order" }
      ]
    },
    { id: 3, name: "所有商品", icon: "📦", path: "/products" },
    { id: 4, name: "所有订单", icon: "📋", path: "/orders" },
    {
      id: 5,
      name: "邮件&公告",
      icon: "📧",
      path: "/email-announcement",
      hasSubmenu: true,
      submenu: [
        { id: 51, name: "发表", icon: "✏️", path: "/email-announcement/create" },
        { id: 52, name: "列表", icon: "📋", path: "/email-announcement/edit" }
      ]
    },
    { id: 6, name: "会员信息", icon: "💳", path: "/members" },
    { id: 7, name: "投诉与建议", icon: "💬", path: "/feedback" },
    { id: 8, name: "售后统计", icon: "📊", path: "/after-sales" },
    { id: 9, name: "退出登录", icon: "🚪", path: "/logout", isLogout: true },
  ];

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      // 清除所有 Redux 数据
      dispatch(resetProduct());
      dispatch(resetOrder());
      dispatch(resetEmail());
      dispatch(logout());
      // 将当前路径作为 query 参数传递
      const redirectPath = encodeURIComponent(location.pathname + location.search + location.hash);
      navigate(`/login?redirect=${redirectPath}`);
      return;
    }

    if (item.hasSubmenu) {
      // 处理有二级菜单的项目
      const newExpandedMenus = new Set(expandedMenus);
      if (newExpandedMenus.has(item.id)) {
        newExpandedMenus.delete(item.id);
      } else {
        newExpandedMenus.add(item.id);
      }
      setExpandedMenus(newExpandedMenus);
    } else {
      // 处理普通菜单项
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (subItem) => {
    navigate(subItem.path);
  };

  const toggleCollapse = () => {
    // 如果是小屏幕，点击折叠按钮应该关闭菜单
    if (window.innerWidth <= 767 && onCloseMobileMenu) {
      onCloseMobileMenu();
      return;
    }
    
    // 大屏幕时正常折叠/展开
    setIsCollapsed(!isCollapsed);
    // 收起菜单时清空展开状态
    if (!isCollapsed) {
      setExpandedMenus(new Set());
    }
  };

  // 移动端点击菜单项后关闭菜单
  const handleMenuItemClick = (item) => {
    handleMenuClick(item);
    if (window.innerWidth <= 767 && onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const handleSubmenuItemClick = (subItem) => {
    handleSubmenuClick(subItem);
    if (window.innerWidth <= 767 && onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <div className={`left-menu ${isCollapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}>
      {/* 折叠按钮 */}
      <button className="collapse-btn" onClick={toggleCollapse}>
        <span className="collapse-icon">{isCollapsed ? "›" : "‹"}</span>
      </button>

      {/* Logo 区域 */}
      <div className="logo-container" style={{ display: isCollapsed ? "none" : "flex" }}>
        <img
          src={logoImage}
          alt="Logo"
          className="logo-image"
          onError={(e) => {
            // 如果图片加载失败，显示占位文字
            e.target.style.display = "none";
            const placeholder = document.createElement('div');
            placeholder.className = 'logo-placeholder';
            placeholder.textContent = 'LOGO';
            placeholder.style.cssText = 'width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px; font-size: 20px; font-weight: bold; color: #999;';
            e.target.parentNode.appendChild(placeholder);
          }}
        />
      </div>

      {/* 导航菜单 */}
      <nav className="menu-nav">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.id} className="menu-item-wrapper">
              <Tooltip
                title={isCollapsed ? item.name : ""}
                placement="right"
                mouseEnterDelay={0.3}
                mouseLeaveDelay={0.1}
              >
                <div
                  className={`menu-item ${item.isLogout ? "logout-item" : ""} ${item.hasSubmenu ? "has-submenu" : ""}`}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!isCollapsed && <span className="menu-text">{item.name}</span>}
                  {!isCollapsed && item.hasSubmenu && (
                    <span className={`submenu-arrow ${expandedMenus.has(item.id) ? "expanded" : ""}`}>
                      ▼
                    </span>
                  )}
                </div>
              </Tooltip>

              {/* 二级菜单 */}
              {!isCollapsed && item.hasSubmenu && expandedMenus.has(item.id) && (
                <ul className="submenu-list">
                  {item.submenu.map((subItem) => (
                    <Tooltip
                      key={subItem.id}
                      title={isCollapsed ? subItem.name : ""}
                      placement="right"
                      mouseEnterDelay={0.3}
                      mouseLeaveDelay={0.1}
                    >
                      <li
                        className="submenu-item"
                        onClick={() => handleSubmenuItemClick(subItem)}
                      >
                        <span className="submenu-icon">{subItem.icon}</span>
                        <span className="submenu-text">{subItem.name}</span>
                      </li>
                    </Tooltip>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
