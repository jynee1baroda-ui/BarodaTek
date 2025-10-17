import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ArenaChatbot from './components/ArenaChatbot';
import HomePage from './pages/HomePage';
import ArenaGames from './pages/ArenaGames';
import ArenaCoding from './pages/ArenaCoding';
import ArenaTutorials from './pages/ArenaTutorials';
import ArenaAppeal from './pages/ArenaAppeal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-arena-black text-arena-text">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<ArenaGames />} />
            <Route path="/coding" element={<ArenaCoding />} />
            <Route path="/tutorials" element={<ArenaTutorials />} />
            <Route path="/appeal" element={<ArenaAppeal />} />
          </Routes>
        </main>
        <Footer />
        <ArenaChatbot isDisabled={false} />
      </div>
    </Router>
  );
}

export default App;
