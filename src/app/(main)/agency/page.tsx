import { getAuthUserDetails } from "@/lib/queries";

export default async function page() {
  const user = await getAuthUserDetails();
  return <div>agency</div>;
}
