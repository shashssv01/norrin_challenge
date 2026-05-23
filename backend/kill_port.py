import os
import subprocess

print("Finding process on port 8000...")
try:
    output = subprocess.check_output("netstat -ano", shell=True).decode('utf-8')
    killed = False
    for line in output.splitlines():
        if ":8000" in line and "LISTENING" in line:
            parts = line.strip().split()
            pid = parts[-1]
            print(f"Found active process on port 8000 with PID: {pid}. Terminating...")
            os.system(f"taskkill /F /PID {pid}")
            killed = True
    if not killed:
        print("No processes found listening on port 8000.")
except Exception as e:
    print(f"Error checking or killing port 8000 process: {e}")
