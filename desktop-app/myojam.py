import sys
import os
import threading
import random
import pickle
import subprocess
import time
import numpy as np
import scipy.io as sio
from scipy.signal import butter, filtfilt

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFrame, QSizePolicy,
)
from PyQt6.QtGui import (
    QPainter, QColor, QPen, QFont,
    QPainterPath, QBrush, QPixmap, QIcon
)
from PyQt6.QtCore import (
    Qt, QThread, pyqtSignal, QTimer, QPointF, QRect, QRectF
)

# ── Mouse control
def mouse_move(dx, dy):
    result = subprocess.run(['cliclick', 'p:.'], capture_output=True, text=True)
    if not result.stdout.strip():
        return
    x, y = map(int, result.stdout.strip().split(','))
    subprocess.run(['cliclick', f'm:{x+dx},{y+dy}'], capture_output=True)

def mouse_click():
    subprocess.run(['cliclick', 'c:.'], capture_output=True)

def press_space():
    subprocess.run(['osascript', '-e',
        'tell application "System Events" to key code 49'
    ], capture_output=True)

# ── Paths
BASE        = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE, "model/my_gesture_classifier.pkl")
CONFIG_PATH = os.path.join(BASE, "model/my_pipeline_config.pkl")
DATA_PATH   = os.path.join(BASE, "data/DB5_s1/S1_E1_A1.mat")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)
with open(CONFIG_PATH, "rb") as f:
    config = pickle.load(f)

GESTURE_NAMES = config["gesture_names"]
_mat          = sio.loadmat(DATA_PATH)
_emg_full     = _mat["emg"]
_labels_full  = _mat["restimulus"].flatten()

# ── Colors
ACCENT = QColor("#FF2D78")
BG2    = QColor("#F5F5F7")
TEXT3  = QColor("#AEAEB2")

GESTURE_COLORS = {
    "index flex":  QColor("#FF2D78"),
    "middle flex": QColor("#3B82F6"),
    "ring flex":   QColor("#8B5CF6"),
    "pinky flex":  QColor("#10B981"),
    "thumb flex":  QColor("#F59E0B"),
    "fist":        QColor("#EF4444"),
}

GESTURES = [
    (1, "index flex",  "Cursor left",  "←"),
    (2, "middle flex", "Cursor right", "→"),
    (3, "ring flex",   "Cursor down",  "↓"),
    (4, "pinky flex",  "Cursor up",    "↑"),
    (5, "thumb flex",  "Left click",   "◉"),
    (6, "fist",        "Spacebar",     "▬"),
]

KEY_MAP = {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6}
    
# ── Signal processing
def bandpass_filter(signal, lowcut=20, highcut=90, fs=200, order=4):
    nyq = fs / 2
    b, a = butter(order, [lowcut/nyq, highcut/nyq], btype="band")
    return filtfilt(b, a, np.array(signal), axis=0)

def extract_features(window):
    w = np.array(window)
    return np.concatenate([
        np.mean(np.abs(w), axis=0),
        np.sqrt(np.mean(w**2, axis=0)),
        np.sum(np.diff(np.sign(w), axis=0) != 0, axis=0),
        np.sum(np.abs(np.diff(w, axis=0)), axis=0),
    ])

def extract_single_channel_features(window):
    from scipy.signal import welch
    from scipy.stats import skew, kurtosis
    w = np.array(window, dtype=float)
    feats = []
    feats += [
        np.mean(np.abs(w)), np.sqrt(np.mean(w**2)),
        np.sum(np.diff(np.sign(w)) != 0), np.sum(np.abs(np.diff(w))),
        np.var(w), float(skew(w)), float(kurtosis(w)),
        np.max(np.abs(w)),
        np.max(np.abs(w)) / (np.mean(np.abs(w)) + 1e-8),
        np.sum(np.diff(np.sign(np.diff(w))) != 0),
    ]
    env = np.abs(w)
    feats += [np.max(env), np.mean(env), np.std(env),
              np.percentile(env, 25), np.percentile(env, 75),
              np.percentile(env, 90), np.percentile(env, 10)]
    d1 = np.diff(w); d2 = np.diff(d1)
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
    cumsum = np.cumsum(psd)
    med_idx = min(np.searchsorted(cumsum, total_pow/2), len(freqs)-1)
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
    feats.append(np.sum(psd[(freqs>=20)&(freqs<100)]) / (np.sum(psd[(freqs>=100)&(freqs<200)]) + 1e-8))
    return np.array(feats)

def predict_from_window(emg_window):
    signal   = np.array([row[0] for row in emg_window])
    filtered = bandpass_filter(signal)
    
    if config.get("single_channel"):
        features = extract_single_channel_features(filtered).reshape(1, -1)
    else:
        filtered_2d = bandpass_filter(np.array(emg_window))
        features    = extract_features(filtered_2d).reshape(1, -1)
    
    proba        = model.predict_proba(features)[0]
    gesture_idx  = int(np.argmax(proba))
    confidence   = float(proba[gesture_idx])
    classes      = config["label_encoder_classes"]
    gesture_name = classes[gesture_idx]
    gesture_id   = next((k for k, v in GESTURE_NAMES.items() if v == gesture_name), 1)
    return gesture_name, confidence, emg_window

def get_dataset_window(gesture_id=None):
    target  = gesture_id if gesture_id in range(1, 7) else random.randint(1, 6)
    indices = np.where(_labels_full == target)[0]
    valid   = [i for i in indices if i + 200 < len(_emg_full)]
    start   = random.choice(valid)
    return _emg_full[start:start+200].tolist()

def execute_action(gesture_name):
    if gesture_name == "index flex":
        mouse_move(-40, 0)
    elif gesture_name == "middle flex":
        mouse_move(40, 0)
    elif gesture_name == "ring flex":
        mouse_move(0, 40)
    elif gesture_name == "pinky flex":
        mouse_move(0, -40)
    elif gesture_name == "thumb flex":
        mouse_click()
    elif gesture_name == "fist":
        press_space()
    time.sleep(0.02)

class WaveformWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setMinimumHeight(120)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self._data     = [0.0] * 200
        self._prev     = [0.0] * 200
        self._progress = 1.0
        self._color    = ACCENT
        self._r = self._g = self._b = 255
        self._tr = self._tg = self._tb = 255
        t = QTimer(self)
        t.timeout.connect(self._tick)
        t.start(8)

    def update_data(self, emg_window, color=None):
        ch1 = [row[0] for row in emg_window]
        mn, mx = min(ch1), max(ch1)
        rng = max(mx - mn, 0.0001)
        self._prev     = list(self._data)
        self._data     = [(v - mn) / rng for v in ch1]
        self._progress = 0.0
        if color:
            self._tr = color.red()
            self._tg = color.green()
            self._tb = color.blue()

    def _tick(self):
        changed = False
        if self._progress < 1.0:
            self._progress = min(1.0, self._progress + 0.09)
            changed = True
        def lerp(a, b): return int(a + (b - a) * 0.25)
        nr = lerp(self._r, self._tr)
        ng = lerp(self._g, self._tg)
        nb = lerp(self._b, self._tb)
        if (nr, ng, nb) != (self._r, self._g, self._b):
            self._r, self._g, self._b = nr, ng, nb
            self._color = QColor(nr, ng, nb)
            changed = True
        if changed:
            self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h = self.width(), self.height()
        p.fillRect(0, 0, w, h, BG2)

        # Show placeholder if no real data yet
        if max(self._data) - min(self._data) < 0.01:
            p.setPen(QPen(TEXT3))
            p.setFont(QFont("Helvetica Neue", 13))
            p.drawText(0, 0, w, h, Qt.AlignmentFlag.AlignCenter, "ready when you are ✦")
            return

        pad    = 12
        draw_w = w - pad * 2
        draw_h = h - pad * 2
        prog   = self._progress

        disp = [self._prev[i] + (self._data[i] - self._prev[i]) * prog
                for i in range(len(self._data))]

        grid_pen = QPen(QColor(0, 0, 0, 12))
        grid_pen.setWidth(1)
        p.setPen(grid_pen)
        for i in range(1, 4):
            p.drawLine(pad, pad + draw_h * i // 4, w - pad, pad + draw_h * i // 4)

        step = draw_w / (len(disp) - 1)
        x0 = pad
        y0 = pad + draw_h - int(disp[0] * draw_h)

        fill_path = QPainterPath()
        fill_path.moveTo(x0, h - pad)
        fill_path.lineTo(x0, y0)
        for i, val in enumerate(disp[1:], 1):
            fill_path.lineTo(pad + i * step, pad + draw_h - val * draw_h)
        fill_path.lineTo(pad + draw_w, h - pad)
        fill_path.closeSubpath()
        fc = QColor(self._color); fc.setAlpha(18)
        p.fillPath(fill_path, QBrush(fc))

        line_path = QPainterPath()
        line_path.moveTo(x0, y0)
        for i, val in enumerate(disp[1:], 1):
            line_path.lineTo(pad + i * step, pad + draw_h - val * draw_h)
        pen = QPen(self._color, 2)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
        p.setPen(pen)
        p.drawPath(line_path)

# ── Confidence bar
class ConfidenceBar(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedHeight(6)
        self._value      = 0.0
        self._target     = 0.0
        self._color      = ACCENT
        self._tgt_color  = ACCENT
        self._r = self._g = self._b = 255
        self._tr = self._tg = self._tb = 255
        t = QTimer(self)
        t.timeout.connect(self._tick)
        t.start(8)

    def set_value(self, v, color):
        self._target   = v
        self._tgt_color = color
        self._tr, self._tg, self._tb = color.red(), color.green(), color.blue()

    def _tick(self):
        changed = False
        diff = self._target - self._value
        if abs(diff) > 0.002:
            self._value += diff * 0.35
            changed = True
        def lerp(a, b): return int(a + (b - a) * 0.35)
        nr = lerp(self._r, self._tr)
        ng = lerp(self._g, self._tg)
        nb = lerp(self._b, self._tb)
        if (nr, ng, nb) != (self._r, self._g, self._b):
            self._r, self._g, self._b = nr, ng, nb
            changed = True
        if changed:
            self._color = QColor(self._r, self._g, self._b)
            self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h = self.width(), self.height()
        p.setBrush(QColor(0, 0, 0, 15))
        p.setPen(Qt.PenStyle.NoPen)
        p.drawRoundedRect(0, 0, w, h, 3, 3)
        fill_w = int(w * self._value)
        if fill_w > 0:
            p.setBrush(self._color)
            p.drawRoundedRect(0, 0, fill_w, h, 3, 3)

# ── Gesture button
class GestureButton(QWidget):
    def __init__(self, key, gesture_name, action, symbol):
        super().__init__()
        self.key          = key
        self.gesture_name = gesture_name
        self.action       = action
        self.symbol       = symbol
        self.is_active    = False
        self._alpha       = 0.0
        self._tgt         = 0.0
        self.setFixedSize(100, 90)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        t = QTimer(self); t.timeout.connect(self._tick); t.start(8)

    def _tick(self):
        diff = self._tgt - self._alpha
        if abs(diff) > 0.005:
            self._alpha += diff * 0.3
            self.update()

    def set_active(self, val):
        self.is_active = val
        self._tgt = 1.0 if val else 0.0

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h  = self.width(), self.height()
        color = GESTURE_COLORS.get(self.gesture_name, ACCENT)
        a     = self._alpha

        bg = QColor(color); bg.setAlpha(int(22 * a))
        border = QColor(color); border.setAlpha(int(30 + 90 * a))
        p.setBrush(QBrush(bg))
        p.setPen(QPen(border, 1))
        p.drawRoundedRect(1, 1, w-2, h-2, 12, 12)

        def blend(c1, c2):
            return QColor(
                int(c1.red()   + (c2.red()   - c1.red())   * a),
                int(c1.green() + (c2.green() - c1.green()) * a),
                int(c1.blue()  + (c2.blue()  - c1.blue())  * a),
            )
        c = blend(TEXT3, color)
        p.setPen(QPen(c))
        p.setFont(QFont("Helvetica Neue", 11,
                        QFont.Weight.Bold if a > 0.5 else QFont.Weight.Normal))
        p.drawText(QRect(0,10,w,20), Qt.AlignmentFlag.AlignHCenter, str(self.key))
        p.setFont(QFont("Helvetica Neue", 18))
        p.drawText(QRect(0,28,w,28), Qt.AlignmentFlag.AlignHCenter, self.symbol)
        p.setFont(QFont("Helvetica Neue", 9))
        p.drawText(QRect(0,62,w,18), Qt.AlignmentFlag.AlignHCenter,
                   self.gesture_name.replace(" flex",""))

# ── Global key listener
class GlobalKeyListener(QThread):
    key_pressed = pyqtSignal(int)

    def run(self):
        proc = subprocess.Popen(
            ['/Library/Frameworks/Python.framework/Versions/3.13/bin/python3',
             os.path.join(BASE, 'keywatcher.py')],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        while True:
            line = proc.stdout.readline().strip()
            if line in KEY_MAP:
                self.key_pressed.emit(KEY_MAP[line])

class FlipLabel(QLabel):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._progress  = 1.0
        self._pending   = None
        self._pstyle    = None
        self._phase     = 0
        self._nat_h     = None
        t = QTimer(self); t.timeout.connect(self._tick); t.start(8)

    def flip_to(self, text, style=None):
        if self._nat_h is None:
            self._nat_h = self.height() or 40
        if text == self.text() and self._phase == 0:
            # Same text — just update style instantly, no flip
            if style:
                self.setStyleSheet(style)
            return
        self._pending = text
        self._pstyle  = style
        self._phase   = 1

    def _tick(self):
        if self._phase == 1:
            self._progress = max(0.0, self._progress - 0.22)
            self.setMaximumHeight(max(1, int(self._nat_h * self._progress)))
            if self._progress == 0.0:
                if self._pending is not None:
                    self.setText(self._pending); self._pending = None
                if self._pstyle:
                    self.setStyleSheet(self._pstyle); self._pstyle = None
                self._phase = 2
        elif self._phase == 2:
            self._progress = min(1.0, self._progress + 0.22)
            self.setMaximumHeight(max(1, int(self._nat_h * self._progress)))
            if self._progress >= 1.0:
                self.setMaximumHeight(16777215); self._phase = 0

class CounterLabel(QLabel):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._cur = 0; self._tgt = 0
        t = QTimer(self); t.timeout.connect(self._tick); t.start(16)

    def set_target(self, v):
        self._tgt = v

    def _tick(self):
        if self._cur != self._tgt:
            self._cur += 1 if self._tgt > self._cur else -1
            self.setText(f"{self._cur}%")

# ── Main window
class MyojamWindow(QMainWindow):
    gesture_done = pyqtSignal(str, float, list)

    def __init__(self):
        super().__init__()
        self.active       = False
        self.last_gesture = None
        self._busy        = False
        self._serial_port = None
        self._sensor_mode = False

        self.setWindowTitle("myojam")
        self.setMinimumSize(520, 680)
        self.resize(520, 680)
        self.setWindowFlags(Qt.WindowType.Window)

        # Transparent title bar, keep traffic lights
        QTimer.singleShot(150, self._setup_titlebar)

        # Central widget
        central = QWidget()
        central.setStyleSheet("background: #FFFFFF;")
        self.setCentralWidget(central)

        # Remove focus rectangles from all widgets
        app_instance = QApplication.instance()
        app_instance.setStyleSheet("* { outline: 0; }")

        # Force title bar transparent via unified toolbar trick
        self.setUnifiedTitleAndToolBarOnMac(True)
        self.setStyleSheet("QMainWindow { background: #FFFFFF; }")

        root = QVBoxLayout(central)
        central.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        root.setContentsMargins(28, 48, 28, 24)
        root.setSpacing(16)

        # Header
        header = QHBoxLayout()

        logo_icon  = QLabel()
        logo_px    = QPixmap(26, 26)
        logo_px.fill(Qt.GlobalColor.transparent)
        lp = QPainter(logo_px)
        lp.setRenderHint(QPainter.RenderHint.Antialiasing)
        lp.setPen(QPen(QColor("#FF2D78"), 1.2))
        lp.setBrush(Qt.BrushStyle.NoBrush)
        lp.drawEllipse(1, 1, 24, 24)
        lp.setPen(QPen(QColor("#FF2D78"), 1.6, Qt.PenStyle.SolidLine,
                       Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin))
        pts = [QPointF(3,13),QPointF(6,13),QPointF(8,8),QPointF(10,18),
               QPointF(12,11),QPointF(14,15),QPointF(16,13),
               QPointF(19,13),QPointF(21,9),QPointF(23,13)]
        for i in range(len(pts)-1):
            lp.drawLine(pts[i], pts[i+1])
        lp.setPen(Qt.PenStyle.NoPen)
        lp.setBrush(QBrush(QColor("#FF2D78")))
        lp.drawEllipse(QRectF(11,11,4,4))
        lp.end()
        logo_icon.setPixmap(logo_px)
        header.addWidget(logo_icon)

        logo_label = QLabel("myojam")
        logo_label.setStyleSheet("font-size: 20px; font-weight: 600; color: #1D1D1F; border: none;")
        header.addWidget(logo_label)
        header.addStretch()

        self.mode_label = QLabel("Dataset mode")
        self.mode_label.setStyleSheet("font-size: 12px; color: #AEAEB2; background: #F5F5F7; padding: 4px 12px; border-radius: 100px; border: none;")
        header.addWidget(self.mode_label)
        root.addLayout(header)

        self.sensor_btn = QPushButton("Connect sensor")
        self.sensor_btn.setFixedHeight(32)
        self.sensor_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.sensor_btn.setStyleSheet("""
            QPushButton { background: transparent; color: #AEAEB2;
                border: 1px solid #E0E0E0; border-radius: 16px;
                font-size: 12px; padding: 0 14px; }
            QPushButton:hover { color: #FF2D78; border-color: #FF2D78; }
        """)
        self.sensor_btn.clicked.connect(self.toggle_sensor)
        header.addWidget(self.sensor_btn)

        root.addWidget(self._divider())

        # Waveform
        lbl = QLabel("EMG signal")
        lbl.setStyleSheet("font-size: 13px; font-weight: 500; color: #1D1D1F;")
        root.addWidget(lbl)
        self.waveform = WaveformWidget()
        root.addWidget(self.waveform)

        # Prediction card
        pred_frame = QFrame()
        pred_frame.setStyleSheet("""
            QFrame { background:#F5F5F7; border-radius:16px; border:1px solid rgba(0,0,0,0.06); }
            QLabel { border:none; background:transparent; outline:0; }
        """)
        pred_layout = QHBoxLayout(pred_frame)
        pred_layout.setContentsMargins(20, 16, 20, 16)

        left_pred = QVBoxLayout()
        self.gesture_label = FlipLabel("—")
        self.gesture_label.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.gesture_label.setStyleSheet(
            "font-size:26px; font-weight:600; color:#FF2D78; letter-spacing:-0.5px;")
        self.action_label = QLabel("Waiting for input")
        self.action_label.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.action_label.setStyleSheet("font-size:13px; color:#6E6E73; font-weight:300;")
        left_pred.addWidget(self.gesture_label)
        left_pred.addWidget(self.action_label)
        pred_layout.addLayout(left_pred)
        pred_layout.addStretch()

        right_pred = QVBoxLayout()
        right_pred.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        conf_title = QLabel("confidence")
        conf_title.setStyleSheet("font-size:11px; color:#AEAEB2; font-weight:300;")
        conf_title.setAlignment(Qt.AlignmentFlag.AlignRight)
        self.conf_label = CounterLabel("—")
        self.conf_label.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.conf_label.setStyleSheet(
            "font-size:36px; font-weight:600; color:#FF2D78; letter-spacing:-1px;")
        self.conf_label.setAlignment(Qt.AlignmentFlag.AlignRight)
        right_pred.addWidget(conf_title)
        right_pred.addWidget(self.conf_label)
        pred_layout.addLayout(right_pred)
        root.addWidget(pred_frame)

        self.conf_bar = ConfidenceBar()
        root.addWidget(self.conf_bar)

        root.addWidget(self._divider())

        # Gesture buttons
        glbl = QLabel("Gesture map")
        glbl.setStyleSheet("font-size:13px; font-weight:500; color:#1D1D1F;")
        root.addWidget(glbl)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(8)
        self.gesture_buttons = {}
        for gid, gname, action, symbol in GESTURES:
            btn = GestureButton(gid, gname, action, symbol)
            self.gesture_buttons[gname] = btn
            btn_row.addWidget(btn)
        root.addLayout(btn_row)

        # Start button
        self.start_btn = QPushButton("Start")
        self.start_btn.setFixedHeight(48)
        self.start_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.start_btn.setStyleSheet("""
            QPushButton { background:#FF2D78; color:white; border:none;
                border-radius:24px; font-size:16px; font-weight:500; }
            QPushButton:hover { background:#E0245E; }
            QPushButton:pressed { background:#C21B52; }
        """)
        self.start_btn.clicked.connect(self.toggle_active)
        root.addWidget(self.start_btn)

        hint = QLabel("Press 1–6 while active to trigger gestures")
        hint.setStyleSheet("font-size:11px; color:#AEAEB2; font-weight:300;")
        hint.setAlignment(Qt.AlignmentFlag.AlignCenter)
        root.addWidget(hint)

        for w in central.findChildren(QLabel):
            w.setFocusPolicy(Qt.FocusPolicy.NoFocus)

        self.gesture_done.connect(self._on_gesture_done)

        # Global key listener
        self.global_keys = GlobalKeyListener()
        self.global_keys.key_pressed.connect(self.on_global_key)
        self.global_keys.start()

    def _setup_titlebar(self):
        try:
            from AppKit import NSApplication
            nsapp = NSApplication.sharedApplication()
            for nswin in nsapp.windows():
                if nswin.title() == "myojam":
                    nswin.setTitlebarAppearsTransparent_(True)
                    nswin.setTitleVisibility_(1)
                    nswin.setStyleMask_(nswin.styleMask() | (1 << 15))
                    break

            nswin.setBackgroundColor_(
            __import__('AppKit').NSColor.whiteColor()
)
        except Exception as e:
            print(f"Titlebar: {e}")

    def _divider(self):
        line = QFrame()
        line.setFrameShape(QFrame.Shape.HLine)
        line.setStyleSheet("background: rgba(0,0,0,0.06); border:none; max-height:1px;")
        return line

    def toggle_active(self):
        self.active = not self.active
        if self.active:
            self.start_btn.setText("Stop")
            self.start_btn.setStyleSheet("""
                QPushButton { background:#FFF0F5; color:#FF2D78;
                    border:1px solid rgba(255,45,120,0.3); border-radius:24px;
                    font-size:16px; font-weight:500; }
                QPushButton:hover { background:#FFE4EE; }
            """)
        else:
            self.start_btn.setText("Start")
            self.start_btn.setStyleSheet("""
                QPushButton { background:#FF2D78; color:white; border:none;
                    border-radius:24px; font-size:16px; font-weight:500; }
                QPushButton:hover { background:#E0245E; }
                QPushButton:pressed { background:#C21B52; }
            """)
            self.gesture_label.setText("—")
            self.gesture_label.setStyleSheet(
                "font-size:26px; font-weight:600; color:#FF2D78; letter-spacing:-0.5px;")
            self.action_label.setText("Waiting for input")
            self.conf_label.set_target(0)
            self.conf_label.setText("—")
            self.conf_label.setStyleSheet(
                "font-size:36px; font-weight:600; color:#FF2D78; letter-spacing:-1px;")
            self.conf_bar.set_value(0, ACCENT)
            self.waveform._data = [0.0] * 200
            self.waveform._prev = [0.0] * 200
            self.waveform._progress = 1.0
            self.waveform.update()
            for btn in self.gesture_buttons.values():
                btn.set_active(False)

    def on_global_key(self, gesture_id):
        if not self.active or self._sensor_mode:
            return
        if gesture_id == 5:
            threading.Thread(target=mouse_click, daemon=True).start()
            return
        if not self._busy:
            self._busy = True
            def run():
                self._process_gesture(gesture_id)
                self._busy = False
            threading.Thread(target=run, daemon=True).start()

    def _process_gesture(self, gesture_id):
        window = get_dataset_window(gesture_id)
        gesture_name, confidence, emg = predict_from_window(window)
        self.gesture_done.emit(gesture_name, confidence, window)
        execute_action(gesture_name)

    def _on_gesture_done(self, gesture_name, confidence, window):
        color     = GESTURE_COLORS.get(gesture_name, ACCENT)
        hex_color = color.name()
        self.waveform.update_data(window, color)
        self.gesture_label.flip_to(gesture_name,
        f"font-size:26px; font-weight:600; color:{hex_color}; letter-spacing:-0.5px;")
        action = next((a for _, g, a, _ in GESTURES if g == gesture_name), "—")
        self.action_label.setText(action)
        pct = int(confidence * 100)
        self.conf_label.set_target(pct)
        self.conf_label.setStyleSheet(
            "font-size:36px; font-weight:600; color:#FF2D78; letter-spacing:-1px;")
        self.conf_bar.set_value(confidence, color)
        for gname, btn in self.gesture_buttons.items():
            btn.set_active(gname == gesture_name)
        self.last_gesture = gesture_name

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton and hasattr(self, '_drag_pos'):
            self.move(event.globalPosition().toPoint() - self._drag_pos)

    def toggle_sensor(self):
        if self._sensor_mode:
            self._disconnect_sensor()
        else:
            self._connect_sensor()

    def _connect_sensor(self):
        import serial.tools.list_ports
        ports = list(serial.tools.list_ports.comports())
        arduino = next(
            (p.device for p in ports if "usbmodem" in p.device or "usbserial" in p.device),
            ports[0].device if ports else None
        )
        if not arduino:
            self.mode_label.setText("No sensor found")
            return
        try:
            import serial
            self._serial_port = serial.Serial(arduino, 9600, timeout=1)
            self._sensor_mode = True
            self.mode_label.setText("Sensor mode")
            self.sensor_btn.setText("Disconnect")
            threading.Thread(target=self._read_serial, daemon=True).start()
        except Exception as e:
            self.mode_label.setText(f"Failed: {e}")

    def _disconnect_sensor(self):
        self._sensor_mode = False
        if self._serial_port:
            try: self._serial_port.close()
            except: pass
            self._serial_port = None
        self.mode_label.setText("Dataset mode")
        self.sensor_btn.setText("Connect sensor")

    def _read_serial(self):
        buf = []
        REST_THRESHOLD = 0.03  # tune this — amplitude below = ignore
        while self._sensor_mode and self._serial_port:
            try:
                raw = self._serial_port.readline().decode("utf-8", errors="ignore").strip()
                if not raw:
                    continue
                val = float(raw)
                channels = [val] * 16
                buf.append(channels)
                if len(buf) >= 200:
                    window = buf[:200]
                    buf = buf[100:]
                    
                    # Only classify if signal is above rest threshold
                    signal = [row[0] for row in window]
                    amplitude = np.mean(np.abs(signal))
                    if amplitude < REST_THRESHOLD:
                        continue  # arm at rest, skip
                    
                    gesture_name, confidence, emg = predict_from_window(window)
                    
                    # Skip if low confidence or rest predicted
                    if confidence < 0.5 or gesture_name == "rest":
                        continue
                        
                    if self.active:
                        execute_action(gesture_name)
                    self.gesture_done.emit(gesture_name, confidence, window)
            except ValueError:
                pass
            except Exception:
                time.sleep(0.01)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setApplicationDisplayName("myojam")
    app.setApplicationName("myojam")
    try:
        from AppKit import NSBundle
        NSBundle.mainBundle().infoDictionary()['CFBundleName'] = 'myojam'
    except:
        pass
    app.setStyle("Fusion")

    # Dock icon
    icon_px = QPixmap(256, 256)
    icon_px.fill(Qt.GlobalColor.transparent)
    ip = QPainter(icon_px)
    ip.setRenderHint(QPainter.RenderHint.Antialiasing)
    ip.setBrush(QBrush(QColor("#FF2D78")))
    ip.setPen(Qt.PenStyle.NoPen)
    ip.drawRoundedRect(20, 20, 216, 216, 48, 48)
    ip.setPen(QPen(QColor("white"), 7, Qt.PenStyle.SolidLine,
                   Qt.PenCapStyle.RoundCap, Qt.PenJoinStyle.RoundJoin))
    pts = [QPointF(30,128),QPointF(58,128),QPointF(76,82),QPointF(94,174),
           QPointF(112,100),QPointF(130,156),QPointF(148,128),
           QPointF(170,128),QPointF(188,84),QPointF(226,128)]
    for i in range(len(pts)-1):
        ip.drawLine(pts[i], pts[i+1])
    ip.setPen(Qt.PenStyle.NoPen)
    ip.setBrush(QBrush(QColor("white")))
    ip.drawEllipse(QRectF(112,112,32,32))
    ip.end()
    app.setWindowIcon(QIcon(icon_px))

    window = MyojamWindow()
    window.show()
    sys.exit(app.exec())