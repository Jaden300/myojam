from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
from scipy.signal import butter, filtfilt
import os
import random

app = FastAPI(title="myojam API")

# Allow React frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and config once on startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../model/gesture_classifier.pkl")
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../model/pipeline_config.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(CONFIG_PATH, "rb") as f:
    config = pickle.load(f)

GESTURE_NAMES = config["gesture_names"]

# --- Signal processing (same functions as day 1) ---

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

# --- Request/response models ---

class EMGRequest(BaseModel):
    # 2D array: shape (200 samples, 16 channels)
    emg_window: list[list[float]]

class PredictionResponse(BaseModel):
    gesture_id: int
    gesture_name: str
    confidence: float
    all_probabilities: dict

# --- Endpoints ---

@app.get("/")
def root():
    return {"status": "myojam API running"}

@app.get("/gestures")
def get_gestures():
    return {"gestures": GESTURE_NAMES}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: EMGRequest):
    emg = np.array(request.emg_window)

    if emg.shape != (200, 16):
        raise HTTPException(
            status_code=422,
            detail=f"Expected shape (200, 16), got {emg.shape}"
        )

    try:
        filtered = bandpass_filter(emg)
        features = extract_features(filtered).reshape(1, -1)
        gesture_id = int(model.predict(features)[0])
        proba = model.predict_proba(features)[0]
        confidence = float(np.max(proba))
        classes = [int(c) for c in model.classes_]
        all_probs = {
            GESTURE_NAMES.get(c, str(c)): round(float(p), 4)
            for c, p in zip(classes, proba)
        }

        return PredictionResponse(
            gesture_id=gesture_id,
            gesture_name=GESTURE_NAMES.get(gesture_id, "unknown"),
            confidence=round(confidence, 4),
            all_probabilities=all_probs,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/sample")
def get_sample(gesture_id: int = None):
    """Return a real EMG window from the dataset for demo purposes."""
    import scipy.io as sio

    data_dir = os.path.join(os.path.dirname(__file__), "../data/DB5_s1")
    mat = sio.loadmat(os.path.join(data_dir, "S1_E1_A1.mat"))
    emg = mat["emg"]
    labels = mat["restimulus"].flatten()

    # Filter to requested gesture or pick a random one from 1-6
    target = gesture_id if gesture_id in range(1, 7) else random.randint(1, 6)
    indices = np.where(labels == target)[0]
    
    # Pick a random valid window start
    valid = [i for i in indices if i + 200 < len(emg)]
    start = random.choice(valid)
    window = emg[start:start + 200].tolist()

    return {
        "gesture_id": target,
        "gesture_name": GESTURE_NAMES.get(target, "unknown"),
        "emg_window": window
    }