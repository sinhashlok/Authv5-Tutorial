import { Suspense } from "react";
import NewVerificationForm from "@/components/auth/NewVerificationForm";

const page = () => {
  return (
    <Suspense>
      <NewVerificationForm />
    </Suspense>
  );
};

export default page;
