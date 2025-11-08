import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VenueProfileForm } from "./onboarding/VenueProfileForm";
import { InsuranceUpload } from "./onboarding/InsuranceUpload";
import { StripeConnectSetup } from "./onboarding/StripeConnectSetup";
import { RulesAvailability } from "./onboarding/RulesAvailability";
import { AgreementESign } from "./onboarding/AgreementESign";

const steps = [
  { id: "profile", title: "Venue Profile", description: "Basic venue information" },
  { id: "insurance", title: "Insurance", description: "Upload insurance documents" },
  { id: "payments", title: "Payment Setup", description: "Connect Stripe for payments" },
  { id: "rules", title: "Rules & Availability", description: "Set booking rules and availability" },
  { id: "agreement", title: "Agreement", description: "Sign partnership agreement" }
];

export default function VenueOnboarding() {
  const { step } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [venueData, setVenueData] = useState<any>({});

  useEffect(() => {
    if (step) {
      const stepIndex = steps.findIndex(s => s.id === step);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    }
  }, [step]);

  const handleNext = () => {
    const currentStepId = steps[currentStep].id;
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps(prev => [...prev, currentStepId]);
    }

    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      navigate(`/venues/onboarding/${nextStep.id}`);
    } else {
      // Completed all steps
      navigate('/venue-dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = steps[currentStep - 1];
      navigate(`/venues/onboarding/${prevStep.id}`);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    const stepId = steps[stepIndex].id;
    navigate(`/venues/onboarding/${stepId}`);
  };

  const updateVenueData = (data: any) => {
    setVenueData(prev => ({ ...prev, ...data }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (steps[currentStep]?.id) {
      case "profile":
        return (
          <VenueProfileForm 
            data={venueData} 
            onUpdate={updateVenueData}
            onNext={handleNext}
          />
        );
      case "insurance":
        return (
          <InsuranceUpload 
            data={venueData} 
            onUpdate={updateVenueData}
            onNext={handleNext}
          />
        );
      case "payments":
        return (
          <StripeConnectSetup 
            data={venueData} 
            onUpdate={updateVenueData}
            onNext={handleNext}
          />
        );
      case "rules":
        return (
          <RulesAvailability 
            data={venueData} 
            onUpdate={updateVenueData}
            onNext={handleNext}
          />
        );
      case "agreement":
        return (
          <AgreementESign 
            data={venueData} 
            onUpdate={updateVenueData}
            onNext={handleNext}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <AppLayout>
      <ProtectedRoute>
        <main className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Venue Onboarding</h1>
            <p className="text-muted-foreground">
              Complete these steps to list your venue on our platform
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((stepItem, index) => {
                const isCompleted = completedSteps.includes(stepItem.id);
                const isCurrent = index === currentStep;
                const isAccessible = index <= currentStep || isCompleted;

                return (
                  <button
                    key={stepItem.id}
                    onClick={() => isAccessible && handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary"
                        : isCompleted
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : isAccessible
                        ? "hover:bg-muted"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle 
                        className={`h-6 w-6 ${
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        }`} 
                      />
                    )}
                    <div className="text-center">
                      <div className="font-medium text-sm">{stepItem.title}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {stepItem.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep]?.title}</CardTitle>
              <p className="text-muted-foreground">
                {steps[currentStep]?.description}
              </p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/venue-dashboard')}>
                Save & Exit
              </Button>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    </AppLayout>
  );
}