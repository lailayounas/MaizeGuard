import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Leaf, ShieldCheck, Zap, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <div className="px-4 py-6 sm:px-8 max-w-7xl mx-auto w-full">
        <section className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[32px] p-8 sm:p-16 text-white relative overflow-hidden shadow-2xl shadow-brand-200 flex flex-col items-center justify-center text-center">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-10 top-10 w-32 h-32 bg-brand-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-50 text-sm font-medium"
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              Powered by Next-Gen AI
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white leading-tight"
            >
              Protect Your Crops <br className="hidden sm:block" />
              <span className="text-brand-200 opacity-90">With AI Precision.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-brand-50 opacity-90 max-w-2xl"
            >
              Maize Guard AI detects Blight, Common Rust, and Grey Leaf Spot instantly from a single leaf photo. Get expert treatment advice and secure your harvest.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center sm:w-auto mt-8"
            >
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-brand-700 hover:scale-105 transition-transform h-14 px-8 text-base font-bold shadow-xl rounded-2xl">
                  Get Started
                </Button>
              </Link>
              <Link to="/app" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-brand-400/30 bg-brand-800/30 text-white hover:bg-brand-900/40 h-14 px-8 text-base font-bold backdrop-blur-md rounded-2xl gap-2">
                  <Download className="h-5 w-5" />
                  Download App
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Supported Diseases</h2>
            <p className="text-slate-600">Our model has been rigorously trained to identify the most common to devastating maize diseases with high accuracy.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Blight", desc: "Northern Corn Leaf Blight causes large cigar-shaped necrotic lesions.", color: "border-red-200 bg-red-50 text-red-700" },
              { title: "Common Rust", desc: "Identified by small, circular to elongate reddish-brown pustules.", color: "border-orange-200 bg-orange-50 text-orange-700" },
              { title: "Grey Leaf Spot", desc: "Characterized by rectangular, tan to grey lesions restricted by veins.", color: "border-slate-200 bg-slate-100 text-slate-700" },
              { title: "Healthy", desc: "No signs of disease or nutrient deficiency. Healthy vibrant leaves.", color: "border-brand-200 bg-brand-50 text-brand-700" }
            ].map((disease, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${disease.color} flex flex-col space-y-3`}
              >
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {disease.title === "Healthy" ? <ShieldCheck className="h-5 w-5" /> : <Leaf className="h-5 w-5" />}
                </div>
                <h3 className="font-semibold text-lg">{disease.title}</h3>
                <p className="text-sm opacity-90">{disease.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Credit */}
      <footer className="py-8 text-center flex justify-center mt-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer shadow-sm">
          Designed by <span className="font-bold text-brand-600">Laila younas</span>
        </div>
      </footer>
    </div>
  );
}
