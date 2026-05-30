import serial
import serial.tools.list_ports
import time
from collections import deque
import statistics

WINDOW_SIZE   = 50    # longer window = smoother
STD_THRESHOLD = 0.25  # raised — upper gestures are naturally noisy
HYSTERESIS    = 0.5

# Midpoints between averaged P50s across both runs
GESTURES = [
    (0.000, 0.176, "REST              "),
    (0.176, 0.224, "FIST              "),
    (0.224, 0.516, "HAND BACK         "),
    (0.516, 0.869, "PINKY UP          "),
    (0.869, 1.093, "ALL FINGERS UP    "),
    (1.093, 9.999, "FINGERTIPS+ARM UP "),
]

def find_arduino():
    for p in serial.tools.list_ports.comports():
        if "usbmodem" in p.device or "usbserial" in p.device or "Arduino" in (p.description or ""):
            return p.device
    return None

port = find_arduino()
if not port:
    print("No Arduino found.")
    exit()

print(f"Connected to {port}")
print(f"{'Mean V':>9}  {'Std V':>8}  Gesture")
print("-" * 55)

ser = serial.Serial(port, 115200, timeout=1)
time.sleep(2)
ser.reset_input_buffer()

window       = deque(maxlen=WINDOW_SIZE)
last_gesture = None
last_change  = time.time()

try:
    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue
        try:
            val = int(line)
        except ValueError:
            continue

        voltage = (val / 1023.0) * 5.0
        window.append(voltage)

        if len(window) < WINDOW_SIZE:
            continue

        mean = statistics.mean(window)
        std  = statistics.stdev(window)

        if std > STD_THRESHOLD:
            print(f"{mean:>8.3f}V  {std:>7.3f}V  (transitioning...)")
            continue

        for low, high, label in GESTURES:
            if low <= mean < high:
                gesture = label
                break
        else:
            gesture = "UNKNOWN"

        now = time.time()
        if gesture != last_gesture and (now - last_change) > HYSTERESIS:
            last_gesture = gesture
            last_change  = now

        print(f"{mean:>8.3f}V  {std:>7.3f}V  {last_gesture or gesture}")

except KeyboardInterrupt:
    print("\nStopped.")
    ser.close()