import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Leaf, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Prediction {
  id: string;
  imageUrl: string;
  prediction: string;
  confidence: number;
  details: string;
  createdAt: number;
}

export default function History() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchHistory() {
      try {
        const q = query(
          collection(db, `users/${user!.uid}/predictions`),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prediction[];
        setPredictions(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/predictions/${id}`));
      setPredictions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting prediction:", error);
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'Healthy': return 'bg-brand-100 text-brand-800';
      case 'Blight': return 'bg-red-100 text-red-800';
      case 'Common Rust': return 'bg-orange-100 text-orange-800';
      case 'Grey Leaf Spot': return 'bg-slate-200 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900">Disease History</h1>
        <Link to="/chatbot">
          <Button className="gap-2">
            <Leaf className="h-4 w-4" />
            New Prediction
          </Button>
        </Link>
      </div>

      {predictions.length === 0 ? (
        <Card className="border-dashed shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-2">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">No predictions yet</h3>
            <p className="text-slate-500 max-w-sm">Upload a photo of a maize leaf in the chatbot to get your first AI analysis.</p>
            <Link to="/chatbot">
              <Button variant="outline" className="mt-4 gap-2">
                Start Chat <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {predictions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-slate-100 relative group">
                  <img src={p.imageUrl} alt="Leaf" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPredictionColor(p.prediction)}`}>
                      {p.prediction}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {Math.round(p.confidence * 100)}% Match
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-1 mb-1">{p.prediction} Analysis</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1 flex-col">
                    {p.details}
                  </p>
                  <p className="text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                    {format(new Date(p.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
