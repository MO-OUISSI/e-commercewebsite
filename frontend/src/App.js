import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collections from './components/Collections';
import Footer from './components/Footer';
import CollectionPage from './pages/CollectionPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import AnnouncementBar from './components/AnnouncementBar';
import './styles/globals.css';

function Home() {
  return (
    <>
      <Hero />
      <Collections />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <AnnouncementBar />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection/:id" element={<CollectionPage />} />
            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/collection/:id/:productId" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
