import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllUserAnalytics, selectUserAnalytics } from '../store/analytics';
import { Table, Spin, Alert,Col,Row } from 'antd';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import moment from 'moment';
import CustomTab from '../components/CustomTab.jsx';

export default function Order() {
    const dispatch = useDispatch();
    const userAnalytics = useSelector(selectUserAnalytics);
    useEffect(() => {
        dispatch(getAllUserAnalytics({ page: 0, size: 10 }));
    }, [dispatch]);
    return (
        <>
        <CustomTab
            cardTitle="会员信息"
            // columns={columns}
            // data={userAnalytics.data}
            // paginationTotal={userAnalytics.total}
            // pageChange={handlePageChange}
            // currentPage={userAnalytics.page}
            // pageSize={userAnalytics.size}
        />
        </>
    )
}