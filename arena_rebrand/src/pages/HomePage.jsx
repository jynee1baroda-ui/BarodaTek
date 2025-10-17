import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ServiceCards from '../components/ServiceCards';
import Testimonials from '../components/Testimonials';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServiceCards />
      <Testimonials />
    </div>
  );
}
