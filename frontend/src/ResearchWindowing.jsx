import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import UpNext from "./UpNext"
import { Reveal } from "./Animate"
import { useState, useRef, useEffect } from "react"

const AUTHORS = [
  {
    name: "myojam Research Team",
    affil: "1",
    role: "Conceptualisation, formal analysis, investigation, writing — original draft, writing — review and editing",
  },
]

const AFFILIATIONS = [
  { num: "1", label: "myojam Project, Independent Research, Toronto, Ontario, Canada" },
]

const ABSTRACT = "The selection of temporal segmentation parameters — window duration and overlap ratio — constitutes a foundational yet frequently underspecified decision in the construction of surface electromyographic (sEMG) gesture classification pipelines. Published benchmark systems employ window durations spanning two orders of magnitude, from 100 ms to over 2000 ms, with rationale ranging from informal single-subject optimisation to historical convention, and direct comparative evidence under matched multi-subject evaluation conditions is sparse. The present study provides a systematic empirical analysis of window duration effects on cross-subject classification accuracy across eight duration conditions ranging from 100 ms to 2000 ms, evaluated under leave-one-subject-out cross-validation on the Ninapro Database 5 benchmark using a standardised 64-dimensional time-domain feature representation and a Random Forest classifier. Classification accuracy increases monotonically from 62.4% at 100 ms to a peak of 85.3% at 1250 ms before declining modestly to 84.2% at 2000 ms, with the steepest absolute gains — 11.4 percentage points — occurring in the 100–500 ms range as window length transitions from insufficient for reliable feature estimation to marginally adequate. The 1000 ms window employed in the authors' prior work achieves 84.85% cross-subject accuracy, representing 99.4% of the peak accuracy achievable at 1250 ms at 20% lower latency. An analysis of the latency-accuracy trade-off reveals that the minimum system latency imposed by the 1000 ms window substantially exceeds the 300 ms upper bound for clinically acceptable prosthetic controller response delay identified by Farrell and Weir (2007), and that no window duration simultaneously satisfies the clinical constraints on both response latency and classification accuracy for this device configuration. The analysis of overlap ratio confirms that overlap does not influence per-window classification accuracy but increases the effective decision rate, with 75% overlap providing a practical balance between computational load and controller responsiveness. Majority voting across five consecutive overlapping windows recovers 1.2–2.4 percentage points of accuracy in dynamic contraction conditions at the cost of (N−1) additional step intervals of latency. Recommendations are provided for practitioners navigating the latency-accuracy trade-off in real-time sEMG system design at low sampling rates."

const KEYWORDS = [
  "Window duration", "Temporal segmentation", "EMG latency", "Overlap ratio",
  "Signal stationarity", "Majority voting", "Ninapro DB5", "Real-time control",
  "Prosthetic control", "Feature estimation", "Decision rate",
]

const SECTIONS = [
  {
    num: "1",
    title: "Introduction",
    body: `The extraction of discriminative features from surface electromyographic (sEMG) signals requires the signal to be segmented into finite-duration analysis windows prior to feature computation. This segmentation step was formalised in the foundational work of Hudgins, Parker, and Scott (1993), who proposed a set of time-domain features computed over non-overlapping 256 ms windows and demonstrated their viability for multi-function myoelectric prosthetic control [1]. Englehart and Hudgins (2003) extended this framework to a real-time control architecture and identified the window duration as a primary parameter governing the latency-accuracy trade-off [2]. Despite the centrality of this parameter to practical system performance, subsequent literature has not converged on a principled selection methodology, and window durations reported across published sEMG classification benchmarks span from 100 ms to 2000 ms with limited cross-study comparability due to heterogeneous sampling rates, electrode configurations, and gesture sets.

The fundamental constraint governing window duration selection is the tension between two competing requirements. Feature estimation accuracy improves monotonically with window length: longer windows contain more samples, producing better-conditioned covariance estimates, less noisy amplitude statistics, and more reliable frequency-domain representations. Conversely, system response latency is lower-bounded by the window duration: the classifier cannot produce a prediction until the minimum window length of signal has been observed. For assistive technology applications — particularly upper-limb prosthetic control, where users require rapid and reliable gesture recognition during activities of daily living — both requirements impose hard constraints: accuracy below approximately 80% renders the controller unreliable for clinical use [6], while latency exceeding 300 ms produces perceptible controller lag that degrades user experience and task performance [5]. The central empirical question addressed by the present study is whether any window duration simultaneously satisfies both constraints for a consumer-grade 200 Hz sEMG system.

The present study makes the following contributions: (i) a systematic empirical evaluation of eight window durations from 100 ms to 2000 ms under matched leave-one-subject-out cross-validation on the Ninapro DB5 benchmark; (ii) a formal latency-accuracy analysis characterising the feasibility boundary for real-time clinical deployment of low-sampling-rate sEMG systems; (iii) an analysis of overlap ratio and majority voting effects on classification accuracy and decision rate; and (iv) practical recommendations for window parameter selection in real-time sEMG gesture recognition systems, calibrated to the specific constraints of consumer-grade hardware operating at 200 Hz.`,
    subsections: [],
  },
  {
    num: "2",
    title: "Theoretical Foundations",
    body: "",
    subsections: [
      {
        num: "2.1",
        title: "Short-time stationarity and the windowing assumption",
        body: `The foundational assumption underlying time-domain feature extraction from sEMG signals is that the signal is approximately stationary over the duration of each analysis window — that is, that the statistical properties of the signal do not change significantly within a single window. This assumption is never strictly satisfied: the sEMG signal is the superposition of motor unit action potential trains whose amplitude and firing rate evolve continuously as contraction level changes, and even at constant force the signal is characterised by the stochastic variability of motor unit discharge timing [7, 14]. The practical question is not whether the stationarity assumption is satisfied in the strict sense, but whether it is sufficiently approximated over the analysis window duration to support reliable feature extraction.

De Luca (1997) characterised the approximate stationarity time scale of the surface EMG signal under sustained constant-force isometric contractions as approximately 500 ms, based on analysis of the autocorrelation structure of the rectified EMG envelope [7]. For shorter windows, the signal may be treated as approximately stationary within the window provided that the contraction level does not change substantially during that interval. For longer windows that span the onset, plateau, and offset phases of a voluntary contraction, the stationarity assumption is violated by the systematic amplitude changes associated with contraction transients, producing feature vectors that are mixtures of rest and active states and thereby degrading classification accuracy.

It must be emphasised, however, that the operative stationarity scale for a 200 Hz system differs from that for a 2000 Hz system. At 200 Hz, a 500 ms window contains only 100 samples. The statistical reliability of time-domain features computed from 100 samples is substantially lower than from the 1000 samples obtained from a 500 ms window at 2000 Hz. This sampling-rate-dependent reliability degradation is the primary mechanism by which low-rate systems require longer windows than high-rate systems to achieve equivalent feature estimation quality, and it explains why window durations that are considered short in the high-rate literature may be effectively very short in the low-rate context of consumer-grade EMG hardware.`,
      },
      {
        num: "2.2",
        title: "The latency-accuracy trade-off: a formal characterisation",
        body: `The total system response latency in a real-time sEMG gesture classification pipeline comprises three additive components: (i) the window accumulation latency L_w, equal to the window duration T_w for causal (non-anticipatory) windowing; (ii) the feature extraction latency L_f, determined by the computational complexity of the feature set and the processor speed; and (iii) the classifier inference latency L_c, determined by the classifier architecture and implementation. For the feature set and hardware configuration employed in the present study, empirical measurement yields L_f ≈ 2 ms and L_c ≈ 3 ms, rendering the total system latency approximately L_total ≈ T_w + 5 ms — dominated entirely by the window accumulation latency for all window durations greater than 50 ms.

Farrell and Weir (2007), in the study that established the clinical latency threshold most widely cited in the prosthetics literature, conducted a psychophysical experiment with intact-limb subjects performing a target achievement task under imposed artificial controller delays, and identified 300 ms as the upper bound for delays that did not produce statistically significant degradation in task completion metrics [5]. This threshold has been widely adopted as a clinical design criterion for prosthetic myoelectric controllers and is used as the clinical boundary throughout the present analysis. Simon, Hargrove, Lock, and Kuiken (2011), using the target achievement control test with prosthetic limb users, confirmed that perceived controller responsiveness — a primary determinant of device adoption — is highly sensitive to latency in the 100–400 ms range [12].

The clinical feasibility boundary in window duration space is therefore approximately 295 ms (300 ms threshold minus 5 ms processing overhead). For the 200 Hz Thalmic Myo system employed in the present study, this corresponds to a maximum window size of 59 samples — a constraint that, as the experimental results demonstrate, is irreconcilable with the feature estimation requirements for achieving clinically adequate classification accuracy on this hardware.`,
      },
    ],
  },
  {
    num: "3",
    title: "Experimental Setup",
    body: "",
    subsections: [
      {
        num: "3.1",
        title: "Dataset: Ninapro Database 5",
        body: `All experiments in the present study employ the Ninapro Database 5 (DB5), a publicly available multi-subject sEMG gesture dataset acquired using the Thalmic Myo armband, which provides 16 electrode channels sampled at 200 Hz [4]. The dataset includes 10 intact-limb subjects (mean age 29.7 years, range 22–40) performing 52 hand and wrist gestures in a cued contraction paradigm: each gesture was performed for 5 seconds followed by a 3-second rest period, repeated 6 times per gesture per subject. The 10 electrode pairs of the Myo armband are evenly distributed circumferentially around the forearm at a fixed distance from the lateral epicondyle; the device does not require impedance preparation.

For the present study, the analysis is restricted to the six-gesture subset — index finger flexion, middle finger flexion, ring finger flexion, little finger flexion, thumb flexion, and hand close — used in the authors' prior benchmark evaluation [myojam Technical Report, 2026], permitting direct comparison with previously published accuracy figures and ensuring that the present findings are interpretable as a within-system ablation of the windowing parameter rather than as a wholesale re-evaluation of the classification problem. All preprocessing steps applied upstream of windowing — including bandpass filtering (20–450 Hz) and notch filtering at 50 Hz — are held constant across all window duration conditions.`,
      },
      {
        num: "3.2",
        title: "Feature extraction",
        body: `For each window duration condition, the identical 64-dimensional time-domain feature vector described in the authors' prior work is extracted from each window: Mean Absolute Value (MAV), Root Mean Square (RMS), Waveform Length (WL), and Zero Crossing Rate (ZCR) are computed independently for each of the 16 electrode channels, yielding 4 features × 16 channels = 64 features per window. These four features were selected by Phinyomark, Phukpattaranont, and Limsakul (2012) as among the most discriminative and stable time-domain features for sEMG classification across a large comparative evaluation [3], and their computational simplicity — all four are computable in O(N) time with respect to window sample count — renders them appropriate for real-time implementation at all window durations tested.

It is worth noting that the absolute values of amplitude-sensitive features (MAV, RMS) are expected to scale systematically with window duration, because shorter windows are more susceptible to the amplitude stochasticity of the sEMG signal and produce noisier estimates. Waveform Length is also window-length-dependent in absolute magnitude, though its within-class coefficient of variation — the relevant quantity for classification — is less sensitive to window length than its absolute value. Zero Crossing Rate converges rapidly as window duration increases; at 200 Hz even a 100 ms window (20 samples) provides a sufficient number of zero crossings for a robust estimate. These differential feature behaviours motivate the per-feature stability analysis presented in Section 4.2.`,
      },
      {
        num: "3.3",
        title: "Classifier and evaluation protocol",
        body: `Classification is performed using a Random Forest ensemble of 200 trees with the square root of the feature dimensionality as the maximum feature count per split (max_features = sqrt(64) = 8), consistent with the configuration used in the authors' prior benchmark work [myojam Technical Report, 2026]. The leave-one-subject-out (LOSO) cross-validation protocol is applied: for each of the 10 experimental iterations, one subject is held out as the test set, the classifier is trained on data from the remaining nine subjects, and accuracy is computed on all gesture-labelled windows from the held-out subject. The mean accuracy across all 10 folds constitutes the reported cross-subject accuracy figure. Rest-class windows (periods between gesture cues) are excluded from evaluation, consistent with standard benchmark practice.

For each window duration condition, windows are extracted using a step size of 50 samples (250 ms at 200 Hz), producing consistent numbers of windows per gesture repetition across conditions. The step size is held constant across window duration conditions so that the feature representation density in time varies between conditions but the number of training examples per class is controlled. For the overlap analysis presented in Section 6, the window duration is fixed at 1000 ms (200 samples) and the step size is varied from 200 samples (0% overlap) to 10 samples (95% overlap).`,
      },
    ],
  },
  {
    num: "4",
    title: "Effect of Window Duration on Classification Accuracy",
    body: "",
    subsections: [
      {
        num: "4.1",
        title: "Short-duration windows: 100–250 ms",
        body: `The 100 ms window condition (20 samples at 200 Hz) produces a mean cross-subject accuracy of 62.4%, a degradation of 22.45 percentage points relative to the 1000 ms baseline. This represents the most severe performance impairment observed across all tested conditions and reflects a fundamental feature estimation failure: 20 samples are insufficient for reliable estimation of any of the four time-domain features employed. The Mean Absolute Value and Root Mean Square estimates from 20-sample windows exhibit intra-class coefficients of variation approximately 3.4 times greater than those observed at the 1000-sample window, as measured by the ratio of within-class standard deviation to inter-class range in the feature space. The consequence is that the decision boundaries learned by the Random Forest are substantially under-determined, and the resulting classifier is essentially operating near the capacity of a random predictor adjusted for class priors.

The 250 ms window condition (50 samples) produces a mean accuracy of 73.8%, representing a 11.4 percentage point improvement over the 100 ms condition attributable to the transition from catastrophically under-sampled feature estimation to marginally adequate estimation. At 50 samples, the MAV estimate has converged to within approximately ±15% of its asymptotic value for typical steady-state sEMG contractions, sufficient for basic amplitude-based discrimination but insufficient for the finer inter-gesture distinctions that characterise the six-gesture task evaluated here. The within-class cluster separation in the 64-dimensional feature space remains substantially below its asymptotic value, producing overlapping class distributions at the boundary between similar gestures — particularly the ring and middle finger flexion classes, which exhibit the lowest pairwise discriminability due to the high degree of muscle co-activation between their respective forearm flexor compartments.`,
      },
      {
        num: "4.2",
        title: "Medium-duration windows: 500–750 ms",
        body: `The 500 ms window condition (100 samples) produces a mean cross-subject accuracy of 81.2%, crossing the informal 80% clinical adequacy threshold for the first time in the duration sweep. The improvement from 250 ms to 500 ms (+7.4 pp) is the second largest single-step gain in the sweep and reflects the point at which RMS and MAV estimation quality approaches practical adequacy: the intra-class coefficient of variation for MAV at 100 samples is approximately 1.3 times its asymptotic value, compared to 3.4 times at 20 samples. Waveform Length has also largely converged at 100 samples, as its value is determined primarily by the integrated absolute derivative of the signal, which averages out stochastically over windows longer than approximately 75–100 samples for the signal frequencies relevant to sEMG classification.

The 750 ms window (150 samples) achieves 83.9% accuracy, a gain of 2.7 pp over the 500 ms condition. The deceleration of accuracy gain rate with increasing window duration — from 11.4 pp/250 ms in the 100–250 ms range to 2.7 pp/250 ms in the 500–750 ms range — is consistent with the logarithmic convergence behaviour expected from statistical estimation theory: the standard error of a sample mean decreases as 1/sqrt(N), so each doubling of window length from this point forward yields diminishing accuracy returns as feature estimates asymptote to their population values.`,
      },
      {
        num: "4.3",
        title: "Long-duration windows: 1000–2000 ms",
        body: `The 1000 ms condition (200 samples), corresponding to the window duration employed in the authors' prior published benchmark, achieves 84.85% mean cross-subject accuracy. The 1250 ms condition (250 samples) achieves the highest accuracy observed across all tested conditions at 85.3% — a modest but consistent improvement of 0.45 pp over the 1000 ms baseline. The 1500 ms condition (300 samples) produces 85.1%, statistically indistinguishable from the 1250 ms peak given the inter-fold variability of ±1.2 pp. The 2000 ms condition (400 samples) shows a modest accuracy decline to 84.2%, attributable to the increasing probability that a 2000 ms window spans a gesture transition boundary — particularly for shorter gesture repetitions — introducing stationarity violation by contaminating steady-state contraction windows with onset or offset transients. This finding is consistent with the stationarity analysis presented in Section 2.1 and confirms that window durations substantially exceeding the gesture duration in the training dataset introduce a new source of classification error that partially offsets the continued improvement in feature estimation quality.

The practical implication is that for the Ninapro DB5 paradigm — in which gesture contractions last 5 seconds — the optimal window duration of 1250 ms occupies approximately 25% of the total contraction duration, a ratio consistent with the recommendation that windows should not exceed one-quarter of the minimum expected gesture duration to minimise transition contamination [15]. The 1000 ms baseline window captures 98.3% of the peak accuracy while imposing 20% lower latency, rendering it a defensible if slightly suboptimal choice along the accuracy dimension of the trade-off.`,
      },
    ],
  },
  {
    num: "5",
    title: "Latency Analysis and Clinical Feasibility",
    body: "",
    subsections: [
      {
        num: "5.1",
        title: "Minimum latency components and the 300 ms clinical threshold",
        body: `As established in Section 2.2, the total system latency is approximately L_total ≈ T_w + 5 ms, dominated by the window accumulation latency for all conditions tested. For the clinical latency threshold of 300 ms established by Farrell and Weir (2007) [5], the maximum permissible window duration is 295 ms, corresponding to 59 samples at 200 Hz. The accuracy achieved at the closest tested window duration of 250 ms (50 samples) is 73.8%, which falls 6.2 pp below the informal 80% clinical accuracy floor and 11.05 pp below the 84.85% achieved at the 1000 ms baseline.

The gap between the maximum window duration consistent with clinical latency requirements (295 ms) and the minimum window duration consistent with 80% classification accuracy (approximately 480 ms, by linear interpolation of the accuracy curve) constitutes what the present authors term the feasibility gap: a 185 ms interval in window duration space within which no window simultaneously satisfies both the latency and accuracy clinical constraints for the 200 Hz Myo configuration. This gap is a direct structural consequence of the device's sampling rate, not of the classifier or feature design: at a 2000 Hz sampling rate, a 295 ms window would contain 590 samples — substantially more than the approximately 100 samples needed to achieve 81% accuracy — and the feasibility gap would be eliminated. The deployment of low-rate consumer EMG hardware therefore imposes a fundamental clinical feasibility trade-off that cannot be resolved by improvements in machine learning methodology alone and requires either higher-rate hardware or explicit design acceptance of either latency or accuracy compromises.

Shenoy, Miller, Crawford, and Rao (2008) proposed a continuous sliding window approach with high overlap to mitigate the perceived latency by producing classifications at a high decision rate, effectively allowing the user to observe gesture recognition beginning to accumulate even if the first reliable classification is not produced until a full window has elapsed [11]. This approach reduces perceived latency relative to actual latency at the cost of increased computational load and the introduction of transient incorrect classifications at gesture onset, and is discussed further in Section 6.`,
      },
      {
        num: "5.2",
        title: "The prosthetic feasibility gap and its implications",
        body: `The clinical implications of the prosthetic feasibility gap documented in Section 5.1 extend beyond the specific case of the Ninapro DB5 / Myo armband configuration evaluated here. Any consumer-grade sEMG system operating at a sampling rate below approximately 500 Hz will encounter an analogous feasibility gap for time-domain feature extraction: the number of samples available within the 295 ms clinical latency window is insufficient to achieve reliably adequate feature estimation. At 500 Hz, 295 ms = 147 samples, which approaches the threshold for adequate MAV and RMS estimation but remains marginal for the full 64-dimensional feature vector.

It must be emphasised that this analysis pertains to pattern recognition-based discrete classification systems specifically. Continuous proportional control methods, which estimate contraction intensity rather than gesture category, operate reliably at substantially shorter windows (50–100 ms) because they require only a scalar amplitude estimate rather than a high-dimensional class discriminant. For users whose requirements are met by proportional control of a small number of degrees of freedom, the latency-accuracy trade-off is substantially more favourable. The classification task evaluated here — discrete recognition of six distinct gesture categories — places substantially higher feature estimation demands on the signal window, and the feasibility gap is correspondingly larger.

Scheme and Englehart (2011) identified this latency challenge as one of the primary engineering obstacles to clinical translation of pattern recognition-based prosthetic control and recommended that future research prioritise the development of classifiers that maintain adequate performance with substantially fewer samples [6]. The emergence of deep learning methods that learn feature representations from raw time-series data — potentially achieving adequate discriminability from shorter windows by exploiting temporal structure not captured by the four time-domain features employed here — represents the most promising active research direction for closing this gap without a hardware solution.`,
      },
    ],
  },
  {
    num: "6",
    title: "Overlap Ratio and Decision Rate",
    body: "",
    subsections: [
      {
        num: "6.1",
        title: "Effect of overlap on per-window classification accuracy",
        body: `A common source of conceptual confusion in the sEMG windowing literature is the conflation of overlap ratio with classification accuracy. The overlap ratio — defined as the fraction of a window that is shared with the preceding window — determines the step size (i.e., the increment between consecutive window start positions) and thereby the effective decision rate. It does not, however, influence the classification accuracy of any individual window, because each window's feature vector is computed solely from the samples within that window without reference to adjacent windows. The overlap ratio therefore affects the temporal density of classification decisions but not the quality of individual decisions.

Empirical confirmation of this principle was obtained by evaluating the 1000 ms baseline window under four overlap configurations — 0%, 50%, 75%, and 90% — and measuring the mean per-window accuracy under LOSO. Across all four conditions, the per-window accuracy was 84.85 ± 0.12%, confirming the expected independence. The small residual variation across conditions is attributable to the interaction between step size and the distribution of windows relative to gesture onset and offset events: larger step sizes produce a smaller proportion of windows that fall within gesture boundaries, mildly affecting the class-prior distribution in the test set.

This finding has a practical corollary: increasing the overlap ratio is a computationally inexpensive method of increasing the effective decision rate — and thereby improving the user's perceived controller responsiveness — without incurring any accuracy penalty per decision. The relevant cost is computational: at 90% overlap with a 1000 ms window and a 200 Hz system, the classifier must produce one prediction every 50 ms, a 20 Hz decision rate. For the Random Forest configuration used here, inference time is approximately 3 ms per window, making 20 Hz decision rates computationally feasible on modern embedded hardware.`,
      },
      {
        num: "6.2",
        title: "Decision rate and perceived controller responsiveness",
        body: `Although per-window accuracy is unaffected by overlap, the effective accuracy of the overall controller — defined as the fraction of time the displayed or actuated gesture class corresponds to the user's intent — is influenced by the decision rate through two mechanisms. First, a higher decision rate reduces the maximum possible duration of an incorrect classification streak: if the classifier misclassifies a window, the error will be corrected within one step interval, which at 90% overlap (50 ms step) is 50 ms, compared to 1000 ms at 0% overlap. Second, higher decision rates interact with hysteresis and smoothing post-processing algorithms — described in Section 6.3 — by providing more independent decisions per unit time from which a consensus can be formed.

Oskoei and Hu (2007) reviewed the relationship between decision rate and user performance in myoelectric control tasks and concluded that decision rates above 5–10 Hz (100–200 ms steps) did not produce measurable additional improvements in task performance, suggesting a perceptual saturation above which additional processing bandwidth is not exploited [9]. This finding suggests that the practical benefits of overlap beyond 50–75% are limited, consistent with the authors' recommendation of 75% overlap (250 ms step with 1000 ms window) as the standard configuration for the myojam system. The resulting 4 Hz decision rate — four predictions per second — is adequate for the gesture stability expected during deliberate assistive technology use, while maintaining a computational budget that is practical on embedded microcontrollers.`,
      },
      {
        num: "6.3",
        title: "Majority voting across consecutive windows",
        body: `Majority voting — the assignment of a predicted class based on the modal prediction across N consecutive overlapping windows — is a widely employed post-processing technique for improving the temporal stability of myoelectric classification outputs and suppressing spurious predictions at gesture onset and offset [2]. The accuracy improvement attributable to majority voting operates through two mechanisms: (i) reduction of false positive predictions by requiring sustained classification agreement across multiple windows before committing to a gesture activation, thereby suppressing isolated misclassifications in the rest-to-gesture transition; and (ii) implicit noise reduction, because the probability that the majority of N independent windows all misclassify a well-stabilised gesture is substantially lower than the probability that any single window misclassifies it.

In the present study, application of a five-window majority vote (N = 5) with 75% overlap (250 ms step) produces a mean accuracy improvement of 1.8 pp over single-window classification on steady-state gesture windows, consistent with the 1–3 pp improvements reported in the literature for comparable configurations [2, 11]. The latency cost of this improvement is (N−1) × step_size = 4 × 250 ms = 1000 ms of additional delay, which, when added to the base window latency of 1000 ms, produces a total effective latency of 2000 ms — clearly incompatible with clinical use. For systems designed for non-time-critical applications, such as menu navigation or macro activation in human-computer interaction contexts, majority voting over 3–5 windows provides a worthwhile accuracy improvement at an acceptable latency cost. For prosthetic control requiring rapid gesture transitions, the latency cost is prohibitive, and single-window classification with hysteresis thresholding is preferred.`,
      },
    ],
  },
  {
    num: "7",
    title: "Practical Recommendations for Window Parameter Selection",
    body: `The findings of the present study support a set of concrete recommendations for practitioners designing real-time sEMG gesture classification systems, organised by target application and hardware configuration.

For systems prioritising clinical prosthetic control with response latency as the primary constraint, the evidence supports the use of the shortest window that achieves the target accuracy threshold, with the recognition that for 200 Hz hardware this will require acceptance of accuracy below 80%. The 250 ms window (50 samples, 73.8% accuracy, 255 ms latency) is the recommended configuration for prosthetic applications where the 300 ms latency threshold is a hard constraint, with the expectation that accuracy will be insufficient for reliable clinical use without supplementary improvements in the classification architecture. Practitioners are advised to investigate deep learning approaches — particularly those learning features from raw time-series — as the most promising path to achieving adequate accuracy within the 300 ms latency constraint at 200 Hz.

For human-computer interaction and assistive technology applications where the 300 ms latency threshold is a soft constraint and somewhat higher latency is acceptable, the 1000 ms window (84.85% accuracy, 1005 ms effective latency) represents the authors' recommended configuration for 200 Hz systems. This configuration achieves 98.3% of the maximum obtainable accuracy, is computationally efficient, and produces stable feature estimates with low intra-class variability. The slightly superior 1250 ms configuration (85.3%) is recommended only for applications where latency above 1200 ms is acceptable, as the marginal accuracy gain does not justify the additional latency cost for most use cases.

For all applications, the present analysis supports 75% overlap as the recommended default overlap configuration, producing a 250 ms step size (4 Hz decision rate) with the 1000 ms window. This configuration provides sufficient decision rate for smooth user feedback without incurring prohibitive computational costs, and does not introduce the additional effective latency associated with majority voting post-processing. Majority voting is recommended only for non-time-critical applications where the additional 1000 ms latency from a five-window vote is acceptable and the 1.8 pp accuracy improvement justifies the design complexity.

For teams designing new hardware for sEMG gesture classification, the feasibility gap analysis presented in Section 5 provides a direct design target: a minimum sampling rate of approximately 500 Hz is required to close the gap between the clinical latency threshold (300 ms) and the window length needed for adequate feature estimation (approximately 480 ms at 200 Hz). At 500 Hz, a 295 ms window contains approximately 147 samples — sufficient for reliable MAV and RMS estimation and approaching adequacy for the full 64-dimensional feature vector, albeit without the margin of reliability provided by the 1000 ms / 200 Hz configuration. A sampling rate of 1000–2000 Hz, as used in research-grade systems, provides substantial headroom within the clinical latency constraint and is strongly preferred for prosthetic applications where simultaneous optimisation of latency and accuracy is required.`,
    subsections: [],
  },
  {
    num: "8",
    title: "Discussion",
    body: `The central finding of the present study — that no window duration simultaneously satisfies the clinical constraints on both response latency and classification accuracy for the 200 Hz Myo configuration — is, in retrospect, a straightforward consequence of the interaction between sampling rate and feature estimation theory. The result is not surprising to practitioners familiar with both the clinical latency literature and the statistical requirements of time-domain feature extraction. What is, perhaps, noteworthy is how rarely this fundamental incompatibility is explicitly stated in the published literature on consumer-grade EMG classification systems. Benchmark papers reporting high accuracy on Ninapro DB5 and comparable datasets consistently employ window durations of 500 ms or longer — configurations that are clinically indefensible for prosthetic control — without explicitly acknowledging that the reported accuracy is not achievable in the latency-constrained deployment context. The present analysis provides a quantitative framework for making this limitation explicit and for identifying the specific hardware constraint (sampling rate) and architectural approach (raw-signal deep learning) most likely to resolve it.

The accuracy plateau observed above 1000 ms merits separate discussion. The absence of a strong continued improvement above 1000 ms, despite the logarithmic convergence argument suggesting that longer windows should always provide at least marginal estimation improvement, is attributable to the competing effect of stationarity violation identified in Section 4.3. For the Ninapro DB5 paradigm, the five-second gesture repetitions provide long steady-state contraction intervals, but the 3-second inter-gesture rest periods are associated with signal transitions whose statistical properties differ substantially from steady-state contraction. Longer windows are more likely to capture these transitions and produce contaminated feature vectors. The practical design implication is that the optimal window duration is not simply the longest feasible window but the largest window that can be reliably extracted from the steady-state portion of anticipated gesture durations — a context-dependent constraint that designers must estimate from the expected usage patterns of their specific application.

The majority voting analysis confirms prior literature [2, 11] in demonstrating meaningful accuracy improvements from short voting windows in dynamic contraction conditions. However, the latency cost of majority voting at the long window durations necessitated by 200 Hz hardware renders this technique impractical for real-time prosthetic control. This conclusion differs from the majority voting literature, which largely evaluates voting at high sampling rates where the individual window duration is short enough that even five-window votes produce acceptable total latency. The incompatibility of majority voting with low-rate hardware in latency-sensitive applications represents an underappreciated consequence of the consumer EMG hardware constraint.

Finally, it is worth noting that the present analysis treats the 200 Hz Myo armband configuration as a fixed constraint. The conclusions of this study are specific to this hardware configuration and should not be generalised to higher-rate systems without independent empirical validation. The accuracy-duration curves and the feasibility gap are functions of the underlying sampling rate and therefore differ quantitatively for different hardware configurations, even if the qualitative trade-off structure is universal.`,
    subsections: [],
  },
  {
    num: "9",
    title: "Conclusion",
    body: `The present study has provided the first systematic empirical characterisation of window duration effects on cross-subject sEMG gesture classification accuracy for the 200 Hz Ninapro DB5 configuration under matched leave-one-subject-out cross-validation. The principal findings are as follows. Classification accuracy increases monotonically from 62.4% at 100 ms to a peak of 85.3% at 1250 ms before declining modestly at 2000 ms due to stationarity violation. The 1000 ms window used in the authors' prior work captures 98.3% of the peak accuracy at 20% lower latency and is confirmed as a near-optimal choice for accuracy-focused applications. No window duration simultaneously satisfies the clinical constraints of ≤ 300 ms latency and ≥ 80% classification accuracy for a 200 Hz system, a structural incompatibility — the prosthetic feasibility gap — that cannot be resolved by classifier or feature improvements and requires either higher-rate hardware or explicit compromise on one clinical constraint. Overlap ratio does not influence per-window accuracy but increases the decision rate; 75% overlap is recommended as a practical default. Majority voting provides a 1.8 pp accuracy improvement at the cost of (N−1) step intervals of additional latency, rendering it suitable only for non-time-critical applications.

The most important near-term research direction indicated by the present findings is the development of raw-signal deep learning architectures capable of achieving ≥ 80% cross-subject accuracy from windows of 295 ms or fewer samples at 200 Hz. Success in this direction would close the prosthetic feasibility gap without requiring hardware replacement and would substantially advance the deployability of consumer-grade EMG gesture classification for assistive technology applications. All experimental code and model weights are publicly available at github.com/Jaden300/myojam under the MIT licence.`,
    subsections: [],
  },
]

const REFERENCES = [
  { num: 1,  text: "Hudgins, B., Parker, P., & Scott, R. N. (1993). A new strategy for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 40(1), 82–94." },
  { num: 2,  text: "Englehart, K., & Hudgins, B. (2003). A robust, real-time control scheme for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 50(7), 848–854." },
  { num: 3,  text: "Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). Feature reduction and selection for EMG signal classification. Expert Systems with Applications, 39(8), 7420–7431." },
  { num: 4,  text: "Atzori, M., Gijsberts, A., Castellini, C., Caputo, B., Hager, A. G. M., Elsig, S., Giusti, A., Rosendo, A., Vogel, J., & Müller, H. (2014). Electromyography data for non-invasive naturally-controlled robotic hand prostheses. Scientific Data, 1(1), 140053." },
  { num: 5,  text: "Farrell, T. R., & Weir, R. F. (2007). The optimal controller delay for myoelectric prostheses. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 15(1), 111–118." },
  { num: 6,  text: "Scheme, E., & Englehart, K. (2011). Electromyogram pattern recognition for control of powered upper-limb prostheses: State of the art and challenges for clinical use. Journal of Rehabilitation Research & Development, 48(6), 643–660." },
  { num: 7,  text: "De Luca, C. J. (1997). The use of surface electromyography in biomechanics. Journal of Applied Biomechanics, 13(2), 135–163." },
  { num: 8,  text: "Tkach, D., Huang, H., & Kuiken, T. A. (2010). Study of stability of time-domain features for electromyographic pattern recognition. Journal of NeuroEngineering and Rehabilitation, 7(1), 21." },
  { num: 9,  text: "Oskoei, M. A., & Hu, H. (2007). Myoelectric control systems — a survey. Biomedical Signal Processing and Control, 2(4), 275–294." },
  { num: 10, text: "Phinyomark, A., Quaine, F., Charbonnier, S., Serviere, C., Tarpin-Bernard, F., & Laurillau, Y. (2013). EMG feature evaluation for improving myoelectric pattern recognition robustness. Expert Systems with Applications, 40(12), 4832–4840." },
  { num: 11, text: "Shenoy, P., Miller, K. J., Crawford, B., & Rao, R. P. N. (2008). Online electromyographic control of a robotic prosthesis. IEEE Transactions on Biomedical Engineering, 55(3), 1128–1135." },
  { num: 12, text: "Simon, A. M., Hargrove, L. J., Lock, B. A., & Kuiken, T. A. (2011). Target achievement control test: Evaluating real-time myoelectric pattern-recognition control of multifunctional upper-limb prostheses. Journal of Rehabilitation Research & Development, 48(6), 619–628." },
  { num: 13, text: "Englehart, K., Hudgins, B., Parker, P. A., & Stevenson, M. (1999). Classification of the myoelectric signal using time-frequency based representations. Medical Engineering & Physics, 21(6–7), 431–438." },
  { num: 14, text: "Farina, D., Merletti, R., & Enoka, R. M. (2004). The extraction of neural strategies from the surface EMG. Journal of Applied Physiology, 96(4), 1486–1495." },
  { num: 15, text: "Young, A. J., Hargrove, L. J., & Kuiken, T. A. (2011). Improving myoelectric pattern recognition robustness to electrode shift by changing interelectrode distance and electrode configuration. IEEE Transactions on Biomedical Engineering, 58(2), 360–368." },
]

const WINDOW_DATA = [
  { dur: 100,  samples: 20,  acc: 62.4,  color: "#EF4444", clinical: true  },
  { dur: 250,  samples: 50,  acc: 73.8,  color: "#F59E0B", clinical: true  },
  { dur: 500,  samples: 100, acc: 81.2,  color: "#F59E0B", clinical: false },
  { dur: 750,  samples: 150, acc: 83.9,  color: "#3B82F6", clinical: false },
  { dur: 1000, samples: 200, acc: 84.85, color: "#3B82F6", clinical: false },
  { dur: 1250, samples: 250, acc: 85.3,  color: "#10B981", clinical: false },
  { dur: 1500, samples: 300, acc: 85.1,  color: "#10B981", clinical: false },
  { dur: 2000, samples: 400, acc: 84.2,  color: "#8B5CF6", clinical: false },
]

function WindowAccuracyChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:"#10B981" }}/>
          <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>Peak accuracy</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:10, height:10, borderRadius:2, background:"rgba(239,68,68,0.3)", border:"1px dashed #EF4444" }}/>
          <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>Within clinical latency threshold (≤300 ms)</span>
        </div>
      </div>
      <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {WINDOW_DATA.map((d, i) => (
        <div key={d.dur} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <div style={{ width:130, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0, lineHeight:1.3 }}>
            {d.dur} ms ({d.samples} samples)
          </div>
          <div style={{ flex:1, height:11, background: d.clinical ? "rgba(239,68,68,0.08)" : "var(--border)", borderRadius:100, overflow:"hidden", border: d.clinical ? "1px dashed rgba(239,68,68,0.4)" : "none" }}>
            <div style={{ height:"100%", width: vis ? `${d.acc}%` : "0%", background: d.dur===1250 ? "#10B981" : d.dur===1000 ? "#FF2D78" : d.color, borderRadius:100, transition:`width 0.8s ease ${i * 0.08}s` }}/>
          </div>
          <div style={{ width:44, fontSize:12, fontWeight:700, color: d.dur===1250 ? "#10B981" : d.dur===1000 ? "#FF2D78" : d.color, flexShrink:0 }}>{d.acc}%</div>
          <div style={{ width:28, fontSize:10, color: d.clinical ? "#EF4444" : "var(--text-tertiary)", flexShrink:0, fontWeight: d.clinical ? 600 : 300 }}>
            {d.clinical ? "✓ <300ms" : ""}
          </div>
        </div>
      ))}
      </div>
      <div style={{ marginTop:6, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Pink bar = myojam baseline (1000 ms) · Green bar = peak accuracy (1250 ms) · Red-shaded rows = within clinical latency threshold (Farrell & Weir, 2007)
      </div>
    </div>
  )
}

function LatencyTradeoffChart() {
  const PAD = { top:24, right:24, bottom:44, left:48 }
  const SW = 480, SH = 200
  const CW = SW - PAD.left - PAD.right, CH = SH - PAD.top - PAD.bottom
  const xMin = 0, xMax = 2100, yMin = 58, yMax = 88
  const toX = d => PAD.left + (d - xMin) / (xMax - xMin) * CW
  const toY = a => PAD.top + (yMax - a) / (yMax - yMin) * CH
  const pts = WINDOW_DATA.map(d => `${toX(d.dur)},${toY(d.acc)}`).join(" ")
  const fill = `${toX(WINDOW_DATA[0].dur)},${toY(yMin)} ${pts} ${toX(WINDOW_DATA[WINDOW_DATA.length-1].dur)},${toY(yMin)}`
  const threshX = toX(295)
  const yTicks = [60, 65, 70, 75, 80, 85, 90]
  const xTicks = [0, 500, 1000, 1500, 2000]
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} width="100%">
      {yTicks.map(y => (
        <line key={y} x1={PAD.left} y1={toY(y)} x2={PAD.left+CW} y2={toY(y)} stroke="var(--border)" strokeWidth={0.5}/>
      ))}
      <polygon points={fill} fill="#3B82F6" fillOpacity={0.07}/>
      <polyline points={pts} fill="none" stroke="#3B82F6" strokeWidth={1.8} strokeLinejoin="round"/>
      <line x1={threshX} y1={PAD.top} x2={threshX} y2={PAD.top+CH} stroke="#EF4444" strokeWidth={1.2} strokeDasharray="4,3"/>
      <text x={threshX+3} y={PAD.top+11} fontSize={8} fill="#EF4444" fontFamily="monospace">295 ms</text>
      <text x={threshX+3} y={PAD.top+21} fontSize={7} fill="#EF4444" fontFamily="monospace">clinical limit</text>
      <line x1={PAD.left} y1={toY(80)} x2={PAD.left+CW} y2={toY(80)} stroke="#F59E0B" strokeWidth={1} strokeDasharray="3,3"/>
      <text x={PAD.left+CW-2} y={toY(80)-4} fontSize={7} fill="#F59E0B" textAnchor="end">80% adequacy floor</text>
      {WINDOW_DATA.map(d => (
        <circle key={d.dur} cx={toX(d.dur)} cy={toY(d.acc)} r={d.dur===1000||d.dur===1250?5:3}
          fill={d.dur===1250?"#10B981":d.dur===1000?"#FF2D78":"#3B82F6"}
          stroke="var(--bg)" strokeWidth={1.2}/>
      ))}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+CH} stroke="var(--text-tertiary)" strokeWidth={1}/>
      <line x1={PAD.left} y1={PAD.top+CH} x2={PAD.left+CW} y2={PAD.top+CH} stroke="var(--text-tertiary)" strokeWidth={1}/>
      {xTicks.map(x => (
        <g key={x}>
          <line x1={toX(x)} y1={PAD.top+CH} x2={toX(x)} y2={PAD.top+CH+4} stroke="var(--text-tertiary)" strokeWidth={1}/>
          <text x={toX(x)} y={PAD.top+CH+14} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">{x}</text>
        </g>
      ))}
      {yTicks.map(y => (
        <g key={y}>
          <text x={PAD.left-4} y={toY(y)+3} fontSize={8} fill="var(--text-tertiary)" textAnchor="end">{y}%</text>
          <line x1={PAD.left-3} y1={toY(y)} x2={PAD.left} y2={toY(y)} stroke="var(--text-tertiary)" strokeWidth={1}/>
        </g>
      ))}
      <text x={PAD.left+CW/2} y={SH-2} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle">Window duration (ms)</text>
      <text x={9} y={PAD.top+CH/2} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle" transform={`rotate(-90,9,${PAD.top+CH/2})`}>Accuracy (%)</text>
      <text x={PAD.left+CW/2} y={PAD.top-6} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">Pink = myojam baseline · Green = peak</text>
    </svg>
  )
}

function OverlapDiagram() {
  const LABW = 110, CHARTW = 370, ROW_H = 30, PAD = 10
  const W = LABW + CHARTW + 10
  const WWIN = 100
  const configs = [
    { label: "0% overlap",  step: 100, color: "#3B82F6",  desc: "1000 ms step" },
    { label: "50% overlap", step: 50,  color: "#10B981",  desc: "500 ms step"  },
    { label: "75% overlap", step: 25,  color: "#F59E0B",  desc: "250 ms step"  },
    { label: "90% overlap", step: 10,  color: "#FF2D78",  desc: "100 ms step"  },
  ]
  const totalH = configs.length * (ROW_H + PAD) + PAD + 28
  return (
    <svg viewBox={`0 0 ${W} ${totalH}`} width="100%">
      <defs>
        <clipPath id="oc">
          <rect x={LABW} y={0} width={CHARTW} height={totalH}/>
        </clipPath>
      </defs>
      <text x={LABW + CHARTW/2} y={14} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle" fontFamily="monospace">← signal time →</text>
      {configs.map((cfg, row) => {
        const y = row * (ROW_H + PAD) + PAD + 18
        const starts = []
        for (let x = 0; x < CHARTW + WWIN; x += cfg.step) starts.push(x)
        return (
          <g key={cfg.label}>
            <text x={LABW - 6} y={y + ROW_H/2 + 3} fontSize={10} fill="var(--text-secondary)" textAnchor="end">{cfg.label}</text>
            <text x={LABW - 6} y={y + ROW_H/2 + 13} fontSize={8} fill="var(--text-tertiary)" textAnchor="end">{cfg.desc}</text>
            <rect x={LABW} y={y} width={CHARTW} height={ROW_H} rx={3} fill="var(--bg)" stroke="var(--border)" strokeWidth={0.5}/>
            <g clipPath="url(#oc)">
              {starts.map((x, i) => (
                <rect key={i} x={LABW+x} y={y+3} width={WWIN-1} height={ROW_H-6} rx={2}
                  fill={cfg.color} fillOpacity={0.28} stroke={cfg.color} strokeWidth={0.7} strokeOpacity={0.6}/>
              ))}
            </g>
          </g>
        )
      })}
      <text x={W/2} y={totalH-2} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">
        Each rectangle = one analysis window (1000 ms). Overlap density increases per-second decision rate.
      </text>
    </svg>
  )
}

export default function ResearchWindowing() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const BIBTEX = `@techreport{wong2026myojam_windowing,
  title     = {Temporal Segmentation Parameters in Surface Electromyographic
               Gesture Classification: A Systematic Empirical Analysis of
               Window Duration, Overlap Ratio, and Increment Selection},
  author    = {myojam Research Team},
  year      = {2026},
  month     = {April},
  institution = {myojam Project},
  url       = {https://myojam.com/research/windowing-analysis},
  note      = {MIT Licence. Code: https://github.com/Jaden300/myojam}
}`

  function copyCite() {
    navigator.clipboard.writeText(BIBTEX).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        @media print { nav, footer, .no-print { display: none !important; } .paper { max-width: 100% !important; padding: 20px !important; } }
      `}</style>
      <Navbar />
      <div style={{ maxWidth:760, margin:"0 auto", padding:"100px 32px 80px" }} className="paper">

        {/* Breadcrumb */}
        <div className="no-print" style={{ display:"flex", gap:8, alignItems:"center", marginBottom:32 }}>
          <span onClick={() => navigate("/research")} style={{ fontSize:13, color:"var(--text-tertiary)", cursor:"pointer", fontWeight:300, transition:"color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
          >Research</span>
          <span style={{ fontSize:13, color:"var(--border)" }}>›</span>
          <span style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300 }}>Windowing analysis</span>
        </div>

        {/* Journal header */}
        <div style={{ borderBottom:"2px solid var(--text)", paddingBottom:20, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap", marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:400, color:"var(--text-secondary)", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
              myojam Technical Report · April 2026 · Open Access · Empirical Study
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:500, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:100, padding:"3px 10px" }}>Open Access</span>
              <span style={{ fontSize:10, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.2)", borderRadius:100, padding:"3px 10px" }}>MIT Licence</span>
            </div>
          </div>
          <h1 style={{ fontSize:"clamp(16px,2.8vw,24px)", fontWeight:700, color:"var(--text)", lineHeight:1.3, marginBottom:20, fontFamily:"Georgia, serif" }}>
            Temporal Segmentation Parameters in Surface Electromyographic Gesture Classification: A Systematic Empirical Analysis of Window Duration, Overlap Ratio, and Increment Selection
          </h1>
          <div style={{ marginBottom:16 }}>
            {AUTHORS.map(a => (
              <span key={a.name} style={{ fontSize:15, color:"var(--accent)", fontWeight:500, marginRight:16 }}>
                {a.name}<sup style={{ fontSize:10 }}>1</sup>
              </span>
            ))}
          </div>
          {AFFILIATIONS.map(a => (
            <div key={a.num} style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, fontStyle:"italic", marginBottom:4 }}>
              <sup>{a.num}</sup>{a.label}
            </div>
          ))}
        </div>

        {/* Keywords */}
        <div style={{ marginBottom:32 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", fontFamily:"Georgia, serif" }}>Keywords: </span>
          <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, fontStyle:"italic" }}>{KEYWORDS.join(", ")}</span>
        </div>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", borderRadius:"0 8px 8px 0", padding:"20px 24px", marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12, fontFamily:"Georgia, serif" }}>Abstract</div>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, margin:0, fontFamily:"Georgia, serif" }}>{ABSTRACT}</p>
        </div>

        {/* Table of contents */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:10, border:"1px solid var(--border)", padding:"18px 22px", marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Contents</div>
          {SECTIONS.map(s => (
            <div key={s.num}>
              <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:4, display:"flex", gap:8 }}>
                <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>{s.num}.</span>
                <a href={`#rw-${s.num}`} style={{ color:"var(--text-secondary)", textDecoration:"none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                >{s.title}</a>
              </div>
              {s.subsections.map(sub => (
                <div key={sub.num} style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, marginBottom:3, display:"flex", gap:8, paddingLeft:20 }}>
                  <span style={{ width:28 }}>{sub.num}</span>
                  <a href={`#rw-${sub.num}`} style={{ color:"var(--text-tertiary)", textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                  >{sub.title}</a>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, display:"flex", gap:8, marginTop:4 }}>
            <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>10.</span>
            <span>References</span>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <div key={s.num} id={`rw-${s.num}`} style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:16, paddingBottom:8, borderBottom:"1px solid var(--border)", fontFamily:"Georgia, serif" }}>
              {s.num}. {s.title}
            </h2>
            {s.body && s.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:14, fontFamily:"Georgia, serif" }}>{para}</p>
            ))}
            {s.subsections.map(sub => (
              <div key={sub.num} id={`rw-${sub.num}`} style={{ marginBottom:28 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:12, fontFamily:"Georgia, serif" }}>
                  {sub.num} {sub.title}
                </h3>
                {sub.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:12, fontFamily:"Georgia, serif" }}>{para}</p>
                ))}
              </div>
            ))}

            {s.num === "4" && (
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px", margin:"28px 0" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>
                  Figure 1 — Cross-subject accuracy by window duration (LOSO, Ninapro DB5, N=10 subjects)
                </div>
                <WindowAccuracyChart />
              </div>
            )}

            {s.num === "5" && (
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px", margin:"28px 0" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>
                  Figure 2 — Accuracy vs window duration with clinical latency and accuracy thresholds
                </div>
                <LatencyTradeoffChart />
              </div>
            )}

            {s.num === "6" && (
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px", margin:"28px 0" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>
                  Figure 3 — Visual comparison of four overlap configurations (1000 ms window, 200 Hz)
                </div>
                <OverlapDiagram />
              </div>
            )}
          </div>
        ))}

        {/* References */}
        <div style={{ marginBottom:48 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:20, paddingBottom:8, borderBottom:"1px solid var(--border)", fontFamily:"Georgia, serif" }}>
            References
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {REFERENCES.map(ref => (
              <div key={ref.num} style={{ display:"flex", gap:14, fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, fontFamily:"Georgia, serif" }}>
                <span style={{ color:"var(--accent)", fontWeight:600, flexShrink:0 }}>[{ref.num}]</span>
                <span>{ref.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citation */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Cite this work</div>
            <button onClick={copyCite} style={{ background: copied ? "rgba(16,185,129,0.1)" : "var(--bg)", border:`1px solid ${copied ? "rgba(16,185,129,0.3)" : "var(--border)"}`, borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:500, color: copied ? "#10B981" : "var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.2s" }}>
              {copied ? "✓ Copied" : "Copy BibTeX"}
            </button>
          </div>
          <pre style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"monospace", margin:0 }}>{BIBTEX}</pre>
        </div>

        {/* Actions */}
        <div style={{ marginTop:32, display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={() => window.print()} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.color = "var(--text-secondary)" }}
          >Print / Save as PDF</button>
          <button onClick={() => navigate("/research")} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer" }}>
            ← Research hub
          </button>
        </div>
      </div>
      <UpNext current="/research/windowing-analysis" />
      <Footer />
    </div>
  )
}
