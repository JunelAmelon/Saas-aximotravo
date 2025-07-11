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
  const validTabs = ["notes", "events", "photos", "plans", "documents", "accounting"];
  if (!params.id || !validTabs.includes(params.tab)) {
    redirect('/admin/projects');
    return null;
  }
  return <TabContent id={params.id} tab={params.tab} />;
}