import React from 'react';
import UploadZone from '../Upload/UploadZone';

interface MainContentProps {
  initialVideo?: string;
  initialReport?: any;
  initialReportUrl?: string;
}

const MainContent: React.FC<MainContentProps> = ({ initialVideo, initialReport, initialReportUrl }) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-full p-8">
        <UploadZone
          initialVideo={initialVideo}
          initialReport={initialReport}
          initialReportUrl={initialReportUrl}
        />
      </div>
    </div>
  );
};

export default MainContent;
