import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const TabContent = dynamic(() => import('./TabContent'), {
  ssr: false, // Disable SSR for this component since it uses client-side features
  loading: () => null // Prevent flash of loading state since TabContent has its own
});

export function generateStaticParams() {
  const projectIds = ["1", "2", "3", "4", "5"];
  const tabs = ["notes", "events", "photos", "plans", "documents", "accounting"];
  
  return projectIds.flatMap(id => 
    tabs.map(tab => ({
      id,
      tab
    }))
  );
}

export default function ProjectTabPage({ 
  params 
}: { 
  params: { id: string; tab: string } 
}) {
  // Validate that the tab parameter matches one of our valid tabs
  const validTabs = ["notes", "events", "photos", "plans", "documents", "accounting"];
  
  if (!validTabs.includes(params.tab)) {
    redirect(`/artisan/projects/${params.id}`);
  }
  
  return <TabContent id={params.id} tab={params.tab} />;
}