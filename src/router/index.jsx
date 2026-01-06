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
    { path: "/login", element: <ReverseProtectedRoute><Login /></ReverseProtectedRoute> },
    
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: (<ProtectedRoute><Home /></ProtectedRoute>) },
        { path: "about", element: (<ProtectedRoute><About /></ProtectedRoute>) },
        { path: "user-center", element: (<ProtectedRoute><UserCenter /></ProtectedRoute>) },
        {
          path: "products",
          element: (<ProtectedRoute><Product /></ProtectedRoute>),
          children: [
            { path: 'pending-stock', element: (<ProtectedRoute><StockPendingList /></ProtectedRoute>) },
            { path: 'stocked', element: (<ProtectedRoute><StockedList /></ProtectedRoute>) },
            { path: 'pending-pack', element: (<ProtectedRoute><PendingPackList /></ProtectedRoute>) },
            { path: 'packed', element: (<ProtectedRoute><PackedList /></ProtectedRoute>) },
            { path: 'returning', element: (<ProtectedRoute><ReturningList /></ProtectedRoute>) },
            { path: 'returned', element: (<ProtectedRoute><ReturnedList /></ProtectedRoute>) }
          ]
        },
        {
          path: "orders",
          element: (<ProtectedRoute><Order /></ProtectedRoute>),
          children: [
            { path: 'pending-pay', element: (<ProtectedRoute><PendingPayList /></ProtectedRoute>) },
            { path: 'pending-send', element: (<ProtectedRoute><PendingSendList /></ProtectedRoute>) },
            { path: 'shipped', element: (<ProtectedRoute><ShippedList /></ProtectedRoute>) },
            { path: 'received', element: (<ProtectedRoute><ReceivedList /></ProtectedRoute>) },
          ]
        },
        { path: "members", element: (<ProtectedRoute><MemberInfo /></ProtectedRoute>) },
        { path: "feedback", element: (<ProtectedRoute><Complaint /></ProtectedRoute>) },
        { path: "after-sales", element: (<ProtectedRoute><AfterSales /></ProtectedRoute>) },
        {
          path: 'email-announcement', element: (<ProtectedRoute><EmailAnnouncement /></ProtectedRoute>), children: [
            { path: 'create', element: (<ProtectedRoute><EmailAnnouncementCreate /></ProtectedRoute>) },
            { path: 'edit', element: (<ProtectedRoute><EmailAnnouncementEdit /></ProtectedRoute>) },
            { path: 'detail/:id', element: (<ProtectedRoute><EmailAnnouncementDetail /></ProtectedRoute>) },
          ]
        },
        { path: 'analysis', element: (<ProtectedRoute><Analysis /></ProtectedRoute>) },
        { path: 'order-flow', element: (<ProtectedRoute><OrderFlow /></ProtectedRoute>) },
        { path: 'return-flow', element: (<ProtectedRoute><ReturnFlow /></ProtectedRoute>) },
        { path: 'cancel-order', element: (<ProtectedRoute><CancelOrder /></ProtectedRoute>) },
        { path: 'order-test', element: (<ProtectedRoute><OrderTest /></ProtectedRoute>) }
      ],
    },
    
    // 404 页面
    { path: "*", element: <NotFound /> },
  ]);

  return routes;
}
