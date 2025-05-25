import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/layouts";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto py-6">
          <AlertBanner message="This is a demo application. No real money transactions are processed." />
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl lg:text-2xl font-bold">
                Hi, {user?.firstName || "User"}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Your account status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{user?.email || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">
                        {user?.phoneNumber || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Member Since
                      </div>
                      <div className="font-medium">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
