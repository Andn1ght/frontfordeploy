import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import MainContent from '../components/Layout/MainContent';

const Dashboard: React.FC = () => {
  const [initialVideo, setInitialVideo] = useState<string | null>(null);
  const [initialReport, setInitialReport] = useState<any>(null);
  const [initialReportUrl, setInitialReportUrl] = useState<string | null>(null);

  const handleVideoSelect = (videoUrl: string, reportData: any, reportUrl: string) => {
    setInitialVideo(videoUrl);
    setInitialReport(reportData);
    setInitialReportUrl(reportUrl);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onLoginClick={() => {/* логика открытия модалки логина */}} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onVideoSelect={handleVideoSelect} initialVideo={initialVideo || undefined} />
        <MainContent
          initialVideo={initialVideo || undefined}
          initialReport={initialReport}
          initialReportUrl={initialReportUrl || undefined}
        />
      </div>
    </div>
  );
};

export default Dashboard;
