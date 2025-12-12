import { useRoutes } from "react-router-dom";
import Layout from "../views/Layout";
import Home from "../views/Home";
import About from "../views/About";
import NotFound from "../views/NotFound";
import Product from "../views/Products";
import Order from "../views/Orders";
import MemberInfo from "../views/MemberInfo";
import AfterSales from "../views/AfterSales";
import StockPendingList from "../views/Products/StockPendingList";
import StockedList from "../views/Products/StockedList";
import PendingPackList from "../views/Products/PendingPackList";
import PackedList from "../views/Products/PackedList";
import ReturningList from "../views/Products/ReturningList";
import ReturnedList from "../views/Products/ReturnedList";
import PendingPayList from "../views/Orders/PendingPayList";
import PendingSendList from "../views/Orders/PendingSendList";
import ShippedList from "../views/Orders/ShippedList";
import ReceivedList from "../views/Orders/ReceivedList";
import Login from "../views/Login/Login";
import EmailAnnouncement from "../views/EmailAnnouncement";
import EmailAnnouncementCreate from "../views/EmailAnnouncement/Create";
import EmailAnnouncementEdit from "../views/EmailAnnouncement/Edit";
import EmailAnnouncementDetail from "../views/EmailAnnouncement/Detail";
import Analysis from "../views/Analysis";
import OrderFlow from "../views/OrderFlow";
import ReturnFlow from "../views/ReturnFlow";
import CancelOrder from "../views/CancelOrder";
import OrderTest from "../views/OrderTest";
import ProtectedRoute from "../components/ProtectedRoute";
import ReverseProtectedRoute from "../components/ReverseProtectedRoute";
import Complaint from "../views/Complaint";
import UserCenter from "../views/UserCenter";
export default function Router() {
  const routes = useRoutes([
    // 公开路由 - 不需要认证
    { path: "login", element: <ReverseProtectedRoute><Login /></ReverseProtectedRoute> },
    
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Home /> },
        { path: "about", element: <About /> },
        { path: "user-center", element: <UserCenter /> },
        {
          path: "products",
          element: <Product />,
          children: [
            { path: 'pending-stock', element: <StockPendingList /> },
            { path: 'stocked', element: <StockedList /> },
            { path: 'pending-pack', element: <PendingPackList /> },
            { path: 'packed', element: <PackedList /> },
            { path: 'returning', element: <ReturningList /> },
            { path: 'returned', element: <ReturnedList /> }
          ]
        },
        {
          path: "orders",
          element: <Order />,
          children: [
            { path: 'pending-pay', element: <PendingPayList /> },
            { path: 'pending-send', element: <PendingSendList /> },
            { path: 'shipped', element: <ShippedList /> },
            { path: 'received', element: <ReceivedList /> },
          ]
        },
        { path: "members", element: <MemberInfo /> },
        { path: "feedback", element: <Complaint /> },
        { path: "after-sales", element: <AfterSales /> },
        {
          path: 'email-announcement', element: <EmailAnnouncement />, children: [
            { path: 'create', element: <EmailAnnouncementCreate /> },
            { path: 'edit', element: <EmailAnnouncementEdit /> },
            { path: 'detail/:id', element: <EmailAnnouncementDetail /> },
          ]
        },
        { path: 'analysis', element: <Analysis /> },
        { path: 'order-flow', element: <OrderFlow /> },
        { path: 'return-flow', element: <ReturnFlow /> },
        { path: 'cancel-order', element: <CancelOrder /> },
        { path: 'order-test', element: <OrderTest /> }
      ],
    },
    
    // 404 页面
    { path: "*", element: <NotFound /> },
  ]);

  return routes;
}
