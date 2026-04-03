import { Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import SecondHero from './components/SecondHero';
import DemoOne from './components/demo';
import CustomCursor from './components/CustomCursor';
import FeaturedProjects from './components/FeaturedProjects';
import Qualifications from './components/Qualifications';
import Experiences from './components/Experiences';
import Skills from './components/Skills';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AiChat from './components/AiChat';
import AiTerminal from './components/AiTerminal';
import AdminRoutes from './admin/AdminRoutes';

function Portfolio() {
  return (
    <div className="bg-black text-white selection:bg-white selection:text-black [overflow-x:clip]">
      <CustomCursor />
      <HeroSection />
      <SecondHero />
      <FeaturedProjects />
      <DemoOne />
      <Qualifications />
      <Experiences />
      <Skills />
      <Testimonials />
      <AiTerminal />
      <Footer />
      <AiChat />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<Portfolio />} />
    </Routes>
  );
}

export default App;

