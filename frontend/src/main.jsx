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
import Education from "./Education"
import EMGExplainer from "./EMGExplainer"
import OpenSourceEMG from "./OpenSourceEMG"
import RandomForestEMG from "./RandomForestEMG"
import NinaproDB5 from "./NinaproDB5"
import SignalPlayground from "./SignalPlayground"
import ScrollToTop from "./ScrollToTop"
import NewsletterPopup from "./NewsletterPopup"
import ChatWidget from "./ChatWidget"
import Careers from "./Careers"
import Demos from "./Demos"
import Corporations from "./Corporations"
import GestureGame from "./GestureGame"
import FrequencyAnalyzer from "./FrequencyAnalyzer"
import ConfusionExplorer from "./ConfusionExplorer"
import MuscleMemory from "./articles/MuscleMemory"
import PhantomLimb from "./articles/PhantomLimb"
import WhyEMGIsHard from "./articles/WhyEMGIsHard"
import BuildYourOwn from "./articles/BuildYourOwn"
import FutureOfBCI from "./articles/FutureOfBCI"
import EthicsOfEMG from "./articles/EthicsofEMG"
import WindowingExplained from "./articles/WindowingExplained"
import MyoCode from "./MyoCode"
import Educators from "./Educators"
import LessonEMGBasics from "./educators/LessonEMGBasics"
import LessonGestureClassifier from "./educators/LessonGestureClassifier"
import EducatorResources from "./educators/EducatorResources"


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <NewsletterPopup />
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
        <Route path="/education/open-source-emg" element={<OpenSourceEMG />} />
        <Route path="/education/random-forest-emg" element={<RandomForestEMG />} />
        <Route path="/education/ninapro-db5" element={<NinaproDB5 />} />
        <Route path="/playground" element={<SignalPlayground />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/corporations" element={<Corporations />} />
        <Route path="/game" element={<GestureGame />} />
        <Route path="/frequency" element={<FrequencyAnalyzer />} />
        <Route path="/confusion" element={<ConfusionExplorer />} />
        <Route path="/education/muscle-memory" element={<MuscleMemory />} />
        <Route path="/education/phantom-limb" element={<PhantomLimb />} />
        <Route path="/education/why-emg-is-hard" element={<WhyEMGIsHard />} />
        <Route path="/education/build-your-own" element={<BuildYourOwn />} />
        <Route path="/education/future-of-bci" element={<FutureOfBCI />} />
        <Route path="/education/ethics-of-emg" element={<EthicsOfEMG />} />
        <Route path="/education/windowing-explained" element={<WindowingExplained />} />
        <Route path="/myocode" element={<MyoCode />} />
        <Route path="/educators" element={<Educators />} />
        <Route path="/educators/lesson-emg-basics" element={<LessonEMGBasics />} />
        <Route path="/educators/lesson-gesture-classifier" element={<LessonGestureClassifier />} />
        <Route path="/educators/resources" element={<EducatorResources />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)