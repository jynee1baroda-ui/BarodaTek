import Hero from '../components/Hero';
import ArenaStats from '../components/ArenaStats';
import ServiceCards from '../components/ServiceCards';
import Testimonials from '../components/Testimonials';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ArenaStats />
      <ServiceCards />
      <Testimonials />
    </div>
  );
}
