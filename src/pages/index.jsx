import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Browse from "./Browse";

import CreateListing from "./CreateListing";

import Messages from "./Messages";

import Profile from "./Profile";

import CampusMap from "./CampusMap";

import ListingDetail from "./ListingDetail";

import SavedListings from "./SavedListings";

import AdminDashboard from "./AdminDashboard";

import Debug from "./Debug";

import Trades from "./Trades";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Browse: Browse,
    
    CreateListing: CreateListing,
    
    Messages: Messages,
    
    Profile: Profile,
    
    CampusMap: CampusMap,
    
    ListingDetail: ListingDetail,
    
    SavedListings: SavedListings,
    
    AdminDashboard: AdminDashboard,
    
    Debug: Debug,
    
    Trades: Trades,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Browse" element={<Browse />} />
                
                <Route path="/CreateListing" element={<CreateListing />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/CampusMap" element={<CampusMap />} />
                
                <Route path="/ListingDetail" element={<ListingDetail />} />
                
                <Route path="/SavedListings" element={<SavedListings />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Debug" element={<Debug />} />
                
                <Route path="/Trades" element={<Trades />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}