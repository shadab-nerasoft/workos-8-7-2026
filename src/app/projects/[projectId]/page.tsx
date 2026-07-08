import ProjectDetailPage from './page-client';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function Page(props: PageProps) {
  return <ProjectDetailPage {...props} />;
}
