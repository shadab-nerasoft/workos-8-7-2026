import EmployeeDetailPage from './page-client';

interface PageProps {
  params: Promise<{ employeeId: string }>;
}

export default function Page(props: PageProps) {
  return <EmployeeDetailPage {...props} />;
}
