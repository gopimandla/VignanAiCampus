import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { VenueExplorer } from './components/VenueExplorer';
import { AIPlannerPreview } from './components/AIPlannerPreview';
import { MasterDataConsole } from './components/MasterDataConsole';
import { StudentCampusEvents } from './components/StudentCampusEvents';
import { CampusAvailabilityView } from './components/CampusAvailabilityView';
import { AuthModal } from './components/AuthModal';
import { DashboardShell } from './components/DashboardShell';
import { RobotEventManager } from './components/RobotEventManager';
import {
  User,
  Venue,
  ResourceItem,
  HealthResponse
} from './types';
import {
  checkBackendHealth,
  fetchSeedVenues,
  fetchSeedResources,
  getCurrentUser,
  clearAuthToken
} from './services/api';

const DEFAULT_VENUES: Venue[] = [
  { id: 'sangamam-sh', name: 'Sangamam Seminar Hall', category: 'Seminar Hall', block: 'Central Academic Block', capacity: 300, ac: true, av_equipped: true, suitable_for: ['Guest Lectures', 'Workshops'], status: 'available', description: 'Equipped with stage audio, projection system, and tiered acoustic seating.' },
  { id: 'spoorthy-sh', name: 'Spoorthy Seminar Hall', category: 'Seminar Hall', block: 'Central Academic Block', capacity: 300, ac: true, av_equipped: true, suitable_for: ['Technical Sessions', 'Conferences'], status: 'available', description: 'High-clarity projection, sound system, and theater seating.' },
  { id: 'srujana-sh', name: 'Srujana Seminar Hall', category: 'Seminar Hall', block: 'Academic Block', capacity: 400, ac: true, av_equipped: true, suitable_for: ['Hackathons Keynotes', 'Conclaves'], status: 'available', description: 'Mid-large seminar hall ideal for intra-college technical events.' },
  { id: 'sa-re-ga-ma-sh', name: 'Sa Re Ga Ma Seminar Hall', category: 'Seminar Hall', block: 'Cultural & Academic Zone', capacity: 500, ac: true, av_equipped: true, suitable_for: ['Musical Performances', 'Cultural Reviews'], status: 'available', description: 'Premium acoustics and stage lighting suitable for artistic & technical symposiums.' },
  { id: 'sangamithra-sh', name: 'Sangamithra Seminar Hall', category: 'Seminar Hall', block: 'Academic Zone', capacity: 500, ac: true, av_equipped: true, suitable_for: ['National Conferences', 'Hackathons'], status: 'available', description: 'Spacious 500-seater hall with multi-display setup and dual mic podiums.' },
  { id: 'h-block-oat', name: 'H Block Open Air Theatre (OAT)', category: 'Open Air Theatre', block: 'H Block', capacity: 500, ac: false, av_equipped: true, suitable_for: ['Beat The Street', 'Club Activities'], status: 'available', description: 'Open-air amphitheater with tiered stepped seating.' },
  { id: 'a-block-oat', name: 'A Block Open Air Theatre (OAT)', category: 'Open Air Theatre', block: 'A Block', capacity: 1000, ac: false, av_equipped: true, suitable_for: ['University Cultural Meets', 'Fest Inaugurations'], status: 'available', description: 'Large capacity amphitheatre facing the central courtyard.' },
  { id: 'u-block-oat', name: 'U Block Open Air Theatre (OAT)', category: 'Open Air Theatre', block: 'U Block', capacity: 700, ac: false, av_equipped: true, suitable_for: ['Student Gatherings', 'Club Festivals'], status: 'available', description: 'Vibrant venue suitable for medium-to-large open air student assemblies.' },
  { id: 'convocation-hall', name: 'Convocation Hall', category: 'Auditorium / Grand Hall', block: 'University Central', capacity: 2000, ac: true, av_equipped: true, suitable_for: ['Convocation', 'Mahotsav', 'Orientations'], status: 'available', description: 'Flagship university auditorium holding ~2000 delegates for mega summits.' },
  { id: 'mhp-zone', name: 'MHP (Most Happening Place)', category: 'Informal / Student Hub', block: 'Student Activity Center', capacity: 350, ac: false, av_equipped: true, suitable_for: ['Informal Events', 'Canteen Activities'], status: 'available', description: 'Central energetic hub for informal student events and cultural activations.' },
];

const DEFAULT_RESOURCES: ResourceItem[] = [
  { id: 'res-projectors', name: 'High-Lumen Projectors', category: 'Audio/Visual', total_quantity: 25, available_quantity: 25, unit: 'units', editable: true },
  { id: 'res-microphones', name: 'Wireless & Collar Microphones', category: 'Audio/Visual', total_quantity: 60, available_quantity: 60, unit: 'sets', editable: true },
  { id: 'res-speakers', name: 'PA Systems & Stage Speakers', category: 'Audio/Visual', total_quantity: 30, available_quantity: 30, unit: 'systems', editable: true },
  { id: 'res-led-screens', name: 'Stage LED Wall Display Panels', category: 'Audio/Visual', total_quantity: 6, available_quantity: 6, unit: 'walls', editable: true },
  { id: 'res-chairs', name: 'Auditorium & Banquet Chairs', category: 'Furniture', total_quantity: 1500, available_quantity: 1500, unit: 'chairs', editable: true },
  { id: 'res-tables', name: 'Registration & Hackathon Tables', category: 'Furniture', total_quantity: 250, available_quantity: 250, unit: 'tables', editable: true },
  { id: 'res-laptops', name: 'Evaluation & Control Laptops', category: 'IT / Tech', total_quantity: 40, available_quantity: 40, unit: 'laptops', editable: true },
  { id: 'res-wifi-support', name: 'Dedicated High-Density Wi-Fi Access Points', category: 'IT / Tech', total_quantity: 50, available_quantity: 50, unit: 'nodes', editable: true },
  { id: 'res-buses', name: 'University Shuttles / Transport Buses', category: 'Transport', total_quantity: 15, available_quantity: 15, unit: 'vehicles', editable: true },
  { id: 'res-security', name: 'Campus Security Personnel', category: 'Operations', total_quantity: 35, available_quantity: 35, unit: 'guards', editable: true },
  { id: 'res-volunteers', name: 'Student SAC Volunteers', category: 'Human Resources', total_quantity: 120, available_quantity: 120, unit: 'students', editable: true },
];

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeView, setActiveView] = useState<
    'landing' | 'dashboard' | 'venues' | 'planner' | 'master-data' | 'student-events' | 'availability'
  >('landing');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [venues, setVenues] = useState<Venue[]>(DEFAULT_VENUES);
  const [resources, setResources] = useState<ResourceItem[]>(DEFAULT_RESOURCES);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Restore authenticated session on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        clearAuthToken();
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const healthData = await checkBackendHealth();
      setHealth(healthData);

      const fetchedVenues = await fetchSeedVenues();
      if (fetchedVenues.length > 0) setVenues(fetchedVenues);

      const fetchedResources = await fetchSeedResources();
      if (fetchedResources.length > 0) setResources(fetchedResources);
    };

    initializeData();
    const interval = setInterval(initializeData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'STUDENT') {
      setActiveView('student-events');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setActiveView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900 dark:bg-warm-950 dark:text-warm-100 selection:bg-blush-400 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        health={health}
      />

      {/* Main Content View Switcher */}
      <main className="flex-grow">
        {activeView === 'landing' && (
          <>
            <LandingHero
              onOpenAuth={handleOpenAuth}
              onExploreVenues={() => setActiveView('venues')}
              onTryPlanner={() => setActiveView('planner')}
              onNavigateView={(view) => setActiveView(view)}
              health={health}
            />
            <div className="border-t border-warm-200 dark:border-warm-800">
              <AIPlannerPreview
                venues={venues}
                onPlanCreatedAndSaved={() => setActiveView('dashboard')}
              />
            </div>
            <div className="border-t border-warm-200 dark:border-warm-800">
              <VenueExplorer
                venues={venues}
                onSelectVenue={() => setActiveView('planner')}
              />
            </div>
          </>
        )}

        {activeView === 'planner' && (
          <AIPlannerPreview
            venues={venues}
            onPlanCreatedAndSaved={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'student-events' && (
          <StudentCampusEvents
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeView === 'availability' && (
          <CampusAvailabilityView
            onSelectSlotForPlanning={() => {
              setActiveView('planner');
            }}
          />
        )}

        {activeView === 'venues' && (
          <VenueExplorer
            venues={venues}
            onSelectVenue={() => setActiveView('planner')}
          />
        )}

        {activeView === 'master-data' && currentUser?.role === 'SUPER_ADMIN' && (
          <MasterDataConsole />
        )}

        {activeView === 'dashboard' && currentUser && (
          <DashboardShell
            currentUser={currentUser}
            venues={venues}
            resources={resources}
            onLaunchPlanner={() => setActiveView('planner')}
            onViewVenues={() => setActiveView('venues')}
            onViewMasterData={() => setActiveView('master-data')}
            onViewAvailability={() => setActiveView('availability')}
          />
        )}
      </main>

      {/* Cartoon AI Robot Campus Event Manager Widget */}
      <RobotEventManager
        onNavigateView={setActiveView}
        onOpenAuth={handleOpenAuth}
      />

      {/* Footer */}
      <Footer />

      {/* Auth Modal (4 Roles) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
