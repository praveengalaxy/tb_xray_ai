import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Shield, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import medicalHero from "@/assets/medical-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-background to-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-primary font-semibold text-sm">
                  AI-Powered Healthcare
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TB Detection
                </span>
                <br />
                with Explainable AI
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Early detection of Tuberculosis using AI-powered chest X-ray
                analysis.
              </p>
              <div className="pt-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => navigate("/prediction")}
                  className="group"
                >
                  Check X-Ray
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={medicalHero}
                  alt="Medical AI technology"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 shadow-xl border-t-4 border-t-primary">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Advanced AI for Healthcare
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Our model is trained on comprehensive chest X-ray datasets,
                including the NIAID dataset and a custom collection of 3,000
                TB-positive and 3,000 normal scans. The system not only predicts
                whether a scan indicates Normal or Tuberculosis but also provides
                an explainable heatmap to highlight suspicious regions.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                This transparency enables healthcare professionals to understand
                and validate the AI's reasoning, making it a valuable tool for
                early tuberculosis detection and diagnosis support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our AI Solution?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Accurate Detection
              </h3>
              <p className="text-muted-foreground">
                Trained on 6,000+ chest X-rays with high accuracy in
                identifying tuberculosis patterns.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Explainable AI
              </h3>
              <p className="text-muted-foreground">
                Visual heatmaps highlight areas of concern, providing
                transparency in AI decision-making.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Healthcare Support
              </h3>
              <p className="text-muted-foreground">
                Designed to assist medical professionals in early TB detection
                and diagnosis validation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Analyze Your X-Ray?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get instant AI-powered analysis with explainable results
          </p>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => navigate("/prediction")}
            className="shadow-xl hover:shadow-2xl"
          >
            Start Analysis Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
