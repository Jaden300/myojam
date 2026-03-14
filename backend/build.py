import scipy.io as sio
import numpy as np
import pickle
import os
from scipy.signal import butter, filtfilt
from sklearn.ensemble import RandomForestClassifier

def bandpass_filter(signal, lowcut=20, highcut=90, fs=200, order=4):
    nyq = fs / 2
    b, a = butter(order, [lowcut / nyq, highcut / nyq], btype="band")
    return filtfilt(b, a, np.array(signal), axis=0)

def extract_features(window):
    window = np.array(window)
    mav = np.mean(np.abs(window), axis=0)
    rms = np.sqrt(np.mean(window ** 2, axis=0))
    zc = np.sum(np.diff(np.sign(window), axis=0) != 0, axis=0)
    wl = np.sum(np.abs(np.diff(window, axis=0)), axis=0)
    return np.concatenate([mav, rms, zc, wl])

def build_dataset(emg, labels, window_size=200, step=100):
    X, y = [], []
    filtered = bandpass_filter(emg)
    for i in range(0, len(filtered) - window_size, step):
        window = filtered[i:i+window_size]
        label = labels[i + window_size//2][0]
        if label == 0 or label > 6:
            continue
        X.append(extract_features(window))
        y.append(label)
    return np.array(X), np.array(y)

if __name__ == "__main__":
    print("Building model...")
    base = os.path.dirname(__file__)
    data_dir = os.path.join(base, "../data/DB5_s1")
    mat = sio.loadmat(os.path.join(data_dir, "S1_E1_A1.mat"))
    emg = mat["emg"]
    labels = mat["restimulus"]

    X, y = build_dataset(emg, labels)
    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X, y)

    os.makedirs(os.path.join(base, "../model"), exist_ok=True)
    with open(os.path.join(base, "../model/gesture_classifier.pkl"), "wb") as f:
        pickle.dump(model, f)

    pipeline = {
        'window_size': 200, 'step': 100,
        'gestures': list(np.unique(y)),
        'gesture_names': {1: 'index flex', 2: 'middle flex', 3: 'ring flex',
                          4: 'pinky flex', 5: 'thumb flex', 6: 'fist'}
    }
    with open(os.path.join(base, "../model/pipeline_config.pkl"), "wb") as f:
        pickle.dump(pipeline, f)

    print("Model saved.")