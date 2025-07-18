'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ProjectNotes = dynamic(() => import('@/components/notes/ProjectNotes'), {
  loading: () => <LoadingSpinner />
});
const ProjectEvents = dynamic(() => import('@/components/events/ProjectEvents'), {
  loading: () => <LoadingSpinner />
});
const ProjectPhotos = dynamic(() => import('@/components/photos/ProjectPhotos'), {
  loading: () => <LoadingSpinner />
});
const ProjectPlans = dynamic(() => import('@/components/plans/ProjectPlans'), {
  loading: () => <LoadingSpinner />
});
const ProjectDocuments = dynamic(() => import('@/components/documents/ProjectDocuments'), {
  loading: () => <LoadingSpinner />
});
const PaymentRequests = dynamic(() => import('@/components/payment-requests/PaymentRequests'), {
  loading: () => <LoadingSpinner />
});

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );
}

export default function TabContent({ id, tab }: { id: string; tab: string }) {
  const renderTabContent = () => {
    switch (tab) {
      case 'notes':
        return <ProjectNotes />;
      case 'events':
        return <ProjectEvents />;
      case 'photos':
        return <ProjectPhotos />;
      case 'plans':
        return <ProjectPlans />;
      case 'documents':
        return <ProjectDocuments />;
      case 'payment-requests':
        return <PaymentRequests />;
      default:
        return <div>Page non trouvée</div>;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderTabContent()}
    </Suspense>
  );
}