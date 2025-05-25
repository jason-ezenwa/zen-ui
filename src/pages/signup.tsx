import { SignupForm } from "@/components/signup-form";
import { AlertBanner } from "@/components/ui/alert-banner";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <AlertBanner message="This is a demo application. Please do not enter any real bank information or sensitive data." />
        <SignupForm />
      </div>
    </div>
  );
}
