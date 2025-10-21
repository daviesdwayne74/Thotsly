import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";

export default function IdVerification() {
  const { user } = useAuth();
  const [step, setStep] = useState<"status" | "submit">("status");
  const [idType, setIdType] = useState("passport");
  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [country, setCountry] = useState("US");
  const [idImageUrl, setIdImageUrl] = useState("");
  const [idImageBackUrl, setIdImageBackUrl] = useState("");

  const { data: status } = trpc.verification.getVerificationStatus.useQuery();
  const submitMutation = trpc.verification.submitId.useMutation();

  const handleSubmit = () => {
    if (!idNumber || !fullName || !dateOfBirth || !idImageUrl) {
      alert("Please fill in all required fields");
      return;
    }

    submitMutation.mutate({
      idType: idType as any,
      idNumber,
      fullName,
      dateOfBirth,
      expiryDate,
      country,
      idImageUrl,
      idImageBackUrl,
    });
  };

  if (status) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-black mb-8">ID Verification Status</h1>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="text-2xl font-black capitalize">{status.status}</p>
              </div>

              {status.status === "pending" && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                  <p className="text-sm font-bold">Your ID is under review</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This typically takes 1-2 business days
                  </p>
                </div>
              )}

              {status.status === "verified" && (
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <p className="text-sm font-bold">✓ ID Verified</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Age: {status.age} years old
                  </p>
                </div>
              )}

              {status.status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-sm font-bold">ID Rejected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {status.rejectionReason || "Please resubmit with valid ID"}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  Submitted: {status.submittedAt ? new Date(status.submittedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-8">Government ID Verification</h1>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-sm font-bold">Required for Creator Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                We need to verify your identity and age before you can become a creator
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">ID Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="passport">Passport</option>
                <option value="driver_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Full Name (as on ID)</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Expiry Date (if applicable)</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">ID Number</label>
                <Input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Passport/ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="US"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">ID Photo (Front)</label>
              <Input
                value={idImageUrl}
                onChange={(e) => setIdImageUrl(e.target.value)}
                placeholder="https://example.com/id-front.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a clear photo of the front of your ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">ID Photo (Back - Optional)</label>
              <Input
                value={idImageBackUrl}
                onChange={(e) => setIdImageBackUrl(e.target.value)}
                placeholder="https://example.com/id-back.jpg"
              />
            </div>

            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <p className="text-xs font-bold">Privacy & Security</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your ID information is encrypted and only visible to admins during verification
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !idNumber || !fullName || !dateOfBirth}
              className="w-full font-bold text-lg py-6"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

