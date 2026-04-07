import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import Landing from "./Landing"
import App from "./App"
import About from "./About"
import HowItWorks from "./HowItWorks"
import Contact from "./Contact"
import Team from "./Team"
import Terms from "./Terms"
import Privacy from "./Privacy"
import Footer from "./Footer"
import ScrollToTop from "./ScrollToTop"
import ChatWidget from "./ChatWidget"
import Education from "./Education"
import EMGExplainer from "./EMGExplainer"


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <ChatWidget /> 
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/team" element={<Team />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/education" element={<Education />} />
        <Route path="/education/emg-explainer" element={<EMGExplainer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)