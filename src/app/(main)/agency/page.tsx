import AgencyDetails from "@/components/forms/AgencyDetails";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function page({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) {
  const authUser = await currentUser();
  const agencyId = await verifyAndAcceptInvitation();
  const userData = await getAuthUserDetails();
  if (agencyId) {
    if (
      userData?.role === "SUBACCOUNT_GUEST" ||
      userData?.role === "SUBACCOUNT_USER"
    ) {
      return redirect("/subaccount");
    } else if (
      userData?.role === "AGENCY_ADMIN" ||
      userData?.role === "AGENCY_OWNER"
    ) {
      if (searchParams.plan) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plan}`,
        );
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];
        if (!stateAgencyId) return <div>Not authorized</div>;
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`,
        );
      } else return redirect(`/agency/${agencyId}`);
    } else {
      return <div>Not authorized</div>;
    }
  }
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="max-w-[850px] rounded-xl border p-4">
        <h1 className="p-3 text-4xl"> Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  );
}
