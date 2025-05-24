import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAxios } from "@/hooks/use-axios";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { addHours } from "date-fns";

// Form schemas for each step
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .regex(
      /^\+[0-9]{10,15}$/,
      "Invalid phone number format (e.g., +2347000000000)"
    ),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "You must be at least 18 years old"),
});

const securityInfoSchema = z.object({
  bvn: z.string().length(10, "BVN must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
});

const addressInfoSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  zipCode: z.string().min(4, "Zip code is required"),
});

type PersonalInfoInputs = z.infer<typeof personalInfoSchema>;
type SecurityInfoInputs = z.infer<typeof securityInfoSchema>;
type AddressInfoInputs = z.infer<typeof addressInfoSchema>;
type SignupInputs = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bvn: string;
  password: string;
  confirmPassword: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
};

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<SignupInputs>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    bvn: "",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });
  const { loading: isLoading, request } = useAxios();
  const { updateUser } = useAuth();
  const router = useRouter();

  // Form for step 1: Personal Information
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: {
      errors: errorsStep1,
      touchedFields: touchedStep1,
      isSubmitted: isSubmittedStep1,
    },
  } = useForm<PersonalInfoInputs>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
    },
  });

  // Form for step 2: Security Information
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: {
      errors: errorsStep2,
      touchedFields: touchedStep2,
      isSubmitted: isSubmittedStep2,
    },
  } = useForm<SecurityInfoInputs>({
    resolver: zodResolver(securityInfoSchema),
    defaultValues: {
      bvn: formData.bvn,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  // Form for step 3: Address Information
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: {
      errors: errorsStep3,
      touchedFields: touchedStep3,
      isSubmitted: isSubmittedStep3,
    },
  } = useForm<AddressInfoInputs>({
    resolver: zodResolver(addressInfoSchema),
    defaultValues: {
      street: formData.address.street,
      city: formData.address.city,
      state: formData.address.state,
      country: formData.address.country,
      zipCode: formData.address.zipCode,
    },
  });

  const onSubmitStep1 = (data: PersonalInfoInputs) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onSubmitStep2 = (data: SecurityInfoInputs) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setFormData({ ...formData, ...data });
    setStep(3);
  };

  const onSubmitStep3 = async (data: AddressInfoInputs) => {
    try {
      const finalData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        bvn: formData.bvn,
        password: formData.password,
        address: data,
      };

      const response = await request({
        method: "POST",
        url: "/auth/register",
        data: finalData,
      });

      if (response && response.status === 201) {
        toast.success("Account created successfully!", { duration: 1500 });

        Cookies.set("token", response.data.token, {
          expires: addHours(new Date(), 3),
        });

        // Update user context and redirect
        setTimeout(() => {
          updateUser().then(() => {
            router.push("/dashboard");
          });
        }, 1500);
      } else {
        toast.error(
          response?.data?.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || error.response?.data.error);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  const goBack = () => {
    setStep(step - 1);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium">
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">Zen Finance</span>
              </a>
              <h1 className="text-xl font-bold">Join Zen Finance</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>

            <div className="flex w-full justify-center">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    step >= 1 ? "bg-primary text-white" : "bg-gray-200"
                  }`}>
                  1
                </div>
                <div
                  className={`w-8 h-1 ${
                    step >= 2 ? "bg-primary" : "bg-gray-200"
                  }`}></div>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    step >= 2 ? "bg-primary text-white" : "bg-gray-200"
                  }`}>
                  2
                </div>
                <div
                  className={`w-8 h-1 ${
                    step >= 3 ? "bg-primary" : "bg-gray-200"
                  }`}></div>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    step >= 3 ? "bg-primary text-white" : "bg-gray-200"
                  }`}>
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <form onSubmit={handleSubmitStep1(onSubmitStep1)}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-medium">Personal Information</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        {...registerStep1("firstName")}
                        id="firstName"
                        placeholder="John"
                      />
                      {(touchedStep1.firstName || isSubmittedStep1) &&
                        errorsStep1.firstName && (
                          <p className="text-sm text-red-500">
                            {errorsStep1.firstName.message}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        {...registerStep1("lastName")}
                        id="lastName"
                        placeholder="Doe"
                      />
                      {(touchedStep1.lastName || isSubmittedStep1) &&
                        errorsStep1.lastName && (
                          <p className="text-sm text-red-500">
                            {errorsStep1.lastName.message}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      {...registerStep1("email")}
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                    />
                    {(touchedStep1.email || isSubmittedStep1) &&
                      errorsStep1.email && (
                        <p className="text-sm text-red-500">
                          {errorsStep1.email.message}
                        </p>
                      )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      {...registerStep1("phoneNumber")}
                      id="phoneNumber"
                      placeholder="+2347000000000"
                    />
                    {(touchedStep1.phoneNumber || isSubmittedStep1) &&
                      errorsStep1.phoneNumber && (
                        <p className="text-sm text-red-500">
                          {errorsStep1.phoneNumber.message}
                        </p>
                      )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      {...registerStep1("dateOfBirth")}
                      id="dateOfBirth"
                      type="date"
                    />
                    {(touchedStep1.dateOfBirth || isSubmittedStep1) &&
                      errorsStep1.dateOfBirth && (
                        <p className="text-sm text-red-500">
                          {errorsStep1.dateOfBirth.message}
                        </p>
                      )}
                  </div>

                  <Button type="submit" className="w-full mt-2">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Security Information */}
            {step === 2 && (
              <form onSubmit={handleSubmitStep2(onSubmitStep2)}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-medium">Security Information</h2>

                  <div className="grid gap-2">
                    <Label htmlFor="bvn">BVN</Label>
                    <Input
                      {...registerStep2("bvn")}
                      id="bvn"
                      placeholder="1234567890"
                    />
                    {(touchedStep2.bvn || isSubmittedStep2) &&
                      errorsStep2.bvn && (
                        <p className="text-sm text-red-500">
                          {errorsStep2.bvn.message}
                        </p>
                      )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      {...registerStep2("password")}
                      id="password"
                      type="password"
                      placeholder="********"
                    />
                    {(touchedStep2.password || isSubmittedStep2) &&
                      errorsStep2.password && (
                        <p className="text-sm text-red-500">
                          {errorsStep2.password.message}
                        </p>
                      )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      {...registerStep2("confirmPassword")}
                      id="confirmPassword"
                      type="password"
                      placeholder="********"
                    />
                    {(touchedStep2.confirmPassword || isSubmittedStep2) &&
                      errorsStep2.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errorsStep2.confirmPassword.message}
                        </p>
                      )}
                  </div>

                  <div className="flex gap-4 mt-2 flex-col">
                    <Button
                      type="button"
                      onClick={goBack}
                      className="w-full cursor-pointer"
                      variant="outline">
                      Back
                    </Button>
                    <Button type="submit" className="w-full cursor-pointer">
                      Continue
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: Address Information */}
            {step === 3 && (
              <form onSubmit={handleSubmitStep3(onSubmitStep3)}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-medium">Address Information</h2>

                  <div className="grid gap-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      {...registerStep3("street")}
                      id="street"
                      placeholder="123 Main St"
                    />
                    {(touchedStep3.street || isSubmittedStep3) &&
                      errorsStep3.street && (
                        <p className="text-sm text-red-500">
                          {errorsStep3.street.message}
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        {...registerStep3("city")}
                        id="city"
                        placeholder="Ajah"
                      />
                      {(touchedStep3.city || isSubmittedStep3) &&
                        errorsStep3.city && (
                          <p className="text-sm text-red-500">
                            {errorsStep3.city.message}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        {...registerStep3("state")}
                        id="state"
                        placeholder="Lagos"
                      />
                      {(touchedStep3.state || isSubmittedStep3) &&
                        errorsStep3.state && (
                          <p className="text-sm text-red-500">
                            {errorsStep3.state.message}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        {...registerStep3("country")}
                        id="country"
                        placeholder="Nigeria"
                      />
                      {(touchedStep3.country || isSubmittedStep3) &&
                        errorsStep3.country && (
                          <p className="text-sm text-red-500">
                            {errorsStep3.country.message}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        {...registerStep3("zipCode")}
                        id="zipCode"
                        placeholder="123123"
                      />
                      {(touchedStep3.zipCode || isSubmittedStep3) &&
                        errorsStep3.zipCode && (
                          <p className="text-sm text-red-500">
                            {errorsStep3.zipCode.message}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-2 flex-col">
                    <Button
                      type="button"
                      onClick={goBack}
                      className="w-full cursor-pointer"
                      variant="outline">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
