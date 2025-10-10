install-maven.ps1

Purpose

A PowerShell script to download and install Apache Maven for the current user on Windows. It extracts Maven into %USERPROFILE%\tools, sets the user environment variable MAVEN_HOME, and updates the user's PATH to include %MAVEN_HOME%\bin.

Usage

Open PowerShell (no admin required) and run:

```powershell
# allow script to run in this session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
# run the installer (specify version if you want)
.\scripts\install-maven.ps1 -Version 3.9.6
```

After the script completes, open a new PowerShell window (or sign out/in) and verify with:

```powershell
mvn -version
```

Notes

- The script updates the CURRENT USER environment variables only. It does not require administrator rights.
- Java (JDK 8+) must be installed and accessible via JAVA_HOME or on the PATH. The script does not install Java.
- If you already have Maven installed and want to reinstall, run with the `-Force` flag.
- If the default download mirror fails, you may re-run the script with `-Mirror "https://archive.apache.org"`.

Support

If the script fails, paste the PowerShell error and the lines shown so we can help diagnose.