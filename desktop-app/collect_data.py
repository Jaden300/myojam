import serial
import serial.tools.list_ports
import numpy as np
import time
import os
import json

# ── Config
BAUD_RATE    = 9600
SAMPLES_PER_GESTURE = 60   # how many windows per gesture
WINDOW_SIZE  = 200         # samples per window
REST_BETWEEN = 2.0         # seconds of rest between windows
FLEX_DURATION = 3.0        # seconds to hold each flex

GESTURES = [
    (1, "index flex",  "Curl your INDEX finger"),
    (2, "middle flex", "Curl your MIDDLE finger"),
    (3, "ring flex",   "Curl your RING finger"),
    (4, "pinky flex",  "Curl your PINKY finger"),
    (5, "thumb flex",  "Curl your THUMB"),
    (6, "fist",        "Make a FIST (all fingers)"),
]

BASE      = os.path.dirname(os.path.abspath(__file__))
SAVE_PATH = os.path.join(BASE, "my_emg_data.json")

def find_arduino():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        if "usbmodem" in p.device or "usbserial" in p.device:
            return p.device
    return ports[0].device if ports else None

def collect_window(ser, duration=3.0):
    """Collect samples for `duration` seconds, return middle 200."""
    samples = []
    start = time.time()
    while time.time() - start < duration:
        try:
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            val = float(line)
            samples.append(val)
        except:
            pass
    # Take middle window to avoid start/end artifacts
    if len(samples) >= WINDOW_SIZE:
        mid = len(samples) // 2
        start_i = mid - WINDOW_SIZE // 2
        return samples[start_i:start_i + WINDOW_SIZE]
    return samples[:WINDOW_SIZE] if len(samples) >= WINDOW_SIZE else None

def main():
    print("\n╔══════════════════════════════════════╗")
    print("║     myojam — EMG Data Collector    ║")
    print("╚══════════════════════════════════════╝\n")

    port = find_arduino()
    if not port:
        print("❌  No Arduino found. Plug it in first.")
        return

    print(f"✓  Found Arduino on {port}")
    ser = serial.Serial(port, BAUD_RATE, timeout=2)
    time.sleep(2)  # let Arduino settle
    print("✓  Serial connected\n")

    all_data = []  # list of {"gesture_id": int, "gesture_name": str, "signal": [...]}

    print("─" * 44)
    print("INSTRUCTIONS:")
    print("• Keep your arm relaxed between prompts")
    print("• Only flex when you see >>> FLEX NOW <<<")
    print("• Hold the gesture for the full duration")
    print("• Each gesture repeats", SAMPLES_PER_GESTURE, "times")
    print("• Total time: ~", int(len(GESTURES) * SAMPLES_PER_GESTURE * (FLEX_DURATION + REST_BETWEEN) / 60), "minutes")
    print("─" * 44)
    input("\nPress ENTER when ready...\n")

    for gesture_id, gesture_name, instruction in GESTURES:
        print(f"\n{'═'*44}")
        print(f"  GESTURE {gesture_id}/6: {gesture_name.upper()}")
        print(f"  {instruction}")
        print(f"{'═'*44}")
        input(f"  Press ENTER to start collecting {gesture_name}...\n")

        collected = 0
        while collected < SAMPLES_PER_GESTURE:
            # REST phase
            print(f"  [{collected+1}/{SAMPLES_PER_GESTURE}]  😌  RELAX...  ({REST_BETWEEN:.0f}s)", end="\r")
            time.sleep(REST_BETWEEN)
            ser.reset_input_buffer()  # clear stale data

            # FLEX phase
            print(f"  [{collected+1}/{SAMPLES_PER_GESTURE}]  💪  >>> FLEX NOW <<<  ({FLEX_DURATION:.0f}s)", end="\r")
            window = collect_window(ser, FLEX_DURATION)

            if window and len(window) == WINDOW_SIZE:
                all_data.append({
                    "gesture_id":   gesture_id,
                    "gesture_name": gesture_name,
                    "signal":       window
                })
                collected += 1
                print(f"  [{collected}/{SAMPLES_PER_GESTURE}]  ✓  Captured               ")
            else:
                print(f"  [{collected+1}/{SAMPLES_PER_GESTURE}]  ✗  Bad sample, retrying...  ")

        print(f"\n  ✅  {gesture_name} complete! ({collected} windows)\n")

    ser.close()

    # Save
    with open(SAVE_PATH, "w") as f:
        json.dump(all_data, f)

    print(f"{'═'*44}")
    print(f"  🎉  Data collection complete!")
    print(f"  📁  Saved {len(all_data)} windows to:")
    print(f"      {SAVE_PATH}")
    print(f"{'═'*44}\n")
    print("Run train_my_model.py next to train your model.")

if __name__ == "__main__":
    main()