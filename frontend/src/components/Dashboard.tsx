'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { DonationOverview } from './DonationOverview';
import { QuickActions } from './QuickActions';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function Dashboard() {
  const { user, isAuthenticated, dashboardStats, isLoading } = useAppStore();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentKolIndex, setCurrentKolIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // Mock top 10 KOLs with real data from the provided HTML
  const topKOLs = [
    { id: 1, name: "MixiGaming", count: "5.135", rank: 1, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/26597af21b1d43daaf90b8a7c6292d68/20200420/logo_Mixigaming_3_xFJryY.png", ring: "/img/rank-1.1de0a532.png" },
    { id: 2, name: "BLV Anh Quân", count: "4.503", rank: 2, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/de3d636e3d6242858b1d9dde19f93080/20200517/76267505_109363070508142_8340290335179538432_n_YBGgSw.jpg", ring: "/img/rank-2.90dc16ea.png" },
    { id: 3, name: "Tabi Tuấn Anh", count: "3.443", rank: 3, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/9eb3bd28cd7944b397d6319ac112afd2/20200806/d6e70131792e16df7698c8eaa8f5ea33_KsADZr.jpg", ring: "/img/rank-3.3b49a224.png" },
    { id: 4, name: "Bình Be", count: "1.167", rank: 4, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/281567362_568319251319766_446858225644230586_n_BAsu2M.jpg", ring: "" },
    { id: 5, name: "GOSU FIFA", count: "1.087", rank: 5, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/1_Je5K7B.jpg", ring: "" },
    { id: 6, name: "Em Chè", count: "1.014", rank: 6, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/22a6d2cb0570e8addb7108a36f971399_KcmEaf.jpg", ring: "" },
    { id: 7, name: "Thầy Giáo Ba", count: "986", rank: 7, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/admin/20200817/611838743ad04595948e5f9c0224530f-Thaygiaobainao_1_MAZZFJ_2.jpg", ring: "" },
    { id: 8, name: "LeeHariii", count: "976", rank: 8, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/avt_svg_chap_tay_WxRdvY.jpg", ring: "" },
    { id: 9, name: "CƯỜNG BẢY NÚI", count: "938", rank: 9, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/dc64cf788d3f4fab8f8827ff82d97958/20200410/0e161db204111a30b1289941d94b709f_9pRBtw.jpg", ring: "" },
    { id: 10, name: "tranbinh", count: "894", rank: 10, avatar: "https://d2flni3d0ypa48.cloudfront.net/static/prod/uploads/426229994_1177526543647428_7967109599485253782_n_ptXhtq.jpg", ring: "" }
  ];

  useEffect(() => {
    // Simulate loading dashboard stats
    const timer = setTimeout(() => {
      setIsLoadingStats(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-rotate advertising banners
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, []);

  useEffect(() => {
    // Handle scroll events for Quick Actions positioning
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Auto-scroll KOLs carousel
    if (isAutoScrolling) {
      const kolTimer = setInterval(() => {
        setCurrentKolIndex((prev) => {
          const totalSlides = Math.ceil(topKOLs.length / 3);
          return (prev + 1) % totalSlides;
        });
      }, 3000); // Move every 3 seconds

      return () => clearInterval(kolTimer);
    }
  }, [isAutoScrolling, topKOLs.length]);

  const nextKol = () => {
    const totalSlides = Math.ceil(topKOLs.length / 3);
    setCurrentKolIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevKol = () => {
    const totalSlides = Math.ceil(topKOLs.length / 3);
    setCurrentKolIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">D</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to DonationPlatform
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Please sign in to access your KOL dashboard</p>
          <div className="space-y-4">
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Add safety check for user object
  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoadingStats) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock dashboard stats for demonstration
  const mockStats = {
    totalDonations: 1247,
    totalAmount: 15420.50,
    currency: 'USD',
    recentDonations: [
      {
        id: '1',
        donorId: 'donor1',
        streamerId: user?.id || '1',
        donationLinkId: 'link1',
        amount: 25.00,
        currency: 'USD',
        message: 'Great stream today!',
        isAnonymous: false,
        status: 'completed' as const,
        paymentMethod: 'bank_transfer' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '2',
        donorId: 'donor2',
        streamerId: user?.id || '1',
        donationLinkId: 'link1',
        amount: 50.00,
        currency: 'USD',
        message: 'Keep up the amazing content!',
        isAnonymous: false,
        status: 'completed' as const,
        paymentMethod: 'bank_transfer' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '3',
        donorId: undefined,
        streamerId: user?.id || '1',
        donationLinkId: 'link1',
        amount: 10.00,
        currency: 'USD',
        message: 'Anonymous donation',
        isAnonymous: true,
        status: 'completed' as const,
        paymentMethod: 'wallet' as const,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
    topDonors: [
      { donorId: 'donor1', donorName: 'John Doe', totalAmount: 250.00, donationCount: 5 },
      { donorId: 'donor2', donorName: 'Jane Smith', totalAmount: 180.00, donationCount: 3 },
      { donorId: 'donor3', donorName: 'Mike Johnson', totalAmount: 120.00, donationCount: 2 },
    ],
    monthlyTrend: [
      { month: 'Jan', amount: 1200, count: 15 },
      { month: 'Feb', amount: 1800, count: 22 },
      { month: 'Mar', amount: 2100, count: 28 },
      { month: 'Apr', amount: 15420, count: 1247 },
    ],
  };

  // Mock advertising banners
  const advertisingBanners = [
    {
      id: 1,
      title: "Boost Your Stream Revenue",
      subtitle: "Get 20% more donations with our premium features",
      cta: "Upgrade Now",
      bgColor: "from-purple-600 to-pink-600",
      icon: "🚀"
    },
    {
      id: 2,
      title: "New Analytics Dashboard",
      subtitle: "Track your performance with advanced insights",
      cta: "Explore",
      bgColor: "from-blue-600 to-cyan-600",
      icon: "📊"
    },
    {
      id: 3,
      title: "Exclusive Partner Program",
      subtitle: "Join our elite creator network",
      cta: "Apply Now",
      bgColor: "from-green-600 to-emerald-600",
      icon: "⭐"
    }
  ];

  // Mock notable events
  const notableEvents = [
    {
      id: 1,
      title: "Charity Stream Success",
      description: "Raised $50K for children's hospital",
      date: "2024-04-15",
      type: "charity",
      icon: "❤️"
    },
    {
      id: 2,
      title: "Platform Milestone",
      description: "Reached 1M total donations",
      date: "2024-04-10",
      type: "milestone",
      icon: "🏆"
    },
    {
      id: 3,
      title: "New Feature Launch",
      description: "QR code donations now available",
      date: "2024-04-05",
      type: "feature",
      icon: "📱"
    },
    {
      id: 4,
      title: "Community Event",
      description: "Annual creator meetup scheduled",
      date: "2024-04-20",
      type: "event",
      icon: "🎉"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Advertising Banner Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="relative h-48 md:h-64 lg:h-80 xl:h-96 2xl:h-[510px] bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-between px-8">
                <div className="text-white">
                  <div className="text-4xl mb-2">{advertisingBanners[currentBannerIndex].icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{advertisingBanners[currentBannerIndex].title}</h2>
                  <p className="text-lg opacity-90 mb-4">{advertisingBanners[currentBannerIndex].subtitle}</p>
                  <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    {advertisingBanners[currentBannerIndex].cta}
                  </button>
                </div>
                <div className="hidden md:block">
                  <div className="text-8xl opacity-20">{advertisingBanners[currentBannerIndex].icon}</div>
                </div>
              </div>
            </div>
            {/* Banner Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {advertisingBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Donation Overview Section */}
        <div className="mb-8">
          <DonationOverview
            totalDonations={mockStats.totalDonations}
            totalAmount={mockStats.totalAmount}
            currency={mockStats.currency}
            recentDonations={mockStats.recentDonations}
            topDonors={mockStats.topDonors}
            monthlyTrend={mockStats.monthlyTrend}
            isLoading={isLoadingStats}
          />
        </div>

        {/* Top 10 KOLs Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="mr-3">🏆</span>
                Top 10 Most Followed KOLs
              </h3>
            </div>
            <div className="p-6">
              <div className="relative h-48">
                {/* Carousel Container */}
                <div className="overflow-hidden h-full">
                  <div 
                    className="flex transition-transform duration-1000 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentKolIndex * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(topKOLs.length / 3) }, (_, groupIndex) => {
                      const kolSlice = topKOLs.slice(groupIndex * 3, (groupIndex + 1) * 3);
                      const isLastSlide = groupIndex === Math.ceil(topKOLs.length / 3) - 1;
                      const kolCount = kolSlice.length;
                      
                      return (
                        <div key={groupIndex} className="flex justify-center min-w-full h-full">
                          <div className={`flex ${isLastSlide && kolCount === 1 ? 'justify-center' : 'justify-between'} items-center w-full max-w-4xl px-8`}>
                            {kolSlice.map((kol) => (
                              <div key={kol.id} className="flex flex-col items-center justify-center">
                                <a
                                  href={`/${kol.name.toLowerCase().replace(/\s+/g, '')}`}
                                  className="text-decoration-none primary--text font-weight-bold d-inline-flex flex-column justify-center align-center hover:scale-105 transition-transform duration-200"
                                  title={kol.name}
                                >
                                  <div className="avatar mb-3 relative">
                                    {/* Rank Container */}
                                    <div className={`rank-container absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                                      kol.rank === 1 ? 'bg-yellow-400' :
                                      kol.rank === 2 ? 'bg-gray-400' :
                                      kol.rank === 3 ? 'bg-orange-500' :
                                      'bg-blue-500'
                                    }`}>
                                      <span className={`rank-text text-xs font-bold ${
                                        kol.rank <= 2 ? 'text-black' : 'text-white'
                                      }`}>
                                        {kol.rank}
                                      </span>
                                    </div>
                                    
                                    {/* Avatar Ring */}
                                    {kol.ring && (
                                      <img 
                                        width="60" 
                                        src={kol.ring} 
                                        alt="" 
                                        className="avatar-ring absolute inset-0 w-full h-full"
                                      />
                                    )}
                                    
                                    {/* Avatar Image */}
                                    <div className="v-avatar primary relative" style={{ height: '60px', minWidth: '60px', width: '60px' }}>
                                      <div className="v-image v-responsive theme--dark w-full h-full rounded-full overflow-hidden">
                                        <div className="v-responsive__sizer" style={{ paddingBottom: '100%' }}></div>
                                        <div 
                                          className="v-image__image v-image__image--cover w-full h-full rounded-full"
                                          style={{ 
                                            backgroundImage: `url("${kol.avatar}")`,
                                            backgroundPosition: 'center center'
                                          }}
                                        ></div>
                                        <div className="v-responsive__content" style={{ width: '100%' }}></div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <span className="name text-sm font-semibold text-gray-900 mb-1 text-center">{kol.name}</span>
                                  <span className="count text-xs text-gray-600 text-center">{kol.count}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="VueCarousel-navigation absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between pointer-events-none">
                  <button
                    type="button"
                    aria-label="Previous page"
                    tabIndex={0}
                    className="VueCarousel-navigation-button VueCarousel-navigation-prev pointer-events-auto bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    style={{ padding: '8px', marginRight: '-8px' }}
                    onClick={prevKol}
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    type="button"
                    aria-label="Next page"
                    tabIndex={0}
                    className="VueCarousel-navigation-button VueCarousel-navigation-next pointer-events-auto bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    style={{ padding: '8px', marginLeft: '-8px' }}
                    onClick={nextKol}
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center mt-4 space-x-2 absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {Array.from({ length: Math.ceil(topKOLs.length / 3) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentKolIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentKolIndex ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notable Events Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="mr-3">📅</span>
                Notable Events
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notableEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-3xl">{event.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bubble */}
      <div className={`fixed right-6 z-40 transition-all duration-300 ${
        isScrolled ? 'top-24' : 'top-32'
      }`}>
        {/* Quick Actions Toggle Button */}
        <button
          onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
        >
          <span className="text-2xl">⚡</span>
        </button>

        {/* Quick Actions Panel */}
        {isQuickActionsOpen && (
          <div className={`absolute right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-80 animate-in slide-in-from-top-2 duration-300 ${
            isScrolled ? 'top-20' : 'top-20'
          }`}>
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick Actions
                </h3>
                <button
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <QuickActions />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 