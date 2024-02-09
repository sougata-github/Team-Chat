import InitialModal from "@/components/modals/InitialModal";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";

import { redirect } from "next/navigation";

const Page = async () => {
  const profile = await initialProfile();

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    //redirect to the server where the user belongs to
    return redirect(`/servers/${server.id}`);
  }

  return <InitialModal />;
};

export default Page;
