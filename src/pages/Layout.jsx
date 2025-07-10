

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import VoiceAssistant from "../components/voice/VoiceAssistant";
import {
  Home,
  Search,
  PlusCircle,
  User as UserIcon,
  Shield,
  Menu,
  X,
  MapPin,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { title: "Home", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Browse", url: createPageUrl("Browse"), icon: Search },
  { title: "Sell", url: createPageUrl("CreateListing"), icon: PlusCircle },
  { title: "Trades", url: createPageUrl("Trades"), icon: ArrowLeftRight }, 
  { title: "Campus Map", url: createPageUrl("CampusMap"), icon: MapPin },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    await User.logout();
    setCurrentUser(null);
    window.location.href = createPageUrl("Dashboard");
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  }

  const handleVoiceSearchResults = (results, searchParams) => {
    const queryParams = new URLSearchParams();
    if (searchParams.searchTerms) queryParams.set('search', searchParams.searchTerms);
    if (searchParams.category) queryParams.set('category', searchParams.category);
    if (searchParams.maxPrice) queryParams.set('maxPrice', searchParams.maxPrice);
    
    window.location.href = createPageUrl(`Browse?${queryParams.toString()}`);
  };

  const handleVoiceError = (error) => {
    console.error('Voice assistant error:', error);
  };

  return (
      <div className="min-h-screen bg-white font-sans">
        <style>
          {`
            :root { 
              --ut-orange: #DF6F1D; 
              --ut-white: #FFFFFF;
              --ut-charcoal: #333F48;
            }
          `}
        </style>
        <header className="bg-[#DF6F1D] shadow-md sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d1bc5453_PNGimage.JPEG" 
                  alt="Longhorn Logo" 
                  className="h-12 object-contain"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                      location.pathname === item.url
                        ? 'text-white bg-black/20'
                        : 'text-orange-100 hover:text-white hover:bg-black/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-sm font-medium focus:outline-none hover:opacity-80 transition-opacity">
                        <Avatar className="w-9 h-9 ring-2 ring-white/50">
                          <AvatarImage src={currentUser.profile_image} />
                          <AvatarFallback className="bg-white text-[#DF6F1D] font-bold">
                            {getInitials(currentUser.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white hidden sm:block font-semibold">Hook 'em!</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-orange-200">
                      <DropdownMenuLabel>
                        <p className="font-bold text-orange-900">{currentUser.full_name}</p>
                        <p className="text-xs text-orange-600 font-normal">{currentUser.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Profile")} className="cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      {currentUser.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("AdminDashboard")} className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Debug")} className="cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M14.5 18.5h-5l-6-6 6-6h5l6 6-6 6z"/><path d="m12 15-1-1-1 1 1 1 1-1Z"/><path d="m12 9-1-1-1 1 1 1 1-1Z"/></svg>
                          <span>Debug Suite</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button onClick={User.login} className="bg-[#DF6F1D] hover:bg-orange-700 text-white font-bold border-2 border-white">
                    Join the Herd
                  </Button>
                )}
                <button 
                  className="md:hidden text-white hover:text-orange-200 transition-colors" 
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm p-6 shadow-xl bg-[#DF6F1D]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d1bc5453_PNGimage.JPEG" 
                      alt="Longhorn Logo" 
                      className="h-20"
                    />
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-orange-200">
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-2">
                  {navigationItems.map((item) => (
                      <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 text-lg font-semibold transition-all duration-200 px-4 py-3 rounded-lg ${
                          location.pathname === item.url 
                            ? 'text-white bg-black/20' 
                            : 'text-orange-100 hover:text-white hover:bg-black/10'
                      }`}
                      >
                      <item.icon className="w-6 h-6" />
                      {item.title}
                      </Link>
                  ))}
                  </nav>
                  
                  <div className="absolute bottom-8 left-0 right-0 px-6">
                    <div className="text-center text-orange-200">
                      <p className="font-medium">Hook 'em Horns! 🤘</p>
                      <p className="text-sm mt-1">UT Austin Pride</p>
                    </div>
                  </div>
              </div>
          </div>
        )}

        <main className="bg-white">
            {children}
        </main>

        {/* Voice Assistant */}
        <VoiceAssistant 
          onSearchResults={handleVoiceSearchResults}
          onError={handleVoiceError}
        />

        <footer className="bg-[#DF6F1D] mt-16">
          <div className="container mx-auto py-6 px-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d1bc5453_PNGimage.JPEG" 
                  alt="Longhorn Logo" 
                  className="h-28 opacity-80"
                />
            </div>
            <div>
              <p className="font-bold text-lg text-right">Hook 'em Horns! 🤘</p>
              <p className="text-orange-200 text-sm text-right">&copy; {new Date().getFullYear()} Longhorn Exchange</p>
            </div>
          </div>
        </footer>
      </div>
  );
}

