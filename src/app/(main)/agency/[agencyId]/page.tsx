export default function page({ params }: { params: { agencyId: string } }) {
  return <div className="h-screen w-screen ">{params.agencyId}</div>;
}
