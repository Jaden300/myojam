import sys
import time

from Quartz import (
    CGEventTapCreate, CGEventTapEnable, CFMachPortCreateRunLoopSource,
    CFRunLoopAddSource, CFRunLoopGetCurrent, CFRunLoopRun,
    kCGSessionEventTap, kCGHeadInsertEventTap,
    kCGEventKeyDown, CGEventGetIntegerValueField, kCGKeyboardEventKeycode,
    kCFRunLoopCommonModes
)

KEY_CODES = {18: '1', 19: '2', 20: '3', 21: '4', 23: '5', 22: '6'}

last_time = {}
DEBOUNCE = 0.4

def callback(proxy, event_type, event, refcon):
    keycode = CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode)
    if keycode in KEY_CODES:
        key = KEY_CODES[keycode]
        now = time.time()
        if now - last_time.get(key, 0) > DEBOUNCE:
            last_time[key] = now
            sys.stdout.write(key + '\n')
            sys.stdout.flush()
    return event

tap = CGEventTapCreate(
    kCGSessionEventTap,
    kCGHeadInsertEventTap,
    0,
    1 << kCGEventKeyDown,
    callback,
    None
)

if tap is None:
    sys.stderr.write("Failed — grant Accessibility access to python3.\n")
    sys.exit(1)

source = CFMachPortCreateRunLoopSource(None, tap, 0)
CFRunLoopAddSource(CFRunLoopGetCurrent(), source, kCFRunLoopCommonModes)
CGEventTapEnable(tap, True)
CFRunLoopRun()