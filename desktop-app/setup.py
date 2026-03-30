from setuptools import setup

APP = ['myojam.py']
DATA_FILES = [
    ('model', ['model/my_gesture_classifier.pkl', 'model/my_pipeline_config.pkl']),
    ('data/DB5_s1', ['data/DB5_s1/S1_E1_A1.mat']),
    ('', ['keywatcher.py']),
]
OPTIONS = {
    'argv_emulation': False,
    'packages': ['sklearn', 'scipy', 'numpy', 'PyQt6', 'serial'],
    'includes': ['scipy.io', 'scipy.signal'],
    'iconfile': None,
    'plist': {
        'CFBundleName': 'myojam',
        'CFBundleDisplayName': 'myojam',
        'CFBundleIdentifier': 'com.myojam.app',
        'CFBundleVersion': '1.0.0',
        'NSHighResolutionCapable': True,
    }
}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={'py2app': OPTIONS},
    setup_requires=['py2app'],
)