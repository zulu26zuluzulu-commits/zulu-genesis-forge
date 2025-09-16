import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  CreditCard, 
  Crown, 
  Sparkles,
  Zap,
  Shield,
  Headphones
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Stripe Integration Coming Soon!",
      description: "We're working on adding Stripe payments. Stay tuned for updates!",
    });
    
    setIsLoading(false);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "5 app generations per month",
        "Basic file exports",
        "Community support",
        "Standard templates"
      ],
      current: true,
      cta: "Current Plan"
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For power users and teams",
      features: [
        "Unlimited app generations",
        "Advanced file exports",
        "Priority support",
        "Premium templates",
        "Custom branding",
        "API access"
      ],
      popular: true,
      cta: "Upgrade to Pro"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment"
      ],
      cta: "Contact Sales"
    }
  ];

  const usageStats = [
    { label: "Apps Generated", current: 3, limit: 5, unit: "apps" },
    { label: "File Exports", current: 12, limit: 25, unit: "exports" },
    { label: "API Calls", current: 0, limit: 0, unit: "calls", disabled: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
            Billing & Plans
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your AI app generation needs. Upgrade anytime to unlock more features.
          </p>
        </div>

        {/* Current Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Current Usage
            </CardTitle>
            <CardDescription>
              Your usage for the current billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usageStats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.label}</span>
                    {stat.disabled && (
                      <Badge variant="outline" className="text-xs">Pro Feature</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{stat.current} {stat.unit}</span>
                      {!stat.disabled && <span>{stat.limit} {stat.unit}</span>}
                    </div>
                    {!stat.disabled && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${(stat.current / stat.limit) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={plan.current || isLoading}
                  onClick={handleUpgrade}
                >
                  {isLoading && plan.name === "Pro" ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Why Upgrade?
            </CardTitle>
            <CardDescription>
              Unlock the full potential of Zulu AI with our premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Unlimited Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate as many apps as you need without monthly limits
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Priority Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Skip the queue with faster app generation times
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Premium Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Access exclusive templates and advanced customization
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Premium Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get priority support from our expert team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;