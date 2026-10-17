import os
import importlib.util

# Re-export standard library cmd attributes to prevent shadowing Python's built-in pdb/cmd
_stdlib_path = os.path.join(os.path.dirname(os.__file__), "cmd.py")
if os.path.exists(_stdlib_path):
    _spec = importlib.util.spec_from_file_location("_stdlib_cmd", _stdlib_path)
    _mod = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_mod)
    for _attr in dir(_mod):
        if not _attr.startswith("__"):
            globals()[_attr] = getattr(_mod, _attr)
