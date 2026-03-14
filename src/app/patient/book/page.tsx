"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Stethoscope,
  CalendarDays,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { doctorsList, availableSlots } from "@/lib/mock-data";

const steps = [
  { number: 1, label: "Select Doctor" },
  { number: 2, label: "Select Date" },
  { number: 3, label: "Select Time" },
  { number: 4, label: "Confirm" },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "bg-emerald-500";
    case "in-consultation":
      return "bg-amber-500";
    case "off-duty":
      return "bg-muted-foreground/50";
    default:
      return "bg-muted-foreground/50";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "in-consultation":
      return "In Consultation";
    case "off-duty":
      return "Off Duty";
    default:
      return status;
  }
}

export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof doctorsList)[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const availableDates = availableSlots.map((s) => new Date(s.date));

  const slotsForDate = selectedDate
    ? availableSlots.find(
        (s) => s.date === selectedDate.toISOString().split("T")[0]
      )?.slots ?? []
    : [];

  function handleNext() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 4) setSelectedTime(null);
      if (currentStep === 3) setSelectedDate(undefined);
      if (currentStep === 2) setSelectedDoctor(null);
    }
  }

  function handleConfirm() {
    setConfirmed(true);
  }

  function handleReset() {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setConfirmed(false);
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return selectedDoctor !== null;
      case 2:
        return selectedDate !== undefined;
      case 3:
        return selectedTime !== null;
      default:
        return true;
    }
  }

  if (confirmed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight section-header">Book Appointment</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="space-y-4 py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Booking Confirmed</h2>
                <p className="text-muted-foreground mt-1">
                  Your appointment has been scheduled successfully.
                </p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialization</span>
                  <span className="font-medium">{selectedDoctor?.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
              <Button onClick={handleReset} className="w-full cursor-pointer mt-4">
                Book Another Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-5 transition-colors ${
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Select Doctor */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Choose a doctor for your appointment</p>
            <div className="grid gap-4 md:grid-cols-3">
              {doctorsList.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                    selectedDoctor?.id === doctor.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${getStatusColor(doctor.status)}`}
                        />
                        <span className="text-muted-foreground">
                          {getStatusLabel(doctor.status)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {doctor.patients} patients
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{doctor.schedule}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Select a date for your appointment with {selectedDoctor?.name}
            </p>
            <div className="flex justify-center">
              <Card className="w-fit">
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const dateStr = date.toISOString().split("T")[0];
                      return !availableSlots.some((s) => s.date === dateStr);
                    }}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
            </div>
            {selectedDate && (
              <p className="text-center text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Step 3: Select Time */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose a time slot on{" "}
              {selectedDate?.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {slotsForDate.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-2xl">
                {slotsForDate.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTime(slot)}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No slots available for this date.</p>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && (
          <div className="flex justify-center">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your appointment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="font-medium">{selectedDoctor?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{selectedDoctor?.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {selectedDate?.toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <Button onClick={handleConfirm} className="w-full cursor-pointer">
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        {currentStep < 4 && (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
