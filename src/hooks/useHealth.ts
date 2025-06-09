import { useState } from 'react';

interface HealthStatus {
  api: boolean;
  lastChecked: Date | null;
}

export const useHealth = () => {
  const [status] = useState<HealthStatus>({
    api: true, // Always return healthy
    lastChecked: new Date()
  });

  return { status };
};