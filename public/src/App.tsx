
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <div className="dark">
      <div className="animated-bg"></div>
      <Router>
         <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Index />} />
          {/* Discord callback redirects to root with query params, which should redirect to dashboard */}
          <Route path="/" element={
            <Navigate to="/dashboard" replace />
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          }
        }}
      />
    </div>
  );
}

export default App;
