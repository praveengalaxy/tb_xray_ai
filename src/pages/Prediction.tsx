import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PredictionResult {
  prediction: string;
  confidence: number; // percentage 0-100 for UI display
  heatmapUrl: string;
  explanationDoctor: string;
  explanationPatient: string;
}

const Prediction = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    
    // Prepare form data
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      console.log("🔍 Backend response:", data);
      
      const heatmapUrl = data.heatmap_url ? `${apiBase}${data.heatmap_url}` : previewUrl;
      const confidencePct = typeof data.confidence === "number" && data.confidence <= 1 ? data.confidence * 100 : data.confidence;

      const mapped: PredictionResult = {
        prediction: data.prediction ?? "Unknown",
        confidence: Number(confidencePct ?? 0),
        heatmapUrl,
        explanationDoctor: data.explanation_doctor ?? data.explanation ?? "",
        explanationPatient: data.explanation_patient ?? data.explanation ?? "",
      };
      
      console.log("🔍 Mapped result for UI:", mapped);
      setResult(mapped);
      
      toast({
        title: "Analysis complete",
        description: "X-ray analysis has been completed successfully.",
      });
    } catch (error) {
      console.error("🔍 Prediction error:", error);
      
      // For demo purposes, show placeholder data
      setResult({
        prediction: "Tuberculosis",
        confidence: 94.7,
        heatmapUrl: previewUrl,
        explanationDoctor: "The model has identified suspicious patterns in the upper right lung field, showing characteristics consistent with active tuberculosis infection. Areas of consolidation and cavitation are visible, suggesting possible tubercular lesions.",
        explanationPatient: "The AI has detected some areas in your lung X-ray that may need further medical attention. Please consult with your healthcare provider for a detailed examination and appropriate treatment plan.",
      });
      
      toast({
        title: "Demo Mode",
        description: `Backend connection failed: ${error}. Showing placeholder results.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen medical-pattern">
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="mb-12 text-center">
          <div className="inline-block px-6 py-3 glass rounded-full mb-6 medical-transition">
            <span className="text-primary font-semibold text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
              AI-Powered Analysis
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
            TB Detection Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a chest X-ray image for state-of-the-art AI-powered tuberculosis detection with medical-grade explanations
          </p>
        </div>

        {/* Upload Section */}
        {!previewUrl && (
          <Card className="max-w-3xl mx-auto medical-card medical-shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold gradient-text">Upload X-Ray Image</CardTitle>
              <CardDescription className="text-lg">
                Drag and drop or click to select a chest X-ray image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-primary/50 rounded-2xl p-16 text-center hover:border-primary medical-transition cursor-pointer glass relative overflow-hidden group"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 medical-transition"></div>
                <Upload className="h-16 w-16 mx-auto mb-6 text-primary medical-transition group-hover:scale-110" />
                <p className="text-xl font-semibold mb-3 text-foreground">
                  Drop your X-ray image here
                </p>
                <p className="text-muted-foreground mb-6">
                  or click to browse files
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Section */}
        {previewUrl && !result && (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Ready for Analysis</CardTitle>
              <CardDescription>
                Review the image and click analyze to start
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted">
                <img
                  src={previewUrl}
                  alt="Uploaded X-ray"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Analyzing..." : "Analyze X-Ray"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                  }}
                >
                  Upload Different Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Image */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Original X-Ray</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Original X-ray"
                      className="w-full h-auto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Heatmap */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">AI Heatmap Analysis</CardTitle>
                  <CardDescription>
                    Highlighted regions of interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img
                      src={result.heatmapUrl}
                      alt="Heatmap overlay"
                      className="w-full h-auto"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prediction Details */}
            <Card className="shadow-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Prediction Results
                  <span
                    className={`text-lg px-4 py-1 rounded-full ${
                      result.prediction === "Normal"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {result.prediction}
                  </span>
                </CardTitle>
                <CardDescription>
                  Confidence: {result.confidence.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-primary">
                    Medical Professional View
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.explanationDoctor}
                  </p>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2 text-primary">
                    Patient-Friendly Explanation
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.explanationPatient}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setResult(null);
                }}
              >
                Analyze Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
