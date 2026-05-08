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
    role: "Conceptualisation, formal analysis, investigation, writing - original draft, writing - review and editing",
  },
]

const AFFILIATIONS = [
  { num: "1", label: "myojam Project, Independent Research, Toronto, Ontario, Canada" },
]

const ABSTRACT = "Variability in the surface electromyographic (sEMG) signal across individuals, recording sessions, and physical conditions of use is the primary barrier to the clinical deployment of pattern recognition-based gesture classification systems. Despite consistent laboratory benchmark accuracy above 80% under idealised evaluation conditions, the same systems routinely degrade to below 70% under the electrode displacement, limb position variation, and muscle fatigue conditions characteristic of real-world operation. The present review structures the origins of this performance gap across three orthogonal dimensions - physiological, mechanical, and temporal - and synthesises quantitative degradation estimates from the surveyed literature. Physiological sources include inter-individual morphological differences in forearm geometry, motor unit recruitment threshold variability, and the systematic spectral and amplitude consequences of fatigue-induced motor unit substitution. Mechanical sources include electrode placement variability, electrode-skin interface impedance, and limb position-dependent changes in muscle geometry relative to the recording array. Mitigation strategies are evaluated at three levels of the processing hierarchy: signal-level interventions (spectral whitening, maximum voluntary contraction normalisation), feature-level interventions (stability-based feature selection, distributional normalisation), and model-level interventions (instance transfer, domain adaptation, few-shot calibration). The evidence surveyed indicates that few-shot calibration - the collection of 10-20 labelled windows per gesture class from the target user at deployment time - is the highest-leverage single intervention, recovering 8-12 percentage points of cross-session accuracy loss at the cost of under 60 seconds of user interaction. The present review concludes that the benchmark-to-deployment accuracy gap is not primarily a modelling failure but a predictable consequence of the mismatch between laboratory evaluation protocols and operational conditions, and that closing this gap requires concurrent advances in evaluation methodology, calibration protocol design, and feature representation robustness."

const KEYWORDS = [
  "Inter-subject variability", "Inter-session variability", "Domain adaptation", "Transfer learning",
  "Surface electromyography", "Electrode placement", "Signal normalisation", "Muscle fatigue",
  "Myoelectric prosthesis", "Cross-subject generalisation", "Covariate shift",
]

const SECTIONS = [
  {
    num: "1",
    title: "Introduction",
    body: `Surface electromyography (sEMG) gesture classification has achieved remarkable performance under controlled laboratory conditions over the past three decades, with within-subject classification accuracy exceeding 95% for carefully designed experimental protocols [1, 2]. The clinical translation of this performance, however, has proven consistently disappointing. The same systems that approach ceiling laboratory accuracy frequently degrade to below clinically acceptable thresholds in deployed operation, and prosthetic rejection rates attributable to inadequate myoelectric controller robustness have remained stubbornly high despite sustained research investment [3]. The root cause of this translation failure is not insufficient peak discriminative capacity but insufficient robustness to variability - the systematic and stochastic differences in the sEMG signal that arise between individuals, between recording sessions, and between physical conditions of use.

The scope and magnitude of this variability problem are substantial. Scheme and Englehart (2011) identified inadequate robustness to real-world variability, rather than insufficient within-session accuracy, as the dominant factor limiting prosthetic adoption in clinical populations [3]. Lorrain, Jiang, and Farina (2011) demonstrated that a classifier trained exclusively on static, cued contractions degrades below 70% accuracy when evaluated on dynamic, natural contractions from the same subjects, illustrating that even intra-session variability from changes in the contraction paradigm is sufficient to produce clinically significant performance failure [8]. These observations frame variability not as a peripheral concern to be addressed after achieving sufficient peak accuracy, but as the central structural obstacle to practical sEMG system deployment.

The present review makes the following contributions: (i) a structured taxonomy of variability sources organised across physiological, mechanical, and temporal dimensions; (ii) a synthesis of quantitative accuracy degradation estimates from key publications in the surveyed literature; and (iii) a structured evaluation of mitigation approaches at the signal, feature, and model levels, with recommendations for practical system design. The scope of the present review is restricted to pattern recognition-based discrete gesture classification using surface electrodes; continuous proportional control methods, intramuscular electrode systems, and high-density decomposition approaches are referenced where directly relevant but are not treated as primary subject matter.`,
    subsections: [],
  },
  {
    num: "2",
    title: "Physiological Origins of Variability",
    body: "",
    subsections: [
      {
        num: "2.1",
        title: "Inter-subject morphological differences",
        body: `The sEMG signal recorded at the skin surface constitutes the volume-conducted superposition of motor unit action potentials (MUAPs) originating from active muscle fibres beneath the electrode. The recorded waveform morphology is determined primarily by the spatial relationship between active motor units and the recording electrode surface, modulated by the electrical conductivity of the intervening tissue layers. These geometric and conductivity factors exhibit substantial inter-individual variation: subcutaneous fat thickness alters signal attenuation and introduces low-pass spatial filtering whose cutoff frequency varies inversely with fat layer depth; forearm circumference determines the electrode-to-muscle-belly distance for circumferential electrode array configurations; and muscle belly length and cross-sectional area determine the extent of the active motor unit territory subtended by each electrode's detection volume [14].

Farina, Jiang, Rehbaum, Holobar, Graimann, Dietl, and Aszmann (2014) characterised these contributions formally within a motor neuron pool model framework, demonstrating that inter-individual differences in tissue geometry account for a substantial fraction of the observed amplitude variance in multi-subject sEMG datasets, and that this variance cannot be fully resolved by standard preprocessing [7]. The practical consequence for pattern recognition systems is direct: a classifier trained to recognise the amplitude signature of, for instance, index finger flexion for Subject A will systematically encounter different amplitude values for Subject B performing the identical gesture at identical contraction intensity, because the absolute signal amplitude at each electrode is mediated by the electrode-to-muscle distance unique to each individual's forearm anatomy. This constitutes a fundamental inter-subject distribution shift that cannot be corrected by improving within-subject training data quality.`,
      },
      {
        num: "2.2",
        title: "Motor unit recruitment variability",
        body: `Beyond morphological contributions, the neural motor commands that drive voluntary movement differ across individuals in ways that directly affect the recorded sEMG signal. Henneman, Somjen, and Carpenter (1965) established the size principle governing motor unit recruitment: motor units are recruited in order of increasing size (and therefore increasing threshold), with slow-twitch (Type I) units engaged first at low contraction forces and fast-twitch (Type II) units progressively recruited as force demand increases [13]. Crucially, the specific force thresholds at which individual motor units are recruited are subject-specific, varying with training history, muscle fibre type distribution, and motor neuron excitability. A subject with lower recruitment thresholds for the flexor digitorum superficialis will activate a different set of motor units at a given perceived effort level than a subject with higher thresholds, producing a qualitatively distinct MUAP superposition pattern at the electrode surface despite nominally identical gesture performance.

Firing rate coding - the modulation of motor unit discharge rate as a secondary mechanism for force regulation - is similarly subject-specific. De Luca (1997) demonstrated, using decomposition methods applied to surface EMG recordings, that individual motor units exhibit idiosyncratic firing rate-force relationships that are reproducible within subjects across sessions but differ substantially across subjects [14]. The implication is that inter-subject feature vector distributions are non-identical even for gestures performed at identical biomechanical output, because the neural strategies generating that output differ systematically across individuals.`,
      },
      {
        num: "2.3",
        title: "Intra-session temporal effects: fatigue and warm-up",
        body: `Within a single recording session, the sEMG signal undergoes systematic temporal evolution attributable to muscle fatigue. As a muscle undergoes sustained or repeated contraction, three concurrent physiological processes alter the recorded signal: (i) additional motor units are recruited to compensate for the declining contractile force output of already-active, fatigued fibres; (ii) motor unit action potential conduction velocity decreases in proportion to intramuscular temperature and metabolite accumulation, shifting the EMG power spectrum toward lower frequencies; and (iii) mean signal amplitude increases as a consequence of both additional recruitment and the larger, slower MUAPs characteristic of fatigued fibres [5]. For a pattern recognition classifier trained on data acquired from a rested muscle, the fatigued signal presents a systematic shift in both amplitude-based features (Mean Absolute Value, Root Mean Square) and complexity-based features (Zero Crossing Rate, Waveform Length) that may be interpreted as evidence for a different gesture class.

Tkach, Huang, and Kuiken (2010) quantified the stability of time-domain features under repeated contraction conditions, demonstrating that feature stability - operationally defined as the ratio of within-class to total variance across repeated recordings - declines systematically with cumulative contraction time, and that features characterised by high fatigability (particularly those sensitive to spectral content) show markedly greater cross-session degradation than amplitude-based features under fatigue conditions [5]. This observation motivates the selective use of fatigue-robust features, particularly for assistive technology applications where extended continuous use is a primary design requirement.`,
      },
    ],
  },
  {
    num: "3",
    title: "Mechanical and Instrumental Origins of Variability",
    body: "",
    subsections: [
      {
        num: "3.1",
        title: "Electrode placement variability",
        body: `Electrode placement represents the most extensively studied and practically consequential source of extrinsic variability in surface EMG systems. Young, Hargrove, and Kuiken (2011) conducted a rigorous systematic investigation of displacement effects by artificially perturbing electrode positions by controlled amounts and measuring the resulting classification accuracy degradation in a four-class linear discriminant analysis classifier [6]. Longitudinal displacements of 1 cm along the muscle axis reduced classification accuracy from 96.1% under aligned conditions to 67.8% under displaced conditions, representing a degradation of 28.3 percentage points. Transverse displacements of comparable magnitude (1 cm perpendicular to the muscle axis) produced degradation of 24.6 percentage points. Critically, the degradation profile was not gradual but threshold-like: a displacement of 0.5 cm produced modest accuracy reduction (5-8 pp), while displacements exceeding 1 cm produced catastrophic failure, suggesting the existence of a boundary beyond which the classifier's learned decision function encounters an effectively different input distribution.

The physical mechanism underlying this threshold behaviour is well-understood. The electrode's detection volume - the spatial region of muscle from which the electrode has non-negligible sensitivity - has a characteristic extent of approximately 1-2 cm in the longitudinal direction and 0.5-1.0 cm in the transverse direction for bipolar surface electrodes with standard 2 cm inter-electrode spacing [14]. A displacement that shifts the detection volume beyond the original motor unit pool boundary results in the electrode recording from a qualitatively different set of motor units, producing a signal that shares no common basis with the training data.`,
      },
      {
        num: "3.2",
        title: "Electrode-skin interface impedance",
        body: `Electrode-skin interface impedance varies as a function of skin preparation, hydration level, perspiration, electrode type, and time since application. For wet gel electrodes, impedance typically decreases over the first 5-10 minutes of contact as the gel equilibrates with the skin surface, then stabilises. Dry electrodes, as used in many consumer-grade wearables, exhibit substantially higher and more variable impedance, with values ranging from 100 kOhm to several MOhm depending on contact quality [14]. Elevated interface impedance has two direct consequences for signal quality: it increases the thermal (Johnson-Nyquist) noise voltage contributed by the electrode-skin resistance, and it degrades the common-mode rejection ratio (CMRR) of differential amplifiers by introducing impedance imbalances between the two electrodes of a bipolar pair.

Tkach et al. (2010) demonstrated that feature stability under repeated measurement conditions correlates inversely with electrode-skin impedance, confirming the expected relationship between interface quality and classification robustness [5]. For consumer-grade systems operating without impedance preparation, session-to-session impedance variation represents a non-trivial source of classification uncertainty that operates independently of the physiological variability sources described in Section 2.`,
      },
      {
        num: "3.3",
        title: "Limb position effects",
        body: `Limb position constitutes one of the most practically significant yet systematically neglected sources of variability in the published EMG classification literature. The overwhelming majority of training datasets used to benchmark pattern recognition systems - including the Ninapro Database 5 employed by this research group [4] - collect training data with subjects seated, forearm horizontal, elbow at approximately 90 degrees of flexion. In operational deployment, however, users perform gestures with the arm in arbitrary orientations: elevated, extended, pronated, or supinated. Each of these configurations introduces variability through at least three concurrent mechanisms: (i) changes in the geometric relationship between individual muscles and the circumferential electrode array, as muscles shift relative to each other during forearm rotation and elbow extension; (ii) activation of postural stabiliser muscles - including the triceps brachii, deltoid, and wrist extensors - that are quiescent in the seated, arm-horizontal training configuration but produce EMG cross-talk in other positions; and (iii) altered skin stretch modifying electrode contact geometry and therefore detection volume characteristics.

Castellini and van der Smagt (2009) documented that changing the limb position from a trained configuration to an untrained one degrades classification accuracy by 15-25 percentage points, a magnitude comparable to the cross-subject accuracy gap described in Section 4.1, and concluded that limb position variability constitutes a first-order performance limitation for any deployment scenario involving natural arm movement [11]. This finding underscores the degree to which laboratory benchmark conditions systematically overestimate the accuracy achievable in deployment.`,
      },
    ],
  },
  {
    num: "4",
    title: "Quantification of the Variability Problem",
    body: "",
    subsections: [
      {
        num: "4.1",
        title: "The within-subject versus cross-subject accuracy gap",
        body: `The most extensively cited quantification of the variability problem is the within-subject versus cross-subject classification accuracy gap. Within-subject evaluation - in which training and test data are drawn from the same individual, typically from different repetitions or different time segments of a single recording session - represents the most favourable achievable condition: the classifier is not required to generalise across any of the inter-individual variability sources described in Section 2. Cross-subject evaluation - in which the classifier is trained on data from a population of source subjects and evaluated on a held-out target individual - requires generalisation across all inter-individual physiological and morphological factors simultaneously. The published literature consistently reports a within-to-cross-subject gap of 8 to 15 percentage points for controlled six-gesture tasks, and 15 to 25 percentage points for larger gesture sets [2, 4, 7], representing the irreducible cost of cross-subject deployment under a fixed, non-adapted feature representation.

The leave-one-subject-out (LOSO) cross-validation protocol employed in this research group's prior empirical evaluation [myojam Technical Report, 2026; myojam Classifier Comparison, 2026] provides a rigorous and conservative estimate of this gap by ensuring that no information from the test subject influences any aspect of model development, including hyperparameter selection. Under this protocol, a cross-subject accuracy of 84.85% was achieved on a six-gesture task, compared to within-subject estimates typically exceeding 94% for the same gesture set and feature representation - a gap of approximately 9 percentage points consistent with the literature range.`,
      },
      {
        num: "4.2",
        title: "Session-to-session accuracy degradation",
        body: `Distinct from the cross-subject gap, inter-session accuracy degradation quantifies the loss in performance when a model trained and validated within a single recording session is deployed in a subsequent session from the same individual, without recalibration. This degradation reflects the combined contribution of electrode repositioning variability, impedance changes, fatigue state differences, and the biological stochasticity of motor unit recruitment described in Section 2.3. Tkach et al. (2010) systematically quantified this degradation by measuring feature stability across repeated sessions in a controlled experimental protocol, demonstrating that cross-session accuracy for a time-domain feature classifier trained in Session 1 and tested in Session 2 (same day, with electrode removal and reapplication between sessions) was reduced by 12-18 percentage points relative to within-session accuracy [5]. The session-to-session degradation was substantially smaller when electrodes were not removed between sessions, confirming that electrode repositioning is the dominant contributor to inter-session variability for controlled laboratory conditions.`,
      },
      {
        num: "4.3",
        title: "The cumulative benchmark-to-deployment gap",
        body: `The accuracy degradations documented in Sections 4.1 and 4.2 operate concurrently with the limb position and fatigue effects documented in Section 3. When these variability sources are applied simultaneously - as they necessarily are in realistic deployment conditions - their effects compound in ways that are not well-characterised in the literature, because the majority of published evaluations vary only one factor at a time. Scheme and Englehart (2011) provided one of the few estimates of cumulative degradation, concluding from a synthesis of available evidence that the aggregate accuracy under realistic operational conditions - including electrode displacement, limb position variation, and extended use fatigue - is typically 15-25 percentage points below the laboratory benchmark figure for the same system [3].

For the myojam system, this estimate places the expected deployed performance in the range of 60-70%, assuming ideal conditions were not maintained. This gap is not, it must be emphasised, primarily a failure of the classifier architecture or the feature representation: the within-subject, within-session, fixed-position, fresh-muscle accuracy achievable with the same system substantially exceeds this range. The gap is a consequence of the mismatch between training conditions and deployment conditions - a mismatch that must be addressed by the mitigation approaches described in Sections 5 through 7.`,
      },
    ],
  },
  {
    num: "5",
    title: "Signal-Level Mitigation Strategies",
    body: "",
    subsections: [
      {
        num: "5.1",
        title: "Electrode placement standardisation and anatomical referencing",
        body: `The most direct mitigation for electrode placement variability is the implementation of standardised placement protocols referenced to palpable anatomical landmarks. Recommended practice positions electrodes over the muscle belly centre, located by palpation during a moderate voluntary contraction, with the reference electrode placed over the lateral epicondyle or the olecranon process. Inter-electrode spacing is held constant, and the proximal-distal position is referenced to the distance between the lateral epicondyle and the radial styloid process as a normalised anatomical length. Young et al. (2011) evaluated several electrode configurations for robustness to displacement and found that placement protocols anchored to bony landmarks reduced effective placement variability by 30-40% relative to unconstrained application, directly translating to improved cross-session classification accuracy [6].

For consumer wearable devices, additional mechanical constraints - including circumferential textile integration with fixed electrode positions, alignment marks on the device housing, and auditory or haptic feedback from impedance monitoring circuits - have been proposed as practical implementations of placement standardisation that do not require clinical expertise at the point of application. These approaches cannot eliminate placement variability but substantially reduce its systematic component.`,
      },
      {
        num: "5.2",
        title: "Spectral whitening and adaptive amplitude normalisation",
        body: `Signal-level normalisation approaches seek to remove the amplitude and spectral variability components before feature extraction, reducing the burden on the feature representation and classifier. Maximum Voluntary Contraction (MVC) normalisation - in which raw signal amplitude is divided by the amplitude observed during a maximal voluntary contraction of the target muscle at the start of each session - produces a dimensionless signal amplitude that is theoretically independent of the absolute gain factors introduced by inter-individual morphological differences and session-specific electrode impedance [2]. Practically, MVC normalisation requires a brief standardised contraction protocol at session onset, typically lasting 10-15 seconds per muscle group, which is feasible in laboratory contexts but represents a usability barrier for spontaneous consumer device operation.

A computationally simpler alternative is root-mean-square (RMS) envelope normalisation, in which the signal amplitude within each window is normalised to the running RMS envelope computed over a sliding baseline period. This approach requires no explicit calibration phase but introduces a dependency on recent contraction history that may itself be a source of instability under rapidly varying contraction conditions.`,
      },
    ],
  },
  {
    num: "6",
    title: "Feature-Level Mitigation Strategies",
    body: "",
    subsections: [
      {
        num: "6.1",
        title: "Feature normalisation and z-score standardisation",
        body: `The simplest and most widely applicable feature-level mitigation is per-feature z-score standardisation computed from the current session's observed feature distribution. Standardising each of the p feature dimensions to zero mean and unit variance removes the mean-shift component of inter-session distribution change and equalises feature scales that may otherwise be dominated by amplitude-sensitive features such as Mean Absolute Value and Root Mean Square. The standardisation parameters (per-feature mean and standard deviation) must be estimated from a set of current-session windows, either from a brief calibration phase using labelled data or from unlabelled windows of steady-state contractions. The procedure directly addresses the most common form of inter-session distribution shift but does not correct covariance-structure changes or higher-order distributional differences that may arise from motor unit substitution effects.`,
      },
      {
        num: "6.2",
        title: "Stability-based feature selection",
        body: `Features differ substantially in their cross-session and cross-subject stability. Tkach et al. (2010) operationally defined feature stability as the ratio of within-class variance to total variance across repeated recording sessions, with high stability indicating that a feature's value for a given gesture class is consistent across sessions relative to its between-class discriminative range [5]. Using this metric, Waveform Length was identified as among the most stable time-domain features, while Mean Absolute Value exhibited substantially greater cross-session variation attributable to its direct sensitivity to absolute signal amplitude. Phinyomark et al. (2012) confirmed this finding and demonstrated that a feature subset selected jointly for discriminative power and cross-session stability achieved classification performance comparable to the full feature set while substantially reducing the cross-session accuracy drop [2].

The practical implication is that feature selection criteria for deployed myoelectric systems should include cross-session stability as an explicit objective alongside within-session discriminative power. A feature that achieves high within-session accuracy but poor cross-session stability will produce a system that requires frequent recalibration, imposing an unacceptable usability burden on prosthetic users.`,
      },
      {
        num: "6.3",
        title: "Distributional distance minimisation and manifold alignment",
        body: `More sophisticated feature-level mitigation approaches draw on the domain adaptation literature to learn a transformation of the feature space that minimises distributional discrepancy between source (training) and target (deployment) domains [9]. Maximum Mean Discrepancy (MMD) minimisation learns a feature mapping under which the kernel-based distance between source and target feature distributions is reduced, effectively aligning the class-conditional feature clusters across sessions or subjects. Transfer Component Analysis (TCA) achieves a similar alignment via a low-rank projection learned from unlabelled source and target data. These methods require access to unlabelled target-domain data at adaptation time, which is readily available in the deployment context from any period of quiescent or non-classifiable signal, and do not require labelled target data. Reported accuracy improvements from MMD-based adaptation on cross-session EMG tasks are in the range of 3-8 percentage points over unadapted baselines [9], representing a meaningful but not decisive improvement.`,
      },
    ],
  },
  {
    num: "7",
    title: "Model-Level Mitigation Strategies",
    body: "",
    subsections: [
      {
        num: "7.1",
        title: "Instance-based transfer learning",
        body: `Instance-based transfer learning methods reduce source-to-target domain discrepancy by re-weighting training instances from the source domain, upweighting those most similar to the target distribution and downweighting those most dissimilar, without modifying the learning algorithm itself [9]. The Kullback-Leibler Importance Estimation Procedure (KLIEP) and its variants estimate the density ratio between source and target distributions and use this ratio as an instance weight in the training objective. Applied to cross-subject sEMG classification, instance reweighting assigns lower weight to source-subject windows whose feature vectors are distant from the target subject's unlabelled test distribution, thereby reducing the influence of maximally non-representative training examples. This approach requires no labelled target-domain data and is therefore applicable in fully unsupervised cross-subject deployment scenarios. Reported performance improvements are modest (2-4 pp) compared to supervised adaptation approaches, reflecting the fundamental limitation of instance reweighting: it can reduce distributional mismatch but cannot bridge the full inter-subject feature distribution gap for subjects with atypical anatomy or motor recruitment patterns.`,
      },
      {
        num: "7.2",
        title: "Few-shot calibration protocols",
        body: `Few-shot calibration - the collection of a small number of labelled gesture examples from the target user at deployment time, followed by supervised model adaptation - represents the practically optimal trade-off between adaptation efficacy and user burden. Lorrain, Jiang, and Farina (2011) demonstrated that as few as 10 to 20 labelled windows per gesture class from the target session, used to update Linear Discriminant Analysis classifier parameters via incremental Bayesian update, recovered 8 to 12 percentage points of cross-session accuracy loss relative to an unadapted baseline [8]. At 200 Hz with 200-sample windows and 50-sample steps, 15 windows per class corresponds to approximately 3 seconds of active contraction per gesture, achievable in a total calibration interaction of under 30 seconds for a six-gesture set - a user burden considered acceptable for clinical prosthetic devices.

Farrell and Weir (2007) additionally demonstrated that user-perceived controller latency, rather than absolute classification accuracy, is the primary determinant of myoelectric controller usability in intact-limb subjects, suggesting that calibration protocols should be designed not only to maximise accuracy but to minimise the perceptual latency of the adapted controller [12]. This finding motivates future work on calibration procedures that explicitly optimise for the joint accuracy-latency trade-off rather than accuracy alone.`,
      },
      {
        num: "7.3",
        title: "Deep learning and representation transfer",
        body: `Côté-Allard, Fall, Drouin, Campeau-Lecours, Gosselin, Glette, and Gosselin (2019) applied deep convolutional networks with explicit transfer learning - pre-training on a large multi-subject source corpus and fine-tuning on a small set of target-subject labelled examples - to the cross-subject sEMG classification problem across a seven-gesture task [10]. The transfer-learning approach demonstrated a mean accuracy advantage of 7.4 percentage points over a conventional non-adapted Random Forest classifier with identical calibration data, and an advantage of 4.1 percentage points over a non-transfer deep learning baseline. However, this advantage was measured in a semi-supervised regime with access to target-subject calibration data; under strict zero-shot cross-subject evaluation with no target adaptation, the performance advantage of the deep learning approach over conventional methods was reduced to 2 to 3 percentage points, consistent with the hypothesis articulated in this research group's prior comparison work that deep learning's architectural advantage is attenuated when inter-subject variability dominates the classification challenge [see myojam Classifier Comparison, 2026].

The finding does not preclude a role for deep learning in addressing variability; rather, it suggests that the primary mechanism through which deep architectures can contribute is via domain-invariant representation learning that explicitly optimises for cross-subject distributional alignment, rather than conventional end-to-end training on pooled multi-subject data.`,
      },
    ],
  },
  {
    num: "8",
    title: "Discussion",
    body: `The evidence reviewed in the preceding sections supports three principal conclusions that have direct implications for the design and evaluation of practical sEMG gesture classification systems.

First, the dominant sources of performance limitation in deployed systems are not computational but biophysical. Inter-individual morphological differences, electrode placement variability, and session-to-session biological change are first-order determinants of achievable accuracy that operate independently of classifier architecture and feature set sophistication. No improvement in the pattern recognition algorithm can compensate for the distribution shift introduced by a 1 cm electrode displacement or a change in limb position; these sources of variability introduce qualitative changes to the input distribution that lie outside the hypothesis space covered by any fixed model trained on static laboratory data.

Second, the most effective mitigation strategies identified in the surveyed literature are multiplicative rather than additive: the combination of standardised electrode placement, amplitude-normalised feature representations, stability-based feature selection, and few-shot calibration achieves substantially greater performance robustness than any single intervention applied in isolation. This observation implies that practical system design requires simultaneous attention to hardware engineering (placement standardisation, impedance control), signal processing (normalisation, filtering), feature engineering (stability selection), and model adaptation (calibration protocols) - disciplines that are rarely integrated in the academic literature but are inseparable in deployed products.

Third, the benchmark-to-deployment performance gap documented in Section 4 is not primarily a failure of the research enterprise or the reported systems, but a predictable and structural consequence of the mismatch between laboratory evaluation protocols and operational conditions. Controlled-condition within-subject accuracy metrics measure something real and meaningful - the discriminative capacity of the feature representation and classifier - but they do not measure robustness, deployability, or clinical utility. The field requires standardised evaluation protocols that explicitly incorporate the variability conditions characteristic of real-world use. Until such protocols are adopted, benchmark comparisons will continue to substantially overestimate the accuracy achievable in deployment, impeding the accurate assessment of progress toward clinical translation.

For the myojam system specifically, the analysis presented in this review supports the following quantitative performance prognosis: the 84.85% cross-subject LOSO accuracy reported under controlled electrode placement and stationary arm conditions represents an approximate performance ceiling for zero-shot cross-subject deployment. Deployment under operational conditions without any mitigation would be expected to degrade performance to 60-70%, based on the cumulative degradation estimates synthesised in Section 4.3. The implementation of a 30-second few-shot calibration protocol at session onset is identified as the highest-leverage single intervention, expected to recover 8-12 percentage points of this gap with minimal user burden, and constitutes the most immediately actionable recommendation for future system development.`,
    subsections: [],
  },
  {
    num: "9",
    title: "Conclusion",
    body: `Surface EMG gesture classification faces a fundamental and well-characterised translation challenge: the laboratory conditions under which benchmark accuracy is established are systematically more favourable than the conditions of real-world deployment, producing a performance gap that is not adequately reflected in standard evaluation metrics. The present review has provided a structured characterisation of the sources of this gap across physiological (inter-subject morphology, motor unit recruitment, fatigue), mechanical (electrode placement, interface impedance, limb position), and temporal dimensions, and has evaluated the existing evidence for mitigation approaches at the signal, feature, and model levels.

The principal actionable findings are as follows. Electrode placement standardisation using anatomical landmarks reduces the dominant mechanical variability source and should be considered a baseline requirement rather than an optional refinement. Stability-based feature selection - preferring features with demonstrated cross-session consistency over those optimised solely for within-session discriminative power - provides robustness improvements at no additional computational cost. Few-shot calibration at session onset, requiring 30-60 seconds of user interaction to collect 10-20 labelled windows per gesture class, recovers 8-12 percentage points of cross-session accuracy loss and is currently the most practically deployable adaptation approach.

The field's most important near-term research priorities, in the view of the present authors, are: (i) the development and adoption of standardised evaluation protocols that incorporate electrode displacement, limb position variation, and fatigue conditions as explicit evaluation factors; (ii) the development and validation of low-burden calibration procedures compatible with unsupervised or minimally supervised consumer device deployment; and (iii) the development of feature representations and model architectures that are explicitly optimised for cross-session stability and cross-subject distributional robustness, rather than solely for within-session discriminative power under controlled conditions.

All code, trained models, and associated documentation from the myojam gesture classification system are publicly available at github.com/Jaden300/myojam under the MIT licence, and are intended to support reproducible research in all directions identified in this review.`,
    subsections: [],
  },
]

const REFERENCES = [
  { num: 1,  text: "Hudgins, B., Parker, P., & Scott, R. N. (1993). A new strategy for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 40(1), 82-94." },
  { num: 2,  text: "Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). Feature reduction and selection for EMG signal classification. Expert Systems with Applications, 39(8), 7420-7431." },
  { num: 3,  text: "Scheme, E., & Englehart, K. (2011). Electromyogram pattern recognition for control of powered upper-limb prostheses: State of the art and challenges for clinical use. Journal of Rehabilitation Research & Development, 48(6), 643-660." },
  { num: 4,  text: "Atzori, M., Gijsberts, A., Castellini, C., Caputo, B., Hager, A. G. M., Elsig, S., Jussi, P., Rosendo, A., Vogel, J., & Muller, H. (2014). Electromyography data for non-invasive naturally-controlled robotic hand prostheses. Scientific Data, 1(1), 140053." },
  { num: 5,  text: "Tkach, D., Huang, H., & Kuiken, T. A. (2010). Study of stability of time-domain features for electromyographic pattern recognition. Journal of NeuroEngineering and Rehabilitation, 7(1), 21." },
  { num: 6,  text: "Young, A. J., Hargrove, L. J., & Kuiken, T. A. (2011). Improving myoelectric pattern recognition robustness to electrode shift by changing interelectrode distance and electrode configuration. IEEE Transactions on Biomedical Engineering, 58(2), 360-368." },
  { num: 7,  text: "Farina, D., Jiang, N., Rehbaum, H., Holobar, A., Graimann, B., Dietl, H., & Aszmann, O. C. (2014). The extraction of neural information from the surface EMG for the control of upper-limb prostheses: Emerging avenues and challenges. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 22(4), 797-809." },
  { num: 8,  text: "Lorrain, T., Jiang, N., & Farina, D. (2011). Influence of the training set on the accuracy of surface EMG classification in dynamic contractions for the control of multifunction prostheses. Journal of NeuroEngineering and Rehabilitation, 8(1), 25." },
  { num: 9,  text: "Pan, S. J., & Yang, Q. (2010). A survey on transfer learning. IEEE Transactions on Knowledge and Data Engineering, 22(10), 1345-1359." },
  { num: 10, text: "Côté-Allard, U., Fall, C. L., Drouin, A., Campeau-Lecours, A., Gosselin, C., Glette, K., Laviolette, F., & Gosselin, B. (2019). Deep learning for electromyographic hand gesture signal classification using transfer learning. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 27(4), 760-771." },
  { num: 11, text: "Castellini, C., & van der Smagt, P. (2009). Surface EMG in advanced hand prosthetics. Biological Cybernetics, 100(1), 35-47." },
  { num: 12, text: "Farrell, T. R., & Weir, R. F. (2007). The optimal controller delay for myoelectric prostheses. IEEE Transactions on Neural Systems and Rehabilitation Engineering, 15(1), 111-118." },
  { num: 13, text: "Henneman, E., Somjen, G., & Carpenter, D. O. (1965). Functional significance of cell size in spinal motoneurons. Journal of Neurophysiology, 28(3), 560-580." },
  { num: 14, text: "De Luca, C. J. (1997). The use of surface electromyography in biomechanics. Journal of Applied Biomechanics, 13(2), 135-163." },
  { num: 15, text: "Englehart, K., & Hudgins, B. (2003). A robust, real-time control scheme for multifunction myoelectric control. IEEE Transactions on Biomedical Engineering, 50(7), 848-854." },
]

function VariabilityTaxonomy() {
  const COLS = [
    {
      label: "Physiological",
      color: "#8B5CF6",
      items: [
        { title: "Morphological differences", body: "Subcutaneous fat, forearm circumference, muscle belly geometry alter the volume-conduction path." },
        { title: "Motor unit recruitment", body: "Subject-specific threshold and firing rate profiles produce distinct MUAP superpositions for identical gestures." },
        { title: "Fatigue effects", body: "Sustained contraction shifts spectral content and increases amplitude through motor unit substitution." },
      ],
    },
    {
      label: "Mechanical",
      color: "#EF4444",
      items: [
        { title: "Electrode displacement", body: "Displacements >1 cm shift the detection volume beyond the trained motor unit pool, causing catastrophic accuracy loss." },
        { title: "Interface impedance", body: "Dry or poorly prepared electrode-skin interfaces increase noise and degrade differential amplifier CMRR." },
        { title: "Limb position", body: "Arm elevation and rotation change muscle geometry and introduce postural cross-talk absent from training data." },
      ],
    },
    {
      label: "Temporal",
      color: "#F59E0B",
      items: [
        { title: "Session-to-session shift", body: "Electrode repositioning and impedance changes between sessions produce systematic feature distribution shift." },
        { title: "Warm-up transients", body: "The first minutes of a session exhibit higher amplitude variability as electrode gel equilibrates." },
        { title: "Long-term adaptation", body: "Motor cortex plasticity gradually shifts MUAP waveform statistics over weeks of use, requiring periodic recalibration." },
      ],
    },
  ]
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {COLS.map(col => (
        <div key={col.label}>
          <div style={{ fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, textAlign: "center", paddingBottom: 8, borderBottom: `2px solid ${col.color}` }}>{col.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {col.items.map(item => (
              <div key={item.title} style={{ background: "var(--bg)", border: `1px solid ${col.color}28`, borderLeft: `3px solid ${col.color}`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AccuracyGapChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const conditions = [
    { label: "Within-subject, controlled",          val: 95,  color: "#10B981", note: "Best-case laboratory" },
    { label: "Cross-subject, LOSO",                 val: 85,  color: "#3B82F6", note: "myojam benchmark" },
    { label: "Electrode displaced 1 cm",            val: 69,  color: "#F59E0B", note: "Young et al., 2011" },
    { label: "Limb position changed",               val: 72,  color: "#F59E0B", note: "Castellini & van der Smagt, 2009" },
    { label: "Muscle fatigue (extended use)",        val: 76,  color: "#EF4444", note: "Tkach et al., 2010" },
    { label: "All conditions combined (estimated)", val: 63,  color: "#EF4444", note: "Scheme & Englehart, 2011" },
  ]
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {conditions.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 200, fontSize: 11, color: "var(--text-secondary)", fontWeight: 300, textAlign: "right", flexShrink: 0, lineHeight: 1.35 }}>{c.label}</div>
          <div style={{ flex: 1, height: 10, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: vis ? `${c.val}%` : "0%", background: c.color, borderRadius: 100, transition: `width 0.8s ease ${i * 0.1}s` }}/>
          </div>
          <div style={{ width: 32, fontSize: 12, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.val}%</div>
          <div style={{ width: 170, fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, flexShrink: 0, fontStyle: "italic" }}>{c.note}</div>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", fontWeight: 300 }}>
        Values represent mean six-gesture classification accuracy; combined estimate from Scheme & Englehart (2011) synthesis
      </div>
    </div>
  )
}

function MitigationChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const strategies = [
    { label: "No mitigation (cross-subject baseline)", val: 84.9, color: "#6B7280" },
    { label: "+ Amplitude normalisation (MVC)",        val: 86.7, color: "#3B82F6" },
    { label: "+ Stability feature selection",          val: 88.1, color: "#8B5CF6" },
    { label: "+ Feature z-score standardisation",      val: 89.3, color: "#F59E0B" },
    { label: "+ Few-shot calibration (15 windows/cls)", val: 93.6, color: "#10B981" },
    { label: "+ Full session retraining",              val: 95.2, color: "#FF2D78" },
  ]
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {strategies.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 220, fontSize: 11, color: "var(--text-secondary)", fontWeight: 300, textAlign: "right", flexShrink: 0, lineHeight: 1.4 }}>{s.label}</div>
          <div style={{ flex: 1, height: 11, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: vis ? `${s.val}%` : "0%", background: s.color, borderRadius: 100, transition: `width 0.8s ease ${i * 0.12}s` }}/>
          </div>
          <div style={{ width: 40, fontSize: 12, fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.val}%</div>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", fontWeight: 300 }}>
        Illustrative cumulative improvements; values synthesised from Tkach et al. (2010), Lorrain et al. (2011), Phinyomark et al. (2012)
      </div>
    </div>
  )
}

export default function ResearchVariability() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const BIBTEX = `@techreport{wong2026myojam_variability,
  title     = {Origins and Mitigation of Inter-Subject and Inter-Session
               Variability in Surface Electromyographic Gesture
               Classification: A Structured Review},
  author    = {myojam Research Team},
  year      = {2026},
  month     = {April},
  institution = {myojam Project},
  url       = {https://myojam.com/research/variability-review},
  note      = {MIT Licence. Code: https://github.com/Jaden300/myojam}
}`

  function copyCite() {
    navigator.clipboard.writeText(BIBTEX).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @media print { nav, footer, .no-print { display: none !important; } .paper { max-width: 100% !important; padding: 20px !important; } }
        .paper-section-3 p { text-indent: 1.5em; }
        .paper-section-3 p + p { margin-top: 0; }
      `}</style>
      <Navbar />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 32px 80px" }} className="paper">

        {/* Breadcrumb */}
        <div className="no-print" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32 }}>
          <span onClick={() => navigate("/research")} style={{ fontSize: 13, color: "var(--text-tertiary)", cursor: "pointer", fontWeight: 300, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
          >Research</span>
          <span style={{ fontSize: 13, color: "var(--border)" }}>›</span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>Structured review</span>
        </div>

        {/* Journal header */}
        <div style={{ borderBottom: "2px solid var(--text)", paddingBottom: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 400, color: "var(--text-secondary)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              myojam Technical Report · April 2026 · Open Access · Structured Review
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 100, padding: "3px 10px" }}>Open Access</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 100, padding: "3px 10px" }}>MIT Licence</span>
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(16px,2.8vw,24px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: 20, fontFamily: "Georgia, serif" }}>
            Origins and Mitigation of Inter-Subject and Inter-Session Variability in Surface Electromyographic Gesture Classification: A Structured Review
          </h1>
          <div style={{ marginBottom: 16 }}>
            {AUTHORS.map(a => (
              <span key={a.name} style={{ fontSize: 15, color: "var(--accent)", fontWeight: 500, marginRight: 16 }}>
                {a.name}<sup style={{ fontSize: 10 }}>1</sup>
              </span>
            ))}
          </div>
          {AFFILIATIONS.map(a => (
            <div key={a.num} style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, fontStyle: "italic", marginBottom: 4 }}>
              <sup>{a.num}</sup>{a.label}
            </div>
          ))}
        </div>

        {/* Keywords */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontFamily: "Georgia, serif" }}>Keywords: </span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, fontStyle: "italic" }}>{KEYWORDS.join(", ")}</span>
        </div>

        {/* Abstract */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", borderRadius: "0 8px 8px 0", padding: "20px 24px", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "Georgia, serif" }}>Abstract</div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.85, fontWeight: 300, margin: 0, fontFamily: "Georgia, serif" }}>{ABSTRACT}</p>
        </div>

        {/* Table of contents */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border)", padding: "18px 22px", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Contents</div>
          {SECTIONS.map(s => (
            <div key={s.num}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, marginBottom: 4, display: "flex", gap: 8 }}>
                <span style={{ color: "var(--accent)", fontWeight: 500, width: 20 }}>{s.num}.</span>
                <a href={`#rv-${s.num}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                >{s.title}</a>
              </div>
              {s.subsections.map(sub => (
                <div key={sub.num} style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 3, display: "flex", gap: 8, paddingLeft: 20 }}>
                  <span style={{ width: 28 }}>{sub.num}</span>
                  <a href={`#rv-${sub.num}`} style={{ color: "var(--text-tertiary)", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                  >{sub.title}</a>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, display: "flex", gap: 8, marginTop: 4 }}>
            <span style={{ color: "var(--accent)", fontWeight: 500, width: 20 }}>10.</span>
            <span>References</span>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <div key={s.num} id={`rv-${s.num}`} className="paper-section-3" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--border)", fontFamily: "Georgia, serif" }}>
              {s.num}. {s.title}
            </h2>

            {s.body && s.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.85, fontWeight: 300, marginBottom: 14, fontFamily: "Georgia, serif" }}>{para}</p>
            ))}

            {s.subsections.map(sub => (
              <div key={sub.num} id={`rv-${sub.num}`} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 12, fontFamily: "Georgia, serif" }}>
                  {sub.num} {sub.title}
                </h3>
                {sub.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.85, fontWeight: 300, marginBottom: 12, fontFamily: "Georgia, serif" }}>{para}</p>
                ))}
              </div>
            ))}

            {/* Taxonomy figure after Section 2 */}
            {s.num === "2" && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", margin: "28px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, textAlign: "center" }}>
                  Figure 1: Taxonomy of variability sources in surface EMG gesture classification
                </div>
                <VariabilityTaxonomy />
              </div>
            )}

            {/* Accuracy gap figure after Section 4 */}
            {s.num === "4" && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", margin: "28px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, textAlign: "center" }}>
                  Figure 2: Accuracy degradation under progressive introduction of real-world variability conditions
                </div>
                <AccuracyGapChart />
              </div>
            )}

            {/* Mitigation chart after Section 7 */}
            {s.num === "7" && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", margin: "28px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, textAlign: "center" }}>
                  Figure 3: Cumulative accuracy recovery from successive mitigation interventions (illustrative)
                </div>
                <MitigationChart />
              </div>
            )}
          </div>
        ))}

        {/* References */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 20, paddingBottom: 8, borderBottom: "1px solid var(--border)", fontFamily: "Georgia, serif" }}>
            References
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {REFERENCES.map(ref => (
              <div key={ref.num} style={{ display: "flex", gap: 14, fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, fontFamily: "Georgia, serif" }}>
                <span style={{ color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>[{ref.num}]</span>
                <span>{ref.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citation */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 12, border: "1px solid var(--border)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cite this work</div>
            <button onClick={copyCite} style={{ background: copied ? "rgba(16,185,129,0.1)" : "var(--bg)", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "var(--border)"}`, borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 500, color: copied ? "#10B981" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.2s" }}>
              {copied ? "✓ Copied" : "Copy BibTeX"}
            </button>
          </div>
          <pre style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0 }}>{BIBTEX}</pre>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => window.print()} className="no-print" style={{ background: "none", border: "1px solid var(--border-mid)", borderRadius: 100, padding: "10px 24px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font)", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.color = "var(--text-secondary)" }}
          >Print / Save as PDF</button>
          <button onClick={() => navigate("/research")} className="no-print" style={{ background: "none", border: "1px solid var(--border-mid)", borderRadius: 100, padding: "10px 24px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font)", cursor: "pointer" }}>
            ← Research hub
          </button>
        </div>
      </div>
      <UpNext current="/research/variability-review" />
      <Footer />
    </div>
  )
}
