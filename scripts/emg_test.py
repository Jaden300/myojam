import serial
import serial.tools.list_ports
import time

# ── Auto-detect Arduino port
def find_arduino():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        if "usbmodem" in p.device or "usbserial" in p.device or "Arduino" in (p.description or ""):
            return p.device
    return None

port = find_arduino()
if not port:
    print("No Arduino found. Available ports:")
    for p in serial.tools.list_ports.comports():
        print(f"  {p.device} — {p.description}")
    exit()

print(f"Connected to {port}")
print("Reading EMG values (0–1023). Press Ctrl+C to stop.\n")
print(f"{'Time':>8}  {'Raw value':>10}  {'Voltage':>10}  Bar")
print("-" * 60)

ser = serial.Serial(port, 115200, timeout=1)
time.sleep(2)  # let Arduino reset
ser.reset_input_buffer()

start = time.time()
try:
    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if not line:
            continue
        try:
            val = int(line)
        except ValueError:
            continue

        elapsed = time.time() - start
        voltage = (val / 1023.0) * 5.0   # change 5.0 to 3.3 if on 3.3V
        bar = "█" * int(val / 32)        # scale to ~32 chars max

        print(f"{elapsed:>8.2f}s  {val:>10}  {voltage:>8.3f}V  {bar}")

except KeyboardInterrupt:
    print("\nStopped.")
    ser.close()