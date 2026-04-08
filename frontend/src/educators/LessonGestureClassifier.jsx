import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"

const META = {
  grade: "Grades 10–12 / Intro university",
  subject: "Computer Science / Data Science",
  duration: "90 minutes",
  prerequisites: ["Basic understanding of coordinates and graphs", "Some exposure to programming concepts (not required)"],
  materials: ["Computer with browser", "myojam.com/demo (confusion matrix)", "myojam.com/playground", "Graph paper or spreadsheet for feature table", "Printed feature comparison worksheet"],
}

const SECTIONS = [
  {
    num:"01", phase:"Hook", time:"8 min", color:"#3B82F6",
    title:"The identification problem",
    body:"Start with this scenario: 'You've been handed a recording device that outputs a stream of numbers — 200 numbers per second. Hidden inside that stream is information about which finger someone is flexing. How would you figure out which number pattern corresponds to which gesture?' Let students discuss for 3 minutes in pairs. The point is to surface the core challenge: raw data is not information. You need to transform it.",
    activity:null,
    teacher:"The goal here is to create cognitive need for feature extraction. Students should feel the problem before you give them the solution. If anyone says 'use AI', probe further: 'what does the AI actually receive as input?'",
  },
  {
    num:"02", phase:"Concept", time:"15 min", color:"#F97316",
    title:"From raw signal to feature vector",
    body:"Introduce feature extraction. A raw EMG window is 200 numbers — a time series. A feature is a summary statistic that captures one aspect of that series. Introduce the four myojam features on the board with formulas: MAV (mean of absolute values — measures energy), RMS (root mean square — measures power), ZC (count of zero crossings — proxies for frequency), WL (sum of absolute differences — measures signal complexity). Together, these four numbers compress 200 samples into a 4-element vector that captures the essential character of the window.",
    activity:"Students compute MAV and ZC by hand on a short example signal written on the board: [-0.2, 0.3, 0.1, -0.4, 0.2, -0.1, 0.3, -0.2]. Check: MAV = 0.225, ZC = 6.",
    teacher:"The key insight to drive home: 200 numbers is hard to compare. 4 numbers is easy to compare. Feature extraction is a form of compression that preserves discriminative information while discarding the rest.",
  },
  {
    num:"03", phase:"Exploration", time:"20 min", color:"#FF2D78",
    title:"Explore the feature space",
    body:"Students load the Signal Playground (myojam.com/playground). They draw three distinct waveforms and record the MAV, RMS, ZC, and WL values for each. Then they draw the same 'intended' gesture three times and record how much the features vary. The question: are your features consistent for the same gesture? If not, what does that mean for a classifier?",
    activity:"Feature table worksheet: rows = gesture attempts, columns = MAV, RMS, ZC, WL, predicted gesture. Students fill in 12 rows (3 attempts × 4 gesture types). Then: plot MAV vs ZC for all attempts. Do the same gestures cluster together?",
    teacher:"This is the key practical insight: features need to be both discriminative (different gestures have different values) and consistent (same gesture always has similar values). Students will find that their hand-drawn signals are NOT consistent — this motivates the need for real EMG data.",
  },
  {
    num:"04", phase:"Core concept", time:"20 min", color:"#8B5CF6",
    title:"Classification and decision boundaries",
    body:"Introduce the classification problem geometrically. In 2D (MAV vs ZC), each gesture is a cluster of points. A classifier draws boundaries between clusters. A new window falls somewhere in this space — whichever region it lands in, that's the predicted gesture. Use the board to draw an example with two gestures and an obvious boundary. Then show what happens when clusters overlap — the classifier must choose, and sometimes it chooses wrong.",
    activity:"Students sketch their own 2D scatter plots from their feature table. Where would they draw the decision boundary? What happens to points near the boundary? This is intuitive training for understanding precision/recall trade-offs.",
    teacher:"Introduce the vocabulary: training data (the points you draw the boundaries from), test data (new points you classify), training accuracy (how often you get the training points right), test accuracy (how often you get new points right). Ask: why might they differ?",
  },
  {
    num:"05", phase:"Investigation", time:"15 min", color:"#10B981",
    title:"The confusion matrix",
    body:"Direct students to the Confusion Matrix Explorer at myojam.com/confusion. They click each cell and read the explanations. Students answer: which two gestures are most commonly confused? Why (anatomically)? Which gesture has the highest recall? Which has the lowest? What does it mean when the off-diagonal values are non-zero?",
    activity:"Worksheet: fill in a blank 6×6 confusion matrix from memory after exploring the tool. Calculate per-gesture recall from the matrix. Calculate overall accuracy as the weighted average of the diagonal.",
    teacher:"The central insight: accuracy alone is an incomplete metric. A system that always predicts 'index flex' would get 1/6 = 16.7% accuracy. The confusion matrix shows which errors are being made and reveals systematic biases that aggregate accuracy hides.",
  },
  {
    num:"06", phase:"Discussion & exit", time:"12 min", color:"#F59E0B",
    title:"Generalisation and the real world",
    body:"Close with this question: the myojam model achieves 84.85% accuracy on people it's never seen before. What factors might cause that to drop in real-world use? Students have 3 minutes to brainstorm, then share. Compile a list on the board: electrode placement, fatigue, age, limb position, sweat. Exit ticket: define overfitting in one sentence and give one strategy to detect it.",
    activity:"Exit ticket: (1) What is cross-subject accuracy and why is it a harder test than within-subject accuracy? (2) If you were designing a gesture classifier for daily use, what one thing would you add to make it more reliable?",
    teacher:"Strong exit tickets here become excellent essay prompts or project starters. Save them. The 'one thing you'd add' responses often independently invent domain adaptation, online learning, or majority voting.",
  },
]

const EXTENSIONS = [
  { title:"Python implementation", desc:"Students implement MAV and ZC computation in Python on real Ninapro data (provided as CSV). Compare their computed features to myojam's output.", tags:["Python","NumPy","Grade 11+"] },
  { title:"Design your own classifier", desc:"Students propose a new gesture set (not the six myojam uses) and reason about which would be easy vs hard to classify from EMG. They justify their reasoning using anatomy.", tags:["Biology","Design","All levels"] },
  { title:"Error analysis", desc:"Given a confusion matrix, students identify the two most confused gesture pairs and propose a signal processing intervention that might reduce that specific error.", tags:["Critical thinking","Grade 12+"] },
]

import Quiz from "./Quiz"

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary purpose of feature extraction in an EMG classification pipeline?",
    options: ["To increase the sample rate of the signal","To compress a 200-sample window into a small number of discriminative statistics","To remove noise from the raw signal","To convert EMG voltage into a classification label directly"],
    correct: 1,
    explanation: "Feature extraction transforms 200 raw samples into a compact vector (e.g. 4 or 64 numbers) that captures the essential character of the signal. This makes the classification problem tractable — it's much easier to draw decision boundaries in a 4D feature space than in a 200D raw signal space."
  },
  {
    question: "In a confusion matrix, what does a cell at row i, column j represent?",
    options: ["The probability that gesture i is harder than gesture j","How often gesture i was the true label when the model predicted gesture j","The feature similarity between gesture i and gesture j","The total number of training samples for gestures i and j"],
    correct: 1,
    explanation: "Each row represents the true gesture label; each column represents the predicted label. A non-zero value at (i,j) where i≠j means the model predicted j when the true gesture was i — a misclassification. The diagonal contains correct classifications."
  },
  {
    question: "A classifier achieves 95% accuracy on training data but 72% on test data. This gap most likely indicates:",
    options: ["The test data was recorded at a different sample rate","The model has overfit to the training data","The feature extraction functions contain a bug","The classifier needs more training epochs"],
    correct: 1,
    explanation: "A large gap between training and test accuracy is the classic signature of overfitting — the model has memorised the training examples rather than learning generalisable patterns. This is especially common in small datasets or with very complex models."
  },
  {
    question: "Why is cross-subject accuracy a more meaningful metric than within-subject accuracy for an assistive technology application?",
    options: ["Cross-subject testing uses more data, so it's statistically more reliable","An assistive device must work for new users the model hasn't seen before","Within-subject accuracy is harder to compute","Cross-subject accuracy is always higher, so it's a better headline number"],
    correct: 1,
    explanation: "An assistive technology product must work for arbitrary new users, not just the people it was trained on. Cross-subject accuracy directly measures this — it tests whether the model generalises beyond its training population. Within-subject accuracy inflates apparent performance because the model has already seen similar data from those individuals."
  },
  {
    question: "Which pair of gestures is most commonly confused in myojam's classifier, and why?",
    options: ["Thumb flex and fist — because both use the entire hand","Index and middle flex — because they share overlapping muscle activation in the flexor digitorum","Ring and thumb — because they are anatomically furthest apart","Pinky flex and rest — because pinky is the weakest finger"],
    correct: 1,
    explanation: "Index and middle finger flexion both heavily activate the flexor digitorum superficialis, which has a continuous muscle belly serving multiple fingers. Their EMG bursts overlap spatially and spectrally, making them the hardest pair for a cross-subject classifier to distinguish."
  },
  {
    question: "A student plots MAV vs ZC for 30 gesture attempts and finds the clusters for 'fist' and 'index flex' barely overlap. What does this tell you about those two gestures?",
    options: ["They will always be classified correctly","Their feature profiles are highly discriminative — the classifier should distinguish them well","They are too similar to classify","The student's electrode was placed incorrectly"],
    correct: 1,
    explanation: "Non-overlapping clusters in feature space mean a simple decision boundary can separate them with high accuracy. The more separated the clusters, the easier the classification problem — and the less sensitive it is to noise and cross-subject variability."
  },
  {
    question: "What does Waveform Length (WL) measure that Mean Absolute Value (MAV) does not?",
    options: ["The total energy in the signal","The number of times the signal crosses zero","The complexity or rapidity of signal variation, not just its average magnitude","The peak amplitude of the signal"],
    correct: 2,
    explanation: "MAV measures average energy — how strong the signal is. WL measures the total path length (sum of absolute differences between consecutive samples) — how rapidly and complexly it varies. Two signals can have identical MAV but very different WL if one is smooth and the other is jagged."
  },
  {
    question: "If you trained a gesture classifier only on data collected with subjects sitting at a desk, which real-world scenario would most likely cause it to fail?",
    options: ["The user types slowly","The user uses the system in a different timezone","The user raises their arm above their head while gesturing","The user's computer screen is larger than average"],
    correct: 2,
    explanation: "Limb position changes the geometry of muscles relative to surface electrodes and activates postural muscles that create cross-talk. A model trained on arm-at-rest data sees a fundamentally different signal when the arm is raised — this is one of the most underappreciated failure modes in EMG classification research."
  },
]

export default function LessonGestureClassifier() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #f0f4ff 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            <span onClick={()=>navigate("/educators")} style={{ fontSize:13, color:"#10B981", cursor:"pointer" }}>For educators</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Lesson plan</span>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
            {[META.grade, META.subject, `⏱ ${META.duration}`].map(tag=>(
              <span key={tag} style={{ fontSize:11, fontWeight:500, color:"#3B82F6", background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:100, padding:"4px 12px" }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:20 }}>
            Teaching a machine<br/><span style={{ color:"#3B82F6" }}>to read gestures.</span>
          </h1>
          <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:580 }}>
            A hands-on introduction to supervised machine learning using real EMG gesture data. Students extract features, explore decision boundaries, and analyse a real confusion matrix from a 84.85%-accurate gesture classifier.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"56px 32px 80px" }}>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:56 }}>
          <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Prerequisites</div>
            {META.prerequisites.map(p=>(
              <div key={p} style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:6, display:"flex", gap:8 }}>
                <span style={{ color:"#3B82F6" }}>→</span>{p}
              </div>
            ))}
          </div>
          <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Materials</div>
            {META.materials.map(m=>(
              <div key={m} style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:6, display:"flex", gap:8 }}>
                <span style={{ color:"#3B82F6" }}>✓</span>{m}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:"rgba(59,130,246,0.04)", border:"1px solid rgba(59,130,246,0.15)", borderLeft:"3px solid #3B82F6", borderRadius:"0 var(--radius) var(--radius) 0", padding:"24px 28px", marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Big ideas</div>
          {["Raw data is not information — feature extraction transforms signals into classifiable vectors","A classifier draws boundaries in feature space; its accuracy depends on cluster separability","Cross-subject accuracy is a more meaningful metric than within-subject accuracy","The confusion matrix reveals systematic errors that aggregate accuracy hides"].map(o=>(
            <div key={o} style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, marginBottom:8, display:"flex", gap:10 }}>
              <span style={{ color:"#3B82F6", fontWeight:600, fontSize:12, marginTop:2 }}>✓</span>{o}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {SECTIONS.map((s,i)=>(
            <div key={s.num} style={{ padding:"40px 0", borderBottom:i<SECTIONS.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:s.color+"18", border:`2px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:s.color, flexShrink:0 }}>{s.num}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:500, color:s.color, background:s.color+"15", borderRadius:100, padding:"2px 8px" }}>{s.phase}</span>
                    <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{s.time}</span>
                  </div>
                  <h3 style={{ fontSize:19, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:12 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:s.activity||s.teacher?16:0 }}>{s.body}</p>
                  {s.activity&&<div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderLeft:"3px solid #3B82F6", borderRadius:"0 8px 8px 0", padding:"14px 18px", marginBottom:s.teacher?12:0 }}><div style={{ fontSize:11, fontWeight:600, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Student activity</div><p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{s.activity}</p></div>}
                  {s.teacher&&<div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderLeft:"3px solid #F59E0B", borderRadius:"0 8px 8px 0", padding:"14px 18px" }}><div style={{ fontSize:11, fontWeight:600, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Teacher notes</div><p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{s.teacher}</p></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Extension projects */}
        <div style={{ marginTop:56 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:20 }}>Extension projects</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {EXTENSIONS.map(ext=>(
              <div key={ext.title} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", padding:"20px 24px", display:"flex", gap:20, alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{ext.title}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, fontWeight:300, margin:0 }}>{ext.desc}</p>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                  {ext.tags.map(t=>(
                    <span key={t} style={{ fontSize:11, color:"var(--text-tertiary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"2px 8px" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Quiz
          title="Gesture Classifier — quick check"
          questions={QUIZ_QUESTIONS}
          accentColor="#3B82F6"
        />

        <div style={{ marginTop:40, display:"flex", justifyContent:"space-between" }}>
          <button onClick={()=>navigate("/educators/lesson-emg-basics")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>
            ← Previous: EMG basics
          </button>
          <button onClick={()=>navigate("/educators/lesson-myocode")} style={{ background:"#3B82F6", color:"#fff", border:"none", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:500, cursor:"pointer" }}>
            Next: myocode →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}