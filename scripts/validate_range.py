import serial
import serial.tools.list_ports
import time

GESTURES = [
    "REST              — arm relaxed, resting on table",
    "FIST              — arm fisted, resting on table",
    "HAND BACK         — hand stretched as far back as possible",
    "PINKY UP          — only pinky up, palm on table",
    "ALL FINGERS UP    — all fingers up, palm on table",
    "FINGERTIPS+ARM UP — fingertips flat on table, arm lifted",
]

PREP_SECONDS   = 7
RECORD_SECONDS = 30

def percentile(data, p):
    sorted_data = sorted(data)
    idx = (len(sorted_data) - 1) * p / 100
    lo, hi = int(idx), min(int(idx) + 1, len(sorted_data) - 1)
    return sorted_data[lo] + (sorted_data[hi] - sorted_data[lo]) * (idx - lo)

def find_arduino():
    for p in serial.tools.list_ports.comports():
        if "usbmodem" in p.device or "usbserial" in p.device or "Arduino" in (p.description or ""):
            return p.device
    return None

port = find_arduino()
if not port:
    print("No Arduino found.")
    exit()

ser = serial.Serial(port, 115200, timeout=1)
time.sleep(2)
ser.reset_input_buffer()

results = {}

for gesture in GESTURES:
    name = gesture.split("—")[0].strip()

    print(f"\n{'='*60}")
    print(f"NEXT: {gesture}")
    print(f"Get into position. Recording starts in {PREP_SECONDS} seconds...")

    for i in range(PREP_SECONDS, 0, -1):
        print(f"  {i}...", end="\r", flush=True)
        time.sleep(1)

    print(f"\nRECORDING {name} for {RECORD_SECONDS} seconds...")
    ser.reset_input_buffer()

    samples = []
    start = time.time()

    while time.time() - start < RECORD_SECONDS:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue
        try:
            val = int(line)
            voltage = (val / 1023.0) * 5.0
            samples.append(voltage)
            elapsed = time.time() - start
            print(f"  {elapsed:>5.1f}s  {voltage:.3f}V", end="\r", flush=True)
        except ValueError:
            continue

    if samples:
        p25 = percentile(samples, 25)
        p50 = percentile(samples, 50)
        p75 = percentile(samples, 75)
        results[name] = { "p25": p25, "p50": p50, "p75": p75, "samples": len(samples) }
        print(f"\n  Done. {len(samples)} samples. P25: {p25:.3f}V  P50: {p50:.3f}V  P75: {p75:.3f}V")
    else:
        print("\n  No data recorded.")

    input("\nPress Enter when ready for the next gesture...")

print(f"\n{'='*60}")
print("CALIBRATION RESULTS — 25th / 50th / 75th percentile")
print(f"{'='*60}")
print(f"{'Gesture':<24}  {'P25':>7}  {'P50':>7}  {'P75':>7}  {'Samples':>8}")
print("-" * 60)
for name, r in results.items():
    print(f"{name:<24}  {r['p25']:>6.3f}V  {r['p50']:>6.3f}V  {r['p75']:>6.3f}V  {r['samples']:>8}")

print(f"\nCopy and send this table to Claude.")
ser.close()