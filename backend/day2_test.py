import requests
import scipy.io as sio
import numpy as np

# Load a real window from your data
data = sio.loadmat('../data/DB5_s1/S1_E1_A1.mat')
emg = data['emg']

# Grab window from middle of recording
window = emg[5000:5200, :].tolist()  # 200 samples, 16 channels

response = requests.post(
    "http://127.0.0.1:8000/predict",
    json={"emg_window": window}
)
print(response.json())