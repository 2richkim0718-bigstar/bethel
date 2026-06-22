import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100" style={{minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <Card className="max-w-lg mx-4 border-0 bg-white/80 backdrop-blur-sm" style={{width: "100%", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}}>
        <CardContent className="pt-8 pb-8" style={{textAlign: "center"}}>
          <div style={{display: "flex", justifyContent: "center", marginBottom: "1.5rem"}}>
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 animate-pulse" style={{borderRadius: "9999px"}} />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 style={{fontSize: "2.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem"}}>404</h1>

          <h2 className="text-slate-700" style={{fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem"}}>
            Page Not Found
          </h2>

          <p className="mb-8 leading-relaxed" style={{color: "#475569"}}>
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="sm:flex-row" style={{display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "center"}}
          >
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 duration-200 hover:shadow-lg" style={{paddingLeft: "1.5rem", paddingRight: "1.5rem", borderRadius: "0.5rem", transition: "all 0.2s ease", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}}
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
