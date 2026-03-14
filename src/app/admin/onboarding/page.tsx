"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building,
  UserRound,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/stat-card";
import { orgOnboardingRequests, subscriptionPlans } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  "under-review": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const kycColors: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const steps = [
  { id: 1, title: "Organization", icon: Building, description: "Basic details" },
  { id: 2, title: "Owner", icon: UserRound, description: "Admin account" },
  { id: 3, title: "Plan", icon: CreditCard, description: "Subscription" },
  { id: 4, title: "First Clinic", icon: Building2, description: "Primary branch" },
  { id: 5, title: "Review", icon: CheckCircle2, description: "Confirm & submit" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tab, setTab] = useState("enroll");

  const underReview = orgOnboardingRequests.filter((r) => r.status === "under-review").length;
  const approved = orgOnboardingRequests.filter((r) => r.status === "approved").length;

  function nextStep() {
    setCurrentStep((s) => Math.min(s + 1, 5));
  }

  function prevStep() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-header">Organization Onboarding</h1>
        <p className="text-muted-foreground">Enroll new organizations and review pending applications</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Under Review" value={underReview} icon={Clock} color="amber" />
        <StatCard title="Approved" value={approved} icon={CheckCircle2} color="emerald" />
        <StatCard title="Total Applications" value={orgOnboardingRequests.length} icon={FileText} color="primary" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="enroll" className="cursor-pointer">
            <Building className="h-3.5 w-3.5 mr-1.5" />
            Enroll New
          </TabsTrigger>
          <TabsTrigger value="applications" className="cursor-pointer">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Applications ({orgOnboardingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Wizard */}
        <TabsContent value="enroll" className="mt-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6 px-2">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </button>
                    <span className={`text-[10px] mt-1.5 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-8 sm:w-16 lg:w-24 mx-1 ${step.id < currentStep ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <Card className="animate-fade-in">
            <CardContent className="p-6">
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Organization Details</h3>
                    <p className="text-sm text-muted-foreground">Enter the organization&apos;s basic information</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>Organization Name *</Label>
                      <Input placeholder="e.g. HealthFirst Medical Group" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Registration Number / GSTIN</Label>
                      <Input placeholder="e.g. 27AABCS1234A1Z5" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Organization Type</Label>
                      <Select>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="clinic-chain">Clinic Chain</SelectItem>
                          <SelectItem value="solo-practice">Solo Practice</SelectItem>
                          <SelectItem value="diagnostic-center">Diagnostic Center</SelectItem>
                          <SelectItem value="specialty-clinic">Specialty Clinic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>Address *</Label>
                      <Input placeholder="Full registered address" />
                    </div>
                    <div className="grid gap-2">
                      <Label>City *</Label>
                      <Input placeholder="City" />
                    </div>
                    <div className="grid gap-2">
                      <Label>State</Label>
                      <Input placeholder="State" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Owner / Admin */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Organization Admin</h3>
                    <p className="text-sm text-muted-foreground">Details for the primary administrator account</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Full Name *</Label>
                      <Input placeholder="e.g. Dr. Rajesh Kumar" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Designation</Label>
                      <Input placeholder="e.g. Chief Medical Officer" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="admin@organization.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone *</Label>
                      <Input placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Medical License Number</Label>
                      <Input placeholder="If applicable" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Specialty</Label>
                      <Select>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Medicine</SelectItem>
                          <SelectItem value="dental">Dentistry</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Choose Subscription Plan</h3>
                    <p className="text-sm text-muted-foreground">Select the plan that fits the organization&apos;s needs</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {subscriptionPlans.map((plan) => (
                      <Card
                        key={plan.name}
                        className={`card-hover cursor-pointer relative overflow-hidden ${
                          plan.name === "Professional" ? "border-primary ring-1 ring-primary/20" : ""
                        }`}
                      >
                        {plan.name === "Professional" && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            Popular
                          </div>
                        )}
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          <div className="flex items-baseline gap-1 mt-1 mb-4">
                            <span className="text-3xl font-bold">₹{plan.price.toLocaleString("en-IN")}</span>
                            <span className="text-sm text-muted-foreground">/month</span>
                          </div>
                          <Separator className="mb-3" />
                          <ul className="space-y-2">
                            {plan.features.map((feature) => (
                              <li key={feature} className="text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: First Clinic */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Primary Clinic Branch</h3>
                    <p className="text-sm text-muted-foreground">Set up the first clinic location for this organization</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>Clinic Name *</Label>
                      <Input placeholder="e.g. HealthFirst Main Branch" />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>Clinic Address *</Label>
                      <Input placeholder="Full clinic address" />
                    </div>
                    <div className="grid gap-2">
                      <Label>City *</Label>
                      <Input placeholder="City" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone</Label>
                      <Input placeholder="+91..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>Operating Hours</Label>
                      <Input placeholder="e.g. 9AM - 8PM" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Initial Doctors</Label>
                      <Input type="number" placeholder="Number of doctors" />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Any additional setup notes..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Review & Submit</h3>
                    <p className="text-sm text-muted-foreground">Confirm all details before enrolling the organization</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Ready to Enroll</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">
                          All sections completed. Review the details in previous steps if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Organization</p>
                      <p className="text-sm font-medium">Complete Step 1 to see preview</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Admin</p>
                      <p className="text-sm font-medium">Complete Step 2 to see preview</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                      <p className="text-sm font-medium">Complete Step 3 to see preview</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Primary Clinic</p>
                      <p className="text-sm font-medium">Complete Step 4 to see preview</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Previous
                </Button>
                {currentStep < 5 ? (
                  <Button className="cursor-pointer" onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button className="cursor-pointer bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Enroll Organization
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 section-header">
                <FileText className="h-4 w-4 text-primary" />
                Enrollment Applications
              </CardTitle>
              <CardDescription>Review and approve pending organization enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-enhanced">
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-center">Clinics</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgOnboardingRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{req.orgName}</p>
                            <p className="text-xs text-muted-foreground">{req.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{req.owner}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{req.plan}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{req.clinicsCount}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{req.city}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{req.submittedDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${kycColors[req.kycStatus]}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {req.kycStatus.charAt(0).toUpperCase() + req.kycStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[req.status]}>
                          {req.status === "under-review" ? "Under Review" : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.status === "under-review" && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {req.status === "approved" && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <Check className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {req.status === "rejected" && (
                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
