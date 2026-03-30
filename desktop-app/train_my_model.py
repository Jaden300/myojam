import numpy as np
import json
import pickle
import os
import warnings
warnings.filterwarnings("ignore")

from scipy.signal import butter, filtfilt, welch
from scipy.stats import skew, kurtosis
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold, cross_val_predict
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

BASE       = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE, "my_emg_data.json")
MODEL_OUT  = os.path.join(BASE, "model/my_gesture_classifier.pkl")
CONFIG_OUT = os.path.join(BASE, "model/my_pipeline_config.pkl")

def bandpass_filter(signal, lowcut=20, highcut=90, fs=200, order=4):
    nyq = fs / 2
    highcut = min(highcut, nyq - 1)
    b, a = butter(order, [lowcut/nyq, highcut/nyq], btype="band")
    return filtfilt(b, a, np.array(signal))

def extract_features(w):
    w = np.array(w, dtype=float)
    feats = []
    feats += [
        np.mean(np.abs(w)),
        np.sqrt(np.mean(w**2)),
        np.sum(np.diff(np.sign(w)) != 0),
        np.sum(np.abs(np.diff(w))),
        np.var(w),
        float(skew(w)),
        float(kurtosis(w)),
        np.max(np.abs(w)),
        np.max(np.abs(w)) / (np.mean(np.abs(w)) + 1e-8),
        np.sum(np.diff(np.sign(np.diff(w))) != 0),
    ]
    env = np.abs(w)
    feats += [
        np.max(env), np.mean(env), np.std(env),
        np.percentile(env, 25), np.percentile(env, 75),
        np.percentile(env, 90), np.percentile(env, 10),
    ]
    d1 = np.diff(w)
    d2 = np.diff(d1)
    activity   = np.var(w)
    mobility   = np.sqrt(np.var(d1) / (activity + 1e-8))
    complexity = np.sqrt(np.var(d2) / (np.var(d1) + 1e-8)) / (mobility + 1e-8)
    feats += [activity, mobility, complexity]
    freqs, psd = welch(w, fs=200, nperseg=min(64, len(w)//2))
    total_pow = np.sum(psd) + 1e-8
    for lo, hi in [(20,50),(50,100),(100,150),(150,200)]:
        mask = (freqs >= lo) & (freqs < hi)
        feats.append(np.sum(psd[mask]) / total_pow)
    mean_freq = np.sum(freqs * psd) / total_pow
    cumsum    = np.cumsum(psd)
    med_idx   = min(np.searchsorted(cumsum, total_pow/2), len(freqs)-1)
    feats += [mean_freq, freqs[med_idx]]
    segs = np.array_split(w, 8)
    for seg in segs:
        feats += [np.mean(np.abs(seg)), np.sqrt(np.mean(seg**2)), np.var(seg)]
    try:
        from numpy.linalg import lstsq
        n = len(w); order = 6
        X_ar = np.column_stack([w[order-i-1:n-i-1] for i in range(order)])
        y_ar = w[order:]
        ar_coefs, _, _, _ = lstsq(X_ar, y_ar, rcond=None)
        feats += list(ar_coefs)
    except:
        feats += [0.0] * 6
    feats.append(
        np.sum(psd[(freqs>=20)&(freqs<100)]) / (np.sum(psd[(freqs>=100)&(freqs<200)]) + 1e-8)
    )
    return np.array(feats)

def augment_for_training(X, y, n_aug=3):
    """Only used for final model training, NOT for CV evaluation."""
    X_aug, y_aug = [X], [y]
    for _ in range(n_aug):
        noise = np.random.normal(0, 0.005, X.shape)
        X_aug.append(X + noise)
        y_aug.append(y)
    return np.vstack(X_aug), np.concatenate(y_aug)

def main():
    print("\n╔══════════════════════════════════════╗")
    print("║    myojam — Train My EMG Model     ║")
    print("╚══════════════════════════════════════╝\n")

    with open(DATA_PATH, "r") as f:
        data = json.load(f)
    print(f"✓  Loaded {len(data)} windows")

    from collections import Counter
    counts = Counter(d["gesture_name"] for d in data)
    for name, count in sorted(counts.items()):
        print(f"   {name:15s}: {count} windows")

    print("\n⚙  Extracting features...")
    X_raw, y_names = [], []
    for sample in data:
        filtered = bandpass_filter(sample["signal"])
        feats    = extract_features(filtered)
        X_raw.append(feats)
        y_names.append(sample["gesture_name"])

    X_raw = np.array(X_raw)
    le    = LabelEncoder()
    y_raw = le.fit_transform(y_names)
    print(f"✓  Feature matrix: {X_raw.shape}")
    print(f"✓  Classes: {list(le.classes_)}")

    models = {
        "RandomForest": Pipeline([
            ("clf", RandomForestClassifier(n_estimators=500, max_features="sqrt",
                                           min_samples_leaf=1, random_state=42, n_jobs=-1))
        ]),
        "ExtraTrees": Pipeline([
            ("clf", ExtraTreesClassifier(n_estimators=500, max_features="sqrt",
                                         min_samples_leaf=1, random_state=42, n_jobs=-1))
        ]),
        "GradientBoosting": Pipeline([
            ("clf", GradientBoostingClassifier(n_estimators=200, max_depth=5,
                                               learning_rate=0.05, random_state=42))
        ]),
        "SVM_RBF": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(kernel="rbf", C=10, gamma="scale", probability=True))
        ]),
        "MLP": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=(256, 128, 64),
                                   max_iter=500, random_state=42,
                                   early_stopping=True, validation_fraction=0.1))
        ]),
    }

    # ── HONEST CV on raw unaugmented data only
    print("\n⚙  Evaluating models on RAW data (honest CV)...\n")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    for name, pipeline in models.items():
        scores = cross_val_score(pipeline, X_raw, y_raw, cv=cv,
                                 scoring="accuracy", n_jobs=-1)
        results[name] = (scores.mean(), scores.std(), pipeline)
        print(f"   {name:20s}: {scores.mean()*100:.1f}% ± {scores.std()*100:.1f}%")

    best_name = max(results, key=lambda k: results[k][0])
    best_acc, best_std, best_pipeline = results[best_name]
    print(f"\n🏆  Best: {best_name} — {best_acc*100:.1f}% ± {best_std*100:.1f}%")
    print("     (this is the real accuracy on unseen data)\n")

    # Per-gesture breakdown on raw data
    print("⚙  Per-gesture breakdown...")
    y_pred = cross_val_predict(best_pipeline, X_raw, y_raw, cv=cv)
    print(classification_report(y_raw, y_pred, target_names=le.classes_))

    # ── Final training WITH augmentation
    print("⚙  Fitting final model on augmented data...")
    X_aug, y_aug = augment_for_training(X_raw, y_raw, n_aug=3)
    print(f"   Augmented: {X_aug.shape[0]} samples")
    best_pipeline.fit(X_aug, y_aug)

    # Save
    id_map = {
        "rest": 0,
        "index flex": 1, "middle flex": 2, "ring flex": 3,
        "pinky flex": 4, "thumb flex": 5, "fist": 6,
    }
    gesture_names_by_id = {id_map[n]: n for n in le.classes_ if n in id_map}

    config = {
        "gesture_names":         gesture_names_by_id,
        "label_encoder_classes": list(le.classes_),
        "single_channel":        True,
        "best_model":            best_name,
        "cv_accuracy":           float(best_acc),
    }

    with open(MODEL_OUT, "wb") as f:
        pickle.dump(best_pipeline, f)
    with open(CONFIG_OUT, "wb") as f:
        pickle.dump(config, f)

    print(f"\n✅  Saved: {best_name}")
    print(f"✅  Honest CV accuracy: {best_acc*100:.1f}%")
    print(f"\n{'═'*44}")
    if best_acc > 0.70:
        print("  ✓ Good enough to use — proceed to app testing")
    elif best_acc > 0.55:
        print("  ⚠ Marginal — will work with amplitude thresholding")
    else:
        print("  ✗ Too low — consider recollecting data")
    print(f"{'═'*44}\n")

if __name__ == "__main__":
    main()