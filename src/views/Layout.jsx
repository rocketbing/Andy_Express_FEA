import { Outlet } from "react-router-dom";
import LeftMenu from "./LeftMenu/LeftMenu";
import TopMenu from "./TopMenu/TopMenu";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      <LeftMenu />
      <main className="main-content">
        <TopMenu />
        <Outlet />
      </main>
    </div>
  );
}

