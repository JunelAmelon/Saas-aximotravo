import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const TabContent = dynamic(() => import('./TabContent'), {
  ssr: false,
  loading: () => null
});

export function generateStaticParams() {
  const projectIds = ["1", "2", "3", "4", "5"];
  const tabs = ["notes", "events", "photos", "plans", "documents", "payment-requests"];
  
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
  const validTabs = ["notes", "events", "photos", "plans", "documents", "payment-requests"];
  
  if (!validTabs.includes(params.tab)) {
    redirect(`/courtier/projects/${params.id}`);
  }
  
  return <TabContent id={params.id} tab={params.tab} />;
}