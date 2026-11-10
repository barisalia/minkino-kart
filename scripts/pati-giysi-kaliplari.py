"""Rebuild the body-registered wardrobe assets."""
from pathlib import Path
import subprocess

if __name__ == "__main__":
    subprocess.run(["node", str(Path(__file__).with_name("pati-govde-kaliplari.mjs"))], check=True)
