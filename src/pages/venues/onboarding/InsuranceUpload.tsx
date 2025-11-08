import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, X, CheckCircle } from "lucide-react";

interface InsuranceUploadProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface InsuranceDocument {
  id: string;
  name: string;
  file: File | null;
  url?: string;
  uploaded: boolean;
}

export function InsuranceUpload({ data, onUpdate, onNext }: InsuranceUploadProps) {
  const [formData, setFormData] = useState({
    insuranceProvider: data.insuranceProvider || "",
    policyNumber: data.policyNumber || "",
    coverageAmount: data.coverageAmount || "",
    expirationDate: data.expirationDate || "",
    additionalNotes: data.additionalNotes || "",
    documents: data.documents || [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const requiredDocuments = [
    { id: "general_liability", name: "General Liability Insurance", required: true },
    { id: "property_insurance", name: "Property Insurance", required: true },
    { id: "liquor_liability", name: "Liquor Liability (if applicable)", required: false },
    { id: "workers_comp", name: "Workers' Compensation", required: false },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (documentId: string, file: File) => {
    setUploadingFiles(prev => new Set(prev).add(documentId));

    try {
      // In a real app, you'd upload to Supabase Storage here
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const documentUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map((doc: InsuranceDocument) => 
          doc.id === documentId 
            ? { ...doc, file, url: documentUrl, uploaded: true }
            : doc
        )
      }));

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const removeDocument = (documentId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc: InsuranceDocument) => 
        doc.id === documentId 
          ? { ...doc, file: null, url: undefined, uploaded: false }
          : doc
      )
    }));
  };

  const initializeDocuments = () => {
    if (formData.documents.length === 0) {
      const initialDocs = requiredDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        file: null,
        uploaded: false,
      }));
      setFormData(prev => ({ ...prev, documents: initialDocs }));
    }
  };

  // Initialize documents on component mount
  useEffect(() => {
    initializeDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.insuranceProvider || !formData.policyNumber) {
        toast({
          title: "Missing Required Information",
          description: "Please fill in all required insurance information.",
          variant: "destructive",
        });
        return;
      }

      // Check required documents
      const requiredDocs = requiredDocuments.filter(doc => doc.required);
      const uploadedRequiredDocs = formData.documents.filter((doc: InsuranceDocument) => 
        requiredDocs.some(req => req.id === doc.id) && doc.uploaded
      );

      if (uploadedRequiredDocs.length < requiredDocs.length) {
        toast({
          title: "Missing Required Documents",
          description: "Please upload all required insurance documents.",
          variant: "destructive",
        });
        return;
      }

      // Update parent component data
      onUpdate(formData);
      
      toast({
        title: "Insurance Information Saved",
        description: "Your insurance information has been saved successfully.",
      });

      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error saving insurance info:", error);
      toast({
        title: "Error",
        description: "Failed to save insurance information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Insurance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
              <Input
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                placeholder="e.g., State Farm, Allstate"
                required
              />
            </div>
            <div>
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                value={formData.policyNumber}
                onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                placeholder="Policy number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coverageAmount">Coverage Amount</Label>
              <Input
                id="coverageAmount"
                value={formData.coverageAmount}
                onChange={(e) => handleInputChange("coverageAmount", e.target.value)}
                placeholder="e.g., $1,000,000"
              />
            </div>
            <div>
              <Label htmlFor="expirationDate">Policy Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange("expirationDate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              placeholder="Any additional insurance information..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Documents</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload clear copies of your insurance certificates and policies
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredDocuments.map((docType) => {
            const document = formData.documents.find((doc: InsuranceDocument) => doc.id === docType.id);
            const isUploading = uploadingFiles.has(docType.id);

            return (
              <div key={docType.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{docType.name}</span>
                    {docType.required && <span className="text-destructive">*</span>}
                  </div>
                  {document?.uploaded && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>

                {document?.uploaded ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        {document.file?.name || "Document uploaded"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(docType.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    {isUploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drop your file here or click to browse
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(docType.id, file);
                            }
                          }}
                          className="hidden"
                          id={`file-${docType.id}`}
                        />
                        <Label
                          htmlFor={`file-${docType.id}`}
                          className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium"
                        >
                          Choose File
                        </Label>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, JPG, JPEG, PNG (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  );
}