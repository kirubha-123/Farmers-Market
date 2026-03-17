import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      <main>
        {/* Section 1 */}
        <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-6 tracking-tight">
            Our Mission
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FarmDirect was founded with a simple goal: to create a fairer,
            more transparent food system that benefits both farmers and consumers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 border-t border-b border-gray-100 py-12">
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">10,000+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Happy Buyers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Regions Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">1M+</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kg Produce Sold</div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-emerald-50/50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-emerald-950 mb-4">Our Values</h2>
            <p className="text-gray-500">The principles that guide everything we do</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-gray-600 text-lg leading-relaxed">
            FarmDirect started in 2023 with a vision to connect farmers directly
            with buyers and eliminate middlemen.
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;