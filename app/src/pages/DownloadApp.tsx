import React from 'react';
import { motion } from 'framer-motion';
import { Download, MonitorSmartphone, Share, PlusSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function DownloadApp() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900">Get the App</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Take Maize Guard AI to the field. Works offline, lightning fast, and tailored for your device.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
        >
          <Card className={`relative overflow-hidden h-full ${isAndroid ? 'ring-2 ring-brand-500' : ''}`}>
            {isAndroid && <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Recommended for you</div>}
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MonitorSmartphone className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Android WebView</CardTitle>
              <CardDescription>Lightweight APK for native Android experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
                <Download className="h-5 w-5" />
                Download APK
              </Button>
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-semibold">Installation steps:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Download the APK file using the button above.</li>
                  <li>Open the downloaded file.</li>
                  <li>If prompted, allow installation from unknown sources.</li>
                  <li>Follow on-screen instructions to install.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className={`relative overflow-hidden h-full ${isIOS ? 'ring-2 ring-brand-500' : ''}`}>
            {isIOS && <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Recommended for you</div>}
            <CardHeader>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <MonitorSmartphone className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="text-2xl">iOS & Web App</CardTitle>
              <CardDescription>Install instantly without the App Store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 text-sm text-slate-700 font-medium">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200">1</span>
                  <div className="flex items-center gap-2">
                    Tap the <Share className="h-5 w-5 text-blue-500" /> Share button
                  </div>
                </div>
                <div className="h-6 w-0.5 bg-slate-200 ml-4 my-1"></div>
                <div className="flex items-center gap-4 text-sm text-slate-700 font-medium">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200">2</span>
                  <div className="flex items-center gap-2">
                    Select "Add to Home Screen" <PlusSquare className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 text-center">
                This adds Maize Guard to your home screen with offline capabilities and push notifications support.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
