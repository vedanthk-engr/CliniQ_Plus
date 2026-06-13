import sys
import traceback

try:
    import main
    print("Main imported successfully")
except Exception as e:
    print("Exception caught:")
    traceback.print_exc()
