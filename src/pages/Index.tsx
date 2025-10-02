import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Shield, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import medicalHero from "@/assets/medical-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen medical-pattern">
      {/* Hero Section */}
      <section className="relative medical-gradient-hero overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-6 py-3 glass rounded-full mb-6 medical-transition">
                <span className="text-primary font-semibold text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                  AI-Powered Healthcare
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text">
                  TB Detection
                </span>
                <br />
                <span className="text-foreground">with Explainable AI</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Revolutionary early detection of Tuberculosis using state-of-the-art AI-powered chest X-ray analysis with medical-grade explanations.
              </p>
              <div className="pt-6">
                <Button
                  size="xl"
                  onClick={() => navigate("/prediction")}
                  className="group medical-gradient medical-shadow-lg medical-transition hover:medical-shadow-hover hover:scale-105"
                >
                  <span className="flex items-center gap-3">
                    Start Analysis
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden medical-shadow-lg medical-transition hover:medical-shadow-hover">
                <img
                  src={medicalHero}
                  alt="Medical AI technology"
                  className="w-full h-auto medical-transition hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 glass rounded-full p-3 medical-glow">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 md:py-32 bg-background relative">
        <div className="absolute inset-0 medical-pattern opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <Card className="medical-card p-10 md:p-16 medical-shadow-lg border-t-4 border-t-primary">
              <h2 className="text-4xl font-bold mb-8 text-center gradient-text">
                Advanced AI for Healthcare
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Our model is trained on a comprehensive chest X-ray dataset available at{" "}
                <a 
                  href="https://drive.google.com/drive/folders/1Z7LVK9Aar3kxPP3QJlUXoxnaFwRg1CxQ?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline"
                >
                  our cleaned dataset
                </a>
                . The system not only predicts whether a scan indicates Normal or Tuberculosis 
                but also provides an explainable heatmap to highlight suspicious regions.
              </p>
              <div className="glass rounded-2xl p-6 mb-8 border-l-4 border-l-primary medical-transition">
                <p className="text-sm text-foreground">
                  <strong className="text-primary">Important Note:</strong> Our model performs optimally on the specific dataset it was trained on. 
                  For real-world deployment, comprehensive training on diverse X-ray images from various 
                  equipment, demographics, and clinical settings would be essential for robust performance.
                </p>
              </div>
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
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 medical-gradient-hero opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Why Choose Our AI Solution?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets medical expertise for unparalleled TB detection
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="medical-card p-8 group">
              <div className="h-16 w-16 rounded-2xl medical-gradient flex items-center justify-center mb-6 medical-glow">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                Accurate Detection
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Trained on 6,000+ chest X-rays with medical-grade accuracy in
                identifying tuberculosis patterns and early-stage indicators.
              </p>
            </Card>

            <Card className="medical-card p-8 group">
              <div className="h-16 w-16 rounded-2xl medical-gradient flex items-center justify-center mb-6 medical-glow">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                Explainable AI
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Visual heatmaps and medical explanations provide complete
                transparency in AI decision-making for clinical confidence.
              </p>
            </Card>

            <Card className="medical-card p-8 group">
              <div className="h-16 w-16 rounded-2xl medical-gradient flex items-center justify-center mb-6 medical-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">
                Healthcare Support
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Designed to assist medical professionals in early TB detection,
                diagnosis validation, and patient care optimization.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 medical-gradient"></div>
        <div className="absolute inset-0 medical-pattern opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to Analyze Your X-Ray?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto">
              Get instant AI-powered analysis with medical-grade explainable results
            </p>
            <Button
              size="xl"
              onClick={() => navigate("/prediction")}
              className="bg-white text-primary hover:bg-white/90 medical-shadow-lg medical-transition hover:scale-105 px-12 py-6 text-lg font-semibold"
            >
              <span className="flex items-center gap-3">
                Start Analysis Now
                <ArrowRight className="h-6 w-6" />
              </span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
