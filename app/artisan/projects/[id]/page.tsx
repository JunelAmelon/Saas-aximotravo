import ProjectDetails from './ProjectDetails';

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectDetails id={params.id} />;
}