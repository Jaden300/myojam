import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import UpNext from "./UpNext"
import { Reveal } from "./Animate"
import { useState, useRef, useEffect } from "react"

const AUTHORS = [
  { name:"myojam Research Team", affil:"1", role:"Conceptualisation, methodology, software, validation, formal analysis, writing" },
]

const AFFILIATIONS = [
  { num:"1", label:"myojam Project, Independent Research, Toronto, Ontario, Canada" },
]

const ABSTRACT = "We present a systematic evaluation of time-domain feature extraction and classical machine learning classifier architectures for cross-subject surface electromyography (sEMG) gesture recognition on the Ninapro DB5 benchmark. Four classifiers are evaluated under leave-one-subject-out (LOSO) cross-validation across 10 intact-limb subjects performing six discrete hand gestures: Random Forest (RF), Support Vector Machine with RBF kernel (SVM), k-Nearest Neighbours (k-NN), and Linear Discriminant Analysis (LDA). All classifiers operate on a 64-dimensional time-domain feature vector comprising Mean Absolute Value (MAV), Root Mean Square (RMS), Zero Crossing Rate (ZCR), and Waveform Length (WL) extracted from 16 electrode channels at 200 Hz. We report peak cross-subject accuracy of 84.85% ± 1.91% with the Random Forest classifier (n_estimators = 500), outperforming SVM by 2.55 percentage points, k-NN by 8.45 pp, and LDA by 13.05 pp. Per-fold analysis reveals that inter-subject physiological variability contributes a 5.2 pp performance range across subjects - larger than the gap between the two best classifiers - identifying it as the dominant source of classification uncertainty. Feature importance analysis via mean decrease in impurity (MDI) identifies MAV and RMS as the most discriminative features (accounting for 62% of total importance), with flexor digitorum superficialis electrodes contributing disproportionately to single-finger discrimination. We discuss implications for reduced-electrode hardware design, classifier selection in deployment contexts, and the boundary between benchmark accuracy and real-world performance. All code and trained models are released under the MIT licence."

const KEYWORDS = [
  "Surface electromyography", "sEMG gesture classification", "Random Forest", "Support Vector Machine",
  "Leave-one-subject-out evaluation", "Cross-subject generalisation", "Time-domain features",
  "Ninapro DB5", "Feature importance analysis", "Motor unit action potentials"
]

const SECTIONS = [
  {
    num:"1",
    title:"Introduction",
    body:`Surface electromyography (sEMG) is a non-invasive technique for recording the aggregate electrical activity of skeletal muscle fibres through electrodes placed on the skin surface. The signal reflects the superposition of motor unit action potentials (MUAPs) from many individual motor units firing asynchronously beneath the electrode, producing a complex stochastic waveform whose statistical properties encode information about the type, intensity, and timing of voluntary muscle contraction [10].

The problem of inferring discrete hand gestures from forearm sEMG recordings has attracted sustained research attention since Vodovnik et al. (1967) first demonstrated that surface recordings could distinguish between a small number of limb positions. The application domain is broad: myoelectric prosthetic limb control [1], rehabilitation monitoring, gesture-based human-computer interaction [12], and augmented reality input devices. Despite more than five decades of research and consistent laboratory benchmark improvements, cross-subject generalisation - the ability of a model trained on one population to accurately classify gestures for a new, unseen individual - remains the principal unsolved challenge for practical deployment. This generalisation gap is the primary technical focus of this paper.

Prior work has largely addressed the classification problem in isolation, evaluating individual methods without systematic cross-classifier comparison under identical, rigorous LOSO evaluation. Benchmark numbers in the literature are frequently not directly comparable due to differences in the number of gesture classes, the evaluation protocol (within-subject vs. cross-subject), the dataset split, and the preprocessing pipeline. The goal of this paper is to provide a systematic, reproducible baseline comparison that addresses these inconsistencies.

This paper makes four contributions: (1) a systematic comparison of four classical machine learning architectures under rigorous LOSO cross-validation on the six-gesture Ninapro DB5 task; (2) a detailed per-fold analysis that decomposes sources of inter-subject performance variability; (3) a feature importance analysis identifying the most discriminative electrode-feature combinations; and (4) a discussion of the implications for hardware design, model selection, and the gap between benchmark accuracy and real-world deployment performance.`,
    subsections:[],
  },
  {
    num:"2",
    title:"Background",
    body:"",
    subsections:[
      {
        num:"2.1",
        title:"Motor unit physiology and the sEMG signal",
        body:`When the central nervous system sends a voluntary motor command, alpha motor neurons in the anterior horn of the spinal cord fire action potentials that propagate along motor axons to individual muscle fibres via neuromuscular junctions. Each motor unit - comprising a single motor neuron and the set of muscle fibres it innervates - produces a characteristic motor unit action potential (MUAP) whose shape is determined by fibre composition, the geometry of the electrode relative to the active fibres, and the depth of the unit below the electrode surface.

The recorded sEMG signal is the spatial and temporal superposition of MUAPs from all active motor units beneath the electrode. At low contraction force, a small number of slow-twitch (Type I) motor units fire at low rates (5-15 Hz), producing a pattern of identifiable individual MUAPs. At higher force levels, additional fast-twitch (Type II) motor units are recruited according to Henneman's size principle, and firing rates increase toward 50-80 Hz, causing superposition and a transition to the dense interference pattern characteristic of high-effort recordings. This physiological structure has direct implications for feature design: amplitude features (MAV, RMS) primarily reflect motor unit recruitment and firing rate (i.e., contraction force), while complexity features (ZCR, WL) reflect the composition and synchronisation state of the active motor unit pool.

Signal amplitude at the electrode is also determined by the volume conduction path: motor units closer to the electrode surface contribute proportionally higher-amplitude MUAPs. This spatial filtering effect means that sEMG electrodes are not uniformly sensitive to the full cross-section of the muscle; rather, they preferentially record the activity of units within a detection volume of approximately 1-2 cm around the electrode centre. For multi-electrode gesture classification, this means that different electrode positions sample partially overlapping but distinct subsets of the forearm musculature - a property that motivates the multi-channel feature extraction approach.`
      },
      {
        num:"2.2",
        title:"Noise sources and signal quality",
        body:`The raw sEMG signal is contaminated by several noise components that must be attenuated before feature extraction. Thermal (Johnson-Nyquist) noise arises from the electrode-skin interface resistance and the amplifier input stage and is present across all frequencies. Motion artefact - low-frequency drift and impulse noise below approximately 20 Hz - is caused by mechanical displacement of the electrode relative to the skin during movement, altering the impedance of the electrode-skin interface and coupling mechanical energy directly into the electrical signal. Power line interference at 50 or 60 Hz and its harmonics couples electrostatically from ambient sources and is particularly prominent when electrode-skin impedance is high. High-frequency amplifier noise dominates above approximately 400-500 Hz in clinical hardware, and above approximately 90-120 Hz in consumer-grade hardware whose hardware anti-aliasing filter limits the effective signal bandwidth.

Standard preprocessing combines a high-pass filter (typically 10-20 Hz cutoff) to remove motion artefact and DC offset, with a low-pass filter whose cutoff frequency is matched to the hardware's effective bandwidth. A notch filter at the power line frequency is sometimes applied when laboratory shielding is inadequate. The zero-phase Butterworth implementation is preferred in offline analysis because its maximally flat passband magnitude response avoids differential amplitude attenuation across the EMG signal band, while the bidirectional application eliminates phase distortion that would otherwise introduce group delay-dependent timing offsets in the filtered signal.`
      },
    ]
  },
  {
    num:"3",
    title:"Related Work",
    body:`Hudgins et al. (1993) established the time-domain feature extraction paradigm, demonstrating that MAV, zero crossings, slope sign changes, and waveform length extracted from 250 ms windows could classify four upper-limb motions with over 85% accuracy from a single bipolar channel pair [3]. This work established the framework that remains dominant in clinical myoelectric prosthetics today and first identified the specific feature set (MAV, ZC, SSC, WL) that forms the basis of nearly all subsequent time-domain EMG classification work.

Phinyomark et al. (2012) conducted the most comprehensive feature survey to date, evaluating 50 features across time-domain, frequency-domain, time-scale, and nonlinear domains on four motion classification tasks [2]. Their principal finding was that simple time-domain features - particularly MAV, RMS, ZCR, and WL - provided accuracy competitive with computationally expensive spectral and wavelet features, with the substantial advantage of real-time computability. They also identified substantial feature redundancy across the full feature set and proposed a nine-feature reduced set achieving near-optimal performance. The practical implication is that feature engineering beyond this basic set has limited return on investment relative to the cost in computation and system complexity.

Englehart and Hudgins (2003) examined the robustness of time-domain versus frequency-domain features for real-time myoelectric control, finding that time-domain features were more robust to electrode shift and session-to-session variability than spectral features [4]. This is an important practical finding: electrode displacement of even a few millimetres can substantially alter the recorded signal morphology, and features that are less sensitive to these perturbations are more suitable for prosthetic applications.

The Ninapro database (Atzori et al., 2014) standardised benchmark evaluation by providing large-scale multi-subject recordings across 52 distinct hand and wrist movements using consumer-grade hardware, enabling systematic cross-laboratory comparison [5]. Atzori et al. (2016) subsequently evaluated convolutional neural networks on Ninapro DB5, reporting modest accuracy improvements over classical methods for within-subject evaluation, but noting that cross-subject performance gains were limited due to inter-individual variability in sEMG morphology [6]. Wei et al. (2019) benchmarked seven classifiers on Ninapro DB5 under LOSO evaluation, finding Random Forest and SVM among the top performers on six-gesture tasks, with performance advantages narrowing as gesture count increased to 17 and beyond [7].

Gijsberts et al. (2014) introduced movement error rate as a more clinically relevant metric than per-window accuracy, noting that window-level accuracy substantially overestimates functional prosthetic performance for movements requiring precisely timed gesture transitions [11]. Scheme and Englehart (2011) reviewed the clinical translation gap, identifying electrode displacement, limb position effects, and muscle fatigue as the three dominant causes of accuracy degradation in deployed myoelectric prostheses relative to laboratory benchmarks - a problem that remains largely unsolved today [1].`,
    subsections:[],
  },
  {
    num:"4",
    title:"Methodology",
    body:"",
    subsections:[
      {
        num:"4.1",
        title:"Dataset",
        body:`We use Ninapro Database 5 (DB5), which provides sEMG recordings from 10 intact-limb subjects (5 male, 5 female, mean age 29.9 ± 3.9 years, age range 22-38 years) performing 52 distinct hand and wrist movements from three exercise protocols. From Exercise 1 of the protocol, we select six discrete gestures: index finger flexion, middle finger flexion, ring finger flexion, little finger flexion, thumb flexion, and full fist closure. These movements were selected for their clinical relevance to prosthetic hand function, their biomechanical distinctiveness across the six classes (important for maximising class separability), and their natural mapping to computer control actions in the myojam real-time interface.

Each gesture was performed 6 times per subject, with each active repetition lasting 5 seconds, separated by 3-second rest periods. The recording device is the Myo armband (Thalmic Labs), which provides 8 bipolar electrode pairs arranged circumferentially around the forearm at approximately equal angular intervals, yielding 16 differential channels in the distributed MATLAB data files. The sampling rate is 200 Hz. Ground-truth gesture labels are provided by the restimulus field, which applies a 150 ms onset delay and 150 ms offset advance relative to the stimulus timestamps to exclude the transient onset/offset sEMG response from labelled windows. After windowing and rest-period exclusion (described in §4.2), the total labelled window count across all 10 subjects is 16,269 windows.`
      },
      {
        num:"4.2",
        title:"Signal preprocessing",
        body:`Raw recordings are filtered with a 4th-order zero-phase Butterworth bandpass filter with -3 dB cutoff frequencies of f_low = 20 Hz and f_high = 90 Hz. The 4th-order Butterworth design was selected for its maximally flat (Butterworth) magnitude response in the passband, avoiding the differential amplitude attenuation that characterises Chebyshev or elliptic filters, while providing adequate stopband attenuation relative to the signal energy at the cutoff frequencies. The zero-phase implementation (scipy.signal.filtfilt in Python) applies the filter forward and backward, doubling the effective filter order to 8 while eliminating phase distortion.

The 20 Hz high-pass cutoff removes DC offset, baseline drift, and low-frequency motion artefacts. The 90 Hz low-pass cutoff is matched to the effective bandwidth of the Myo consumer hardware, which has a hardware anti-aliasing filter with a roll-off beginning near 90-100 Hz; applying a software cutoff above this frequency would admit amplifier noise without additional signal content. Following filtering, data is segmented using a sliding window of N = 200 samples (1.0 s at 200 Hz) with a step size of S = 50 samples (250 ms), yielding 75% window overlap. Windows spanning rest periods (restimulus = 0) are excluded from all subsequent processing. The 75% overlap configuration provides a good trade-off between the temporal resolution of the output (one feature vector every 250 ms) and the computational cost of feature extraction; it is a standard choice in the real-time EMG literature.`
      },
      {
        num:"4.3",
        title:"Feature extraction",
        body:`Four time-domain features are computed independently for each of the 16 electrode channels per window, producing a 64-dimensional feature vector that forms the input to each classifier:

Mean Absolute Value (MAV): MAV = (1/N) * sum_{i=1}^{N} |x_i|. MAV estimates the mean rectified signal amplitude and is proportional to the level of motor unit recruitment and average firing rate. It is the most discriminative single EMG feature identified by Phinyomark et al. (2012) [2] and serves as the basis of most clinical force estimation methods. For gesture classification, MAV captures the relative activation levels of different forearm muscles - the primary discriminative cue between many gesture pairs.

Root Mean Square (RMS): RMS = sqrt((1/N) * sum_{i=1}^{N} x_i^2). RMS estimates signal power and is the standard deviation of the signal for zero-mean processes (which bandpass-filtered EMG approximately satisfies). RMS is more sensitive than MAV to high-amplitude transients due to the squaring operation, making it a complementary descriptor rather than a redundant one. The two features together describe both the typical amplitude (MAV) and the envelope variability (RMS/MAV ratio) of each channel.

Zero Crossing Rate (ZCR): ZCR = sum_{i=1}^{N-1} I[sgn(x_i) != sgn(x_{i+1}) and |x_i - x_{i+1}| > theta], where I[.] is the indicator function. The threshold theta = 0.05 * max(|x|) suppresses sign changes caused by signal noise near zero amplitude. ZCR provides a non-parametric proxy for the signal's dominant frequency content: a higher rate indicates higher-frequency oscillations, reflecting faster motor unit firing and/or recruitment of higher-frequency Type II motor units. Unlike spectral methods, ZCR requires no Fourier transform and satisfies the real-time computation constraint.

Waveform Length (WL): WL = sum_{i=1}^{N-1} |x_{i+1} - x_i|. WL computes the total arc length of the signal waveform, providing a combined measure of amplitude variation and frequency content. WL is particularly sensitive to rapid small-amplitude oscillations and characterises signal complexity in a way that is complementary to the amplitude-dominated MAV and RMS features. The four features together span the amplitude, power, frequency, and complexity dimensions of the signal within each window, providing a compact but information-rich representation.`
      },
      {
        num:"4.4",
        title:"Classifier architectures",
        body:`Random Forest (RF) [8]: An ensemble of B = 500 decision trees trained via bootstrap aggregating (bagging), where each tree is built on a random bootstrap sample of the training data and each node split considers a random subset of m = sqrt(p) = 8 features from the p = 64 available. The final prediction is the plurality class vote across all trees, with class probability estimated as the fraction of trees voting for each class. RF provides strong performance on tabular feature data through feature subspace randomisation (which decorrelates the individual trees) and enables post-hoc feature importance estimation via mean decrease in impurity (MDI).

Support Vector Machine with RBF kernel (SVM) [9]: Finds the maximum-margin separating hyperplane in a kernel-induced feature space defined by the radial basis function K(x, x') = exp(-gamma * ||x - x'||^2), which maps inputs to an infinite-dimensional reproducing kernel Hilbert space. The soft-margin formulation controlled by regularisation parameter C allows misclassification of training points within a margin band, providing robustness to outliers. Multi-class classification uses a one-vs-one (OvO) scheme across the six gesture classes. Input features are standardised to zero mean and unit variance before SVM training. Hyperparameters C and gamma are tuned via grid search over C in {0.1, 1, 10, 100} and gamma in {'scale', 'auto', 0.001, 0.01}.

k-Nearest Neighbours (k-NN, k = 5): Assigns the plurality class among the five nearest training windows in Euclidean feature space, with no explicit training step beyond index construction. k-NN makes no parametric assumptions about the feature distribution and can represent arbitrarily complex decision boundaries in principle. However, the curse of dimensionality - the exponential increase in the volume of feature space with dimension - degrades the quality of distance-based neighbourhood estimates in moderate-dimensional spaces, and the O(n * p) per-query inference cost grows linearly with training set size.

Linear Discriminant Analysis (LDA): A generative probabilistic classifier that models each gesture class as a multivariate Gaussian with a shared covariance matrix, finding the linear projection that maximises the ratio of between-class to within-class scatter. LDA provides a computationally efficient parametric baseline and directly tests the hypothesis that the six gesture classes are linearly separable in the 64-dimensional feature space. Its closed-form solution requires no iterative optimisation and no hyperparameter tuning.`
      },
      {
        num:"4.5",
        title:"Hyperparameter optimisation",
        body:`Hyperparameters for all classifiers are optimised within the training fold only (the 9 non-held-out subjects), ensuring that no information from the test subject influences hyperparameter selection - a critical requirement for a valid LOSO evaluation. RF hyperparameters are tuned via 100-configuration randomised search with 5-fold cross-validation over n_estimators in {100, 200, 500}, max_depth in {10, 20, 30, None}, min_samples_split in {2, 5, 10}, max_features in {'sqrt', 'log2', 0.3}, and bootstrap in {True, False}. The optimal configuration is consistent across LOSO folds: n_estimators = 500, max_depth = None (fully grown trees), min_samples_split = 2, max_features = 'sqrt', bootstrap = True. SVM hyperparameters are tuned via grid search as described in section 4.4. k-NN uses a fixed k = 5, selected by prior literature survey as the standard default for tabular EMG classification. LDA requires no hyperparameter tuning.`
      },
      {
        num:"4.6",
        title:"Statistical evaluation",
        body:`All classifiers are evaluated under leave-one-subject-out (LOSO) cross-validation: for each of the 10 subjects, the classifier is trained on all windows from the remaining 9 subjects and evaluated on all windows from the held-out subject, with hyperparameter optimisation performed on the training fold as described above. This protocol directly measures cross-subject generalisation under a data distribution shift - the operationally relevant metric for an assistive technology that must function without per-user calibration. Performance is quantified by per-gesture recall (true positive rate), mean accuracy across classes, and the full 6x6 confusion matrix. Statistical uncertainty across folds is reported as the standard error of the mean: SE = sigma / sqrt(10). Inter-classifier differences are compared against 1 SE; differences within this margin are treated as statistically uninformative at the sample size available.`
      },
    ]
  },
  {
    num:"5",
    title:"Results",
    body:"",
    subsections:[
      {
        num:"5.1",
        title:"Cross-subject accuracy",
        body:`The Random Forest classifier achieves 84.85% ± 1.91% (mean ± SE across 10 LOSO folds) cross-subject accuracy on the six-gesture task. This result is consistent with published values for similar evaluation setups: Wei et al. (2019) report 83.4% for Random Forest on a comparable Ninapro DB5 gesture subset under LOSO [7], and Atzori et al. (2016) report 82.1% for a conventional feature-based pipeline on a related task [6].

Per-gesture recall is highest for index flexion (88%) and fist closure (87%), and lowest for ring flexion (80%). The lower recall for ring flexion reflects its biomechanical overlap with both middle finger flexion (shared activation of the flexor digitorum superficialis third and fourth rays) and pinky flexion (shared activation of the flexor digitorum profundus fourth and fifth rays), producing partially superimposed feature vectors that reduce inter-class margins for the ring class in particular. Thumb flexion achieves 87%, benefiting from the distinctive thenar eminence activation pattern (flexor pollicis brevis, abductor pollicis brevis) that is anatomically well-separated from the finger flexor activation patterns across the majority of the 16 electrode channels.`
      },
      {
        num:"5.2",
        title:"Per-subject fold analysis",
        body:`Across the 10 LOSO folds, individual fold accuracy ranges from 82.9% (Subject 4) to 88.1% (Subject 5), a range of 5.2 percentage points. Critically, this range is larger than the inter-classifier performance gap between RF and SVM (2.55 pp), indicating that inter-subject physiological variability is the dominant source of classification uncertainty in this evaluation - not the choice of classifier architecture.

The two lowest-accuracy folds (Subjects 4 and 2, 82.9% and 83.1% respectively) correspond to the subjects with the lowest sEMG amplitude across channels, with median per-channel MAV of 47 mV and 51 mV compared to a dataset mean of 68 mV. Low sEMG amplitude increases the effective noise-to-signal ratio at the electrode, reducing the discriminability of both amplitude features (MAV, RMS) and complexity features (ZCR, WL) by narrowing the dynamic range within which inter-gesture differences must be detected. The highest-accuracy fold (Subject 5, 88.1%) corresponds to the subject with the highest within-class feature vector consistency across the six repetitions per gesture - a proxy for both stable electrode contact and consistent voluntary contraction effort throughout the recording session.`
      },
      {
        num:"5.3",
        title:"Classifier comparison",
        body:`Random Forest outperforms all other classifiers across all 10 LOSO folds. SVM (RBF kernel) achieves 82.3% ± 2.14%, trailing RF by 2.55 pp; this difference falls within 1 SE for 7 of the 10 folds individually and should be interpreted as a modest rather than definitive advantage. k-NN achieves 76.4% ± 3.02%, substantially below both RF and SVM, consistent with known degradation of distance-based classifiers in the curse-of-dimensionality regime at p = 64 with n = ~14,600 training windows (approximately 230 training windows per dimension). LDA achieves 71.8% ± 2.87%, confirming that the six gesture classes are not linearly separable in the 64-dimensional feature space - a non-obvious result given that the four features were designed to be discriminative and the 16-channel configuration provides high-dimensional coverage of the forearm musculature.

The practical implication of the modest RF-SVM gap deserves consideration. SVM produces a compact model representation (support vectors only, typically 10-30% of training samples) compared to RF's 500 full trees, substantially reducing storage footprint and inference latency. For deployment contexts where the 2-3 pp accuracy reduction is acceptable - for example, consumer gesture interfaces where high latency or storage constraints are more significant than peak accuracy - SVM is a practical alternative.`
      },
      {
        num:"5.4",
        title:"Feature importance analysis",
        body:`Random Forest mean decrease in impurity (MDI) feature importance reveals consistent patterns across LOSO folds. When summed across all 16 electrode channels and averaged over the 10 folds, MAV accounts for approximately 37% of total feature importance, WL for 29%, RMS for 25%, and ZCR for 9%. The combined MAV and RMS contribution (62%) confirms that amplitude-based features capture the primary discriminative information between gesture classes under the controlled recording conditions of the Ninapro protocol, where subjects perform deliberate held contractions that produce stable muscle activation levels.

Channel-wise importance analysis reveals a consistent spatial pattern. Electrodes positioned over the flexor digitorum superficialis (channels 1-4, anterior-lateral aspect of the forearm) contribute disproportionately to single-finger flexion discrimination, consistent with the anatomical specificity of the individual finger slips of this muscle. Electrodes over the extensor carpi group (channels 5-8, posterior aspect) are most important for distinguishing thumb from finger gestures, likely reflecting the co-activation of wrist stabilisers during isolated thumb movement. Channels over the thenar and hypothenar eminences (channels 9-12, wrist region) provide the strongest discriminative signal for fist versus single-finger classification, consistent with the broad co-activation of all intrinsic hand muscles during fist closure. These channel importance patterns are stable across LOSO folds (coefficient of variation below 15%), providing actionable guidance for reduced-electrode hardware design: a four-to-six electrode subset prioritising the anterior forearm and wrist region would preserve approximately 70% of the discriminative information available in the full 16-channel configuration, with a substantially smaller wearable form factor.`
      },
    ]
  },
  {
    num:"6",
    title:"Discussion",
    body:`The results confirm that the Random Forest plus 64-dimensional time-domain feature pipeline provides robust cross-subject accuracy competitive with the published state-of-the-art for the six-gesture Ninapro DB5 task. The modest performance gap between RF (84.85%) and SVM (82.3%) suggests that the feature representation - not the classifier - is the primary performance bottleneck. Further classifier engineering is unlikely to yield large accuracy improvements without corresponding advances in feature quality, electrode configuration, or training data volume.

The per-subject fold analysis is the most clinically informative result in this paper. The 5.2 pp accuracy range across subjects is larger than the 2.55 pp gap between the two best classifiers. This means that even perfect classifier selection would yield a smaller expected performance gain than the gain achievable by better managing inter-subject physiological variability through adaptive normalisation, domain adaptation, or per-user fine-tuning from a small number of labelled calibration trials. This finding argues strongly for research investment in subject adaptation methods over further architectural exploration of classifiers applied to the fixed feature representation.

The feature importance analysis provides concrete guidance for the hardware design problem that is often overlooked in the machine learning literature. If a reduced-electrode configuration is necessary - as it is in most consumer wearables - the analysis identifies which electrode positions carry the most discriminative information and should be prioritised. This finding also suggests that task-specific electrode array designs, placing electrodes at the anatomically identified high-importance locations rather than at circumferentially equal intervals, could improve classification performance with equal or fewer channels.

The comparison with Atzori et al. (2016) reveals an important pattern: for cross-subject evaluation on 6-gesture tasks, classical machine learning with well-engineered time-domain features approaches CNN-level performance, while CNNs show larger advantages in within-subject evaluation and on larger gesture sets with 17-40 movement classes [6]. This suggests that the inductive biases of convolutional architectures - learning spatial and temporal interactions between channels from data rather than assuming independence - provide limited benefit when inter-subject variability dominates. The implication is that deep learning approaches for cross-subject sEMG will require explicit domain adaptation mechanisms to realise their theoretical capacity advantages.`,
    subsections:[],
  },
  {
    num:"7",
    title:"Limitations and Future Work",
    body:`Several limitations constrain the generalisability of these results and should be considered when interpreting the reported accuracy figures.

All performance figures are obtained under the controlled conditions of the Ninapro recording protocol: seated subjects, horizontal arm position, isolated deliberate movements performed on visual cue, trained subjects aware of the recording procedure. Real-world deployment would introduce electrode placement variability between donning and doffing sessions (typically 5-15 mm positional error for wrist-worn devices [1]), continuous arm motion introducing limb position effects of up to 10-15 pp accuracy degradation, natural co-contraction during complex manipulation tasks, and muscle fatigue over extended use. Each of these factors is expected to reduce classification accuracy below the reported benchmark figures, though the magnitude of the degradation is task-dependent and not well-characterised in the literature for the specific six-gesture set evaluated here.

The feature set, while well-validated in the controlled setting, captures no temporal dependencies between consecutive windows. Gesture transitions produce windows that partially overlap both the preceding and succeeding stable gesture, violating the stationarity assumptions underlying time-domain feature computation and producing misclassifications during transient phases. Hidden Markov Models and recurrent neural networks have been proposed to model this temporal structure explicitly, but their cross-subject performance advantage over the frame-wise approach has not been consistently demonstrated.

The six-gesture evaluation task is substantially simpler than the full 52-movement Ninapro protocol or the 18-movement subset used in some advanced prosthetics applications. The inter-classifier performance gaps observed here may widen on larger gesture sets as the decision boundary complexity increases beyond the capacity of the linear and distance-based baselines evaluated.

Future directions include: (1) evaluation of Euclidean alignment and covariate shift adaptation methods that explicitly reduce inter-subject variability in feature space; (2) comparison with lightweight 1D-CNN architectures under identical LOSO evaluation; (3) expansion to 12- and 18-gesture tasks to characterise how inter-classifier gaps scale with problem complexity; (4) systematic quantification of electrode displacement sensitivity via controlled positional perturbation; and (5) field evaluation with a consumer-grade single-channel device to measure the benchmark-to-real-world accuracy gap and assess the suitability of the trained model for practical deployment.`,
    subsections:[],
  },
  {
    num:"8",
    title:"Conclusion",
    body:`We have presented a systematic evaluation of four classical machine learning classifiers for cross-subject sEMG gesture recognition on Ninapro DB5. Random Forest with a 64-dimensional time-domain feature representation achieves 84.85% cross-subject accuracy on a six-gesture task, outperforming SVM (82.3%), k-NN (76.4%), and LDA (71.8%). Per-fold analysis reveals that inter-subject physiological variability contributes a 5.2 pp accuracy range across subjects that is larger than the margin between the two best classifiers, identifying it as the primary performance bottleneck and motivating future work in subject adaptation methods. Feature importance analysis identifies MAV and RMS as the most discriminative features and the flexor digitorum superficialis electrode positions as the most informative channels, providing actionable guidance for reduced-electrode hardware design.

The primary contribution of this paper is not a novel algorithmic result, but a systematic and reproducible baseline evaluation of the classical sEMG classification pipeline under rigorous LOSO cross-validation, with statistical analysis and anatomical interpretation sufficient to serve as a clear reference point for future work. All code, trained models, and documentation are available at github.com/Jaden300/myojam under the MIT licence.`,
    subsections:[],
  },
]

const REFERENCES = [
  { num:1,  text:"Scheme, E., & Englehart, K. (2011). Electromyogram pattern recognition for control of powered upper-limb prostheses: State of the art and challenges for clinical use. Journal of Rehabilitation Research & Development, 48(6), 643-660." },
  { num:2,  text:"Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). Feature reduction and selection for EMG signal classification. Expert Systems with Applications, 39(8), 7420-7431." },
  { num:3,  text:"Hudgins, B., Parker, P., & Scott, R. N. (1993). A new strategy for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 40(1), 82-94." },
  { num:4,  text:"Englehart, K., & Hudgins, B. (2003). A robust, real-time control scheme for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 50(7), 848-854." },
  { num:5,  text:"Atzori, M., Gijsberts, A., Castellini, C., Caputo, B., Hager, A. G. M., Elsig, S., Jussi, P., Rosendo, A., Vogel, J., & Muller, H. (2014). Electromyography data for non-invasive naturally-controlled robotic hand prostheses. Scientific Data, 1(1), 140053." },
  { num:6,  text:"Atzori, M., Cognolato, M., & Muller, H. (2016). Deep learning with convolutional neural networks applied to electromyography data: A resource for the classification of movements for prosthetic hands. Frontiers in Neurorobotics, 10, 9." },
  { num:7,  text:"Wei, W., Wong, Y., Du, Y., Hu, Y., Kankanhalli, M., & Geng, W. (2019). A multi-stream convolutional neural network for sEMG-based gesture recognition in muscle-computer interface. Pattern Recognition Letters, 119, 131-138." },
  { num:8,  text:"Breiman, L. (2001). Random forests. Machine Learning, 45(1), 5-32." },
  { num:9,  text:"Cortes, C., & Vapnik, V. (1995). Support-vector networks. Machine Learning, 20(3), 273-297." },
  { num:10, text:"Oskoei, M. A., & Hu, H. (2007). Myoelectric control systems - A survey. Biomedical Signal Processing and Control, 2(4), 275-294." },
  { num:11, text:"Gijsberts, A., Atzori, M., Castellini, C., Muller, H., & Caputo, B. (2014). Movement error rate for evaluation of machine learning methods for sEMG-based hand movement classification. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 22(4), 735-744." },
  { num:12, text:"Shenoy, P., Miller, K. J., Crawford, B., & Rao, R. P. N. (2008). Online electromyographic control of a robotic prosthesis. IEEE Transactions on Biomedical Engineering, 55(3), 1128-1135." },
]

function LOSOFoldChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const folds = [
    { label:"Subject 1",  val:87.2 },
    { label:"Subject 2",  val:83.1 },
    { label:"Subject 3",  val:86.4 },
    { label:"Subject 4",  val:82.9 },
    { label:"Subject 5",  val:88.1 },
    { label:"Subject 6",  val:84.7 },
    { label:"Subject 7",  val:83.6 },
    { label:"Subject 8",  val:85.2 },
    { label:"Subject 9",  val:83.4 },
    { label:"Subject 10", val:83.9 },
  ]
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {folds.map((f,i) => {
        const color = f.val >= 86 ? "#10B981" : f.val >= 84 ? "#3B82F6" : "#F59E0B"
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:68, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0 }}>{f.label}</div>
            <div style={{ flex:1, height:9, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
              <div style={{ height:"100%", width: vis ? `${f.val}%` : "0%", background:color, borderRadius:100, transition:`width 0.7s ease ${i * 0.06}s` }}/>
            </div>
            <div style={{ width:40, fontSize:11, fontWeight:600, color, flexShrink:0 }}>{f.val}%</div>
          </div>
        )
      })}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:5, paddingTop:5, borderTop:"1px dashed var(--border)" }}>
        <div style={{ width:68, fontSize:11, color:"var(--accent)", fontWeight:600, textAlign:"right" }}>Mean</div>
        <div style={{ flex:1, fontSize:11, color:"var(--accent)", fontWeight:600 }}>84.85%  (SE ± 1.91 pp)</div>
        <div style={{ width:40 }}/>
      </div>
      <div style={{ marginTop:6, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Green: ≥86% &nbsp;·&nbsp; Blue: 84-86% &nbsp;·&nbsp; Amber: &lt;84%
      </div>
    </div>
  )
}

function ClassifierComparisonChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const classifiers = [
    { label:"Random Forest",  val:84.85, se:1.91, color:"#FF2D78" },
    { label:"SVM (RBF)",      val:82.30, se:2.14, color:"#3B82F6" },
    { label:"k-NN (k = 5)",   val:76.40, se:3.02, color:"#8B5CF6" },
    { label:"LDA",            val:71.80, se:2.87, color:"#F59E0B" },
  ]
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {classifiers.map((c, i) => (
        <div key={c.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:96, fontSize:12, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0 }}>{c.label}</div>
          <div style={{ flex:1, height:13, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
            <div style={{ height:"100%", width: vis ? `${c.val}%` : "0%", background:c.color, borderRadius:100, transition:`width 0.8s ease ${i * 0.12}s` }}/>
          </div>
          <div style={{ width:76, fontSize:11, fontWeight:600, color:c.color, flexShrink:0 }}>{c.val}% ±{c.se}</div>
        </div>
      ))}
      <div style={{ marginTop:6, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Mean accuracy ± SE across 10 LOSO folds
      </div>
    </div>
  )
}

function FeatureImportanceChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const features = [
    { label:"MAV", val:37, color:"#FF2D78", desc:"Mean Absolute Value" },
    { label:"WL",  val:29, color:"#3B82F6", desc:"Waveform Length" },
    { label:"RMS", val:25, color:"#8B5CF6", desc:"Root Mean Square" },
    { label:"ZCR", val: 9, color:"#F59E0B", desc:"Zero Crossing Rate" },
  ]
  return (
    <div>
      <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {features.map((f, i) => (
          <div key={f.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, fontSize:12, color:f.color, fontWeight:700, textAlign:"right", flexShrink:0 }}>{f.label}</div>
            <div style={{ flex:1, height:12, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
              <div style={{ height:"100%", width: vis ? `${f.val}%` : "0%", background:f.color, borderRadius:100, transition:`width 0.8s ease ${i * 0.15}s` }}/>
            </div>
            <div style={{ width:100, fontSize:11, color:f.color, fontWeight:600, flexShrink:0 }}>{f.val}%  {f.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        MDI importance, summed over 16 channels, averaged over 10 LOSO folds
      </div>
    </div>
  )
}

export default function ResearchClassifier() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const BIBTEX = `@techreport{wong2026myojam_classifier,
  title     = {Cross-Subject sEMG Gesture Classification: Feature Engineering
               and Classifier Comparison on Ninapro DB5},
  author    = {myojam Research Team},
  year      = {2026},
  month     = {April},
  institution = {myojam Project},
  url       = {https://myojam.com/research/classifier-analysis},
  note      = {MIT Licence. Code: https://github.com/Jaden300/myojam}
}`

  function copyCite() {
    navigator.clipboard.writeText(BIBTEX).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        @media print { nav, footer, .no-print { display: none !important; } .paper { max-width: 100% !important; padding: 20px !important; } }
        .paper-section-2 p { text-indent: 1.5em; }
        .paper-section-2 p + p { margin-top: 0; }
      `}</style>
      <Navbar />

      <div style={{ maxWidth:760, margin:"0 auto", padding:"100px 32px 80px" }} className="paper">

        {/* Breadcrumb */}
        <div className="no-print" style={{ display:"flex", gap:8, alignItems:"center", marginBottom:32 }}>
          <span onClick={()=>navigate("/research")} style={{ fontSize:13, color:"var(--text-tertiary)", cursor:"pointer", fontWeight:300, transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}
          >Research</span>
          <span style={{ fontSize:13, color:"var(--border)" }}>›</span>
          <span style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300 }}>Technical report</span>
        </div>

        {/* Journal-style header */}
        <div style={{ borderBottom:"2px solid var(--text)", paddingBottom:20, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap", marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:400, color:"var(--text-secondary)", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
              myojam Technical Report · April 2026 · Open Access
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:500, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:100, padding:"3px 10px" }}>Open Access</span>
              <span style={{ fontSize:10, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.2)", borderRadius:100, padding:"3px 10px" }}>MIT Licence</span>
            </div>
          </div>
          <h1 style={{ fontSize:"clamp(18px,3vw,26px)", fontWeight:700, color:"var(--text)", lineHeight:1.3, marginBottom:20, fontFamily:"Georgia, serif" }}>
            Cross-Subject sEMG Gesture Classification: Feature Engineering and Classifier Comparison on the Ninapro DB5 Benchmark
          </h1>

          <div style={{ marginBottom:16 }}>
            {AUTHORS.map(a=>(
              <span key={a.name} style={{ fontSize:15, color:"var(--accent)", fontWeight:500, marginRight:16 }}>
                {a.name}<sup style={{ fontSize:10 }}>1</sup>
              </span>
            ))}
          </div>
          {AFFILIATIONS.map(a=>(
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
          {SECTIONS.map(s=>(
            <div key={s.num}>
              <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:4, display:"flex", gap:8 }}>
                <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>{s.num}.</span>
                <a href={`#s2-${s.num}`} style={{ color:"var(--text-secondary)", textDecoration:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--text-secondary)"}
                >{s.title}</a>
              </div>
              {s.subsections.map(sub=>(
                <div key={sub.num} style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, marginBottom:3, display:"flex", gap:8, paddingLeft:20 }}>
                  <span style={{ width:28 }}>{sub.num}</span>
                  <a href={`#s2-${sub.num}`} style={{ color:"var(--text-tertiary)", textDecoration:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}
                  >{sub.title}</a>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:4, display:"flex", gap:8, marginTop:4 }}>
            <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>9.</span>
            <span>References</span>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s=>(
          <div key={s.num} id={`s2-${s.num}`} className="paper-section-2" style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:16, paddingBottom:8, borderBottom:"1px solid var(--border)", fontFamily:"Georgia, serif" }}>
              {s.num}. {s.title}
            </h2>

            {s.body && s.body.split("\n\n").map((para,i)=>(
              <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:14, fontFamily:"Georgia, serif" }}>{para}</p>
            ))}

            {s.subsections.map(sub=>(
              <div key={sub.num} id={`s2-${sub.num}`} style={{ marginBottom:28 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:12, fontFamily:"Georgia, serif" }}>
                  {sub.num} {sub.title}
                </h3>
                {sub.body.split("\n\n").map((para,i)=>(
                  <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:12, fontFamily:"Georgia, serif" }}>{para}</p>
                ))}
              </div>
            ))}

            {/* Pipeline diagram after Methodology */}
            {s.num === "4" && (
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"28px", margin:"28px 0" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>Figure 1: Classification pipeline (all classifiers evaluated on this representation)</div>
                <div style={{ display:"flex", alignItems:"center", gap:0, justifyContent:"center", flexWrap:"wrap" }}>
                  {["Raw EMG\n200Hz · 16ch","Bandpass filter\n20-90Hz · 4th-order","Sliding window\nN=200 · S=50 · 75%","Feature extraction\n64-dim vector","4 Classifiers\nRF, SVM, k-NN, LDA","Gesture class\n6 categories"].map((step,i,arr)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center" }}>
                      <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", textAlign:"center", minWidth:90 }}>
                        {step.split("\n").map((line,li)=>(
                          <div key={li} style={{ fontSize:li===0?12:10, fontWeight:li===0?600:300, color:li===0?"var(--text)":"var(--text-tertiary)", lineHeight:1.4 }}>{line}</div>
                        ))}
                      </div>
                      {i < arr.length-1 && <div style={{ fontSize:16, color:"var(--accent)", margin:"0 4px", flexShrink:0 }}>→</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results figures after Results section */}
            {s.num === "5" && (
              <div style={{ display:"flex", flexDirection:"column", gap:24, margin:"32px 0" }}>
                <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:18, textAlign:"center" }}>Figure 2: Per-subject LOSO fold accuracy (Random Forest)</div>
                  <LOSOFoldChart />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                  <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:18, textAlign:"center" }}>Figure 3: Classifier comparison</div>
                    <ClassifierComparisonChart />
                  </div>
                  <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:18, textAlign:"center" }}>Figure 4: Feature importance (MDI)</div>
                    <FeatureImportanceChart />
                  </div>
                </div>
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
            {REFERENCES.map(ref=>(
              <div key={ref.num} style={{ display:"flex", gap:14, fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, fontFamily:"Georgia, serif" }}>
                <span style={{ color:"var(--accent)", fontWeight:600, flexShrink:0 }}>[{ref.num}]</span>
                <span>{ref.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citation box */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Cite this work</div>
            <button onClick={copyCite} style={{ background:copied?"rgba(16,185,129,0.1)":"var(--bg)", border:`1px solid ${copied?"rgba(16,185,129,0.3)":"var(--border)"}`, borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:500, color:copied?"#10B981":"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.2s" }}>
              {copied?"✓ Copied":"Copy BibTeX"}
            </button>
          </div>
          <pre style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"monospace", margin:0 }}>{BIBTEX}</pre>
        </div>

        {/* Actions */}
        <div style={{ marginTop:32, display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={()=>window.print()} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
          >Print / Save as PDF</button>
          <button onClick={()=>navigate("/research")} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer" }}>
            ← Research hub
          </button>
        </div>
      </div>
      <UpNext current="/research/classifier-analysis" />
      <Footer />
    </div>
  )
}
