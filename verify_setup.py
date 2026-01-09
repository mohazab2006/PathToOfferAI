"""
Setup Verification Script
Run this to check if your environment is set up correctly
"""
import os
import sys

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("[X] Python 3.8+ required. Current:", sys.version)
        return False
    print(f"[OK] Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    # Map package names to import names
    packages = {
        "streamlit": "streamlit",
        "openai": "openai",
        "pydantic": "pydantic",
        "reportlab": "reportlab",
        "PyPDF2": "PyPDF2",
        "python-dotenv": "dotenv",  # Import name is 'dotenv', not 'python-dotenv'
        "sqlalchemy": "sqlalchemy"
    }
    
    missing = []
    for package_name, import_name in packages.items():
        try:
            __import__(import_name)
            print(f"[OK] {package_name}")
        except ImportError:
            print(f"[X] {package_name} - not installed")
            missing.append(package_name)
    
    if missing:
        print(f"\nInstall missing packages: pip install {' '.join(missing)}")
        return False
    return True

def check_env_file():
    """Check if .env file exists and has API key"""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    
    if not os.path.exists(env_path):
        print("[X] .env file not found")
        print("   Create .env file with: OPENAI_API_KEY=your_key_here")
        return False
    
    print("[OK] .env file exists")
    
    # Check if API key is set (only if dotenv is installed)
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_openai_api_key_here":
            print("[X] OPENAI_API_KEY not set in .env file")
            print("   Add: OPENAI_API_KEY=your_actual_key_here")
            return False
        
        print("[OK] OPENAI_API_KEY is configured")
    except ImportError:
        print("[!] Cannot check API key (python-dotenv not installed)")
        print("   Install dependencies first, then re-run this script")
        return False
    
    return True

def check_directories():
    """Check if required directories exist or can be created"""
    dirs = ["assets", "storage", "core", "ai", "ui", "exporters", "demo"]
    
    for dir_name in dirs:
        dir_path = os.path.join(os.path.dirname(__file__), dir_name)
        if os.path.exists(dir_path):
            print(f"[OK] {dir_name}/ directory exists")
        else:
            print(f"[!] {dir_name}/ directory not found (will be created if needed)")
    
    return True

def main():
    """Run all checks"""
    print("PathToOffer AI - Setup Verification\n")
    print("=" * 50)
    
    all_ok = True
    
    print("\n1. Python Version:")
    all_ok &= check_python_version()
    
    print("\n2. Dependencies:")
    all_ok &= check_dependencies()
    
    print("\n3. Environment Variables:")
    all_ok &= check_env_file()
    
    print("\n4. Directory Structure:")
    check_directories()
    
    print("\n" + "=" * 50)
    if all_ok:
        print("\n[OK] All checks passed! You're ready to run the app.")
        print("\nRun: streamlit run app.py")
    else:
        print("\n[X] Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()

