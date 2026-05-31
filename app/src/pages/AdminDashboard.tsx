import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Activity, ImageIcon, Bug } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  totalUsers: number;
  totalPredictions: number;
  diseaseDistribution: Record<string, number>;
  recentImages: { url: string; pred: string }[];
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    // We can't do collectionGroup across all users unless we defined rules for it. 
    // In our rules, allow list: if isAdmin() for users and subcollections.
    // However, for simplicity and without complex indexes, we'll just try reading users:
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalPreds = 0;
        let dist: Record<string, number> = {};
        let images: { url: string; pred: string }[] = [];

        for (const userDoc of usersSnap.docs) {
          const predQuery = query(collection(db, `users/${userDoc.id}/predictions`), orderBy('createdAt', 'desc'));
          const predSnap = await getDocs(predQuery);
          totalPreds += predSnap.size;
          predSnap.docs.forEach((p, i) => {
            const data = p.data();
            dist[data.prediction] = (dist[data.prediction] || 0) + 1;
            if (images.length < 8 && data.imageUrl) {
               images.push({ url: data.imageUrl, pred: data.prediction });
            }
          });
        }

        setStats({
          totalUsers: usersSnap.size,
          totalPredictions: totalPreds,
          diseaseDistribution: dist,
          recentImages: images
        });
      } catch (err) {
        console.error("Admin fetch error", err);
      }
    };
    fetchStats();
  }, [profile]);

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-display font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of Maize Guard AI platform usage and statistics.</p>
      </div>

      {!stats ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 border-b-2 border-brand-500 animate-spin rounded-full"></div></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                 <Users className="h-4 w-4 text-slate-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{stats.totalUsers}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Predictions Made</CardTitle>
                 <Activity className="h-4 w-4 text-slate-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{stats.totalPredictions}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Images Analyzed</CardTitle>
                 <ImageIcon className="h-4 w-4 text-slate-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{stats.totalPredictions}</div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Total Diseases</CardTitle>
                 <Bug className="h-4 w-4 text-slate-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">{Object.keys(stats.diseaseDistribution).length}</div>
               </CardContent>
             </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Disease Distribution</CardTitle>
                <CardDescription>Breakdown by classification type.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.diseaseDistribution).map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Latest leaf images analyzed.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {stats.recentImages.map((img, i) => (
                    <div key={i} className="aspect-square relative group rounded-md overflow-hidden bg-slate-100">
                      <img src={img.url} className="w-full h-full object-cover" alt="Leaf" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 truncate">
                        {img.pred}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
