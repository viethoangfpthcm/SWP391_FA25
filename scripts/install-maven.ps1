<#
PowerShell script to download and install Apache Maven for the current user.
- Downloads the binary zip for the specified version.
- Extracts into $env:USERPROFILE\tools\apache-maven-{version}
- Sets user environment variables: MAVEN_HOME and updates PATH to include %MAVEN_HOME%\bin
- Does not require admin rights (uses user environment variables).

Usage (run as user in PowerShell):
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
  .\scripts\install-maven.ps1 -Version 3.9.6

Notes:
- Java (JDK 8+) must be installed and JAVA_HOME should be set or available on PATH.
- This script updates the CURRENT USER environment variables; you may need to open a new shell for changes to apply.
#>
param(
    [string]$Version = "3.9.6",
    [ValidateSet("https://downloads.apache.org","https://archive.apache.org")]
    [string]$Mirror = "https://downloads.apache.org",
    [switch]$Force
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-ErrorAndExit($m){ Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

try {
    Write-Info "Preparing to install Maven $Version for current user"

    $toolsDir = Join-Path $env:USERPROFILE 'tools'
    if (-not (Test-Path $toolsDir)){
        Write-Info "Creating tools directory: $toolsDir"
        New-Item -ItemType Directory -Path $toolsDir | Out-Null
    }

    $zipName = "apache-maven-$Version-bin.zip"
    $downloadUrl = "$Mirror/maven/maven-3/$Version/binaries/$zipName"
    $destZip = Join-Path $env:TEMP $zipName

    if ((Test-Path (Join-Path $toolsDir "apache-maven-$Version")) -and -not $Force) {
        Write-Info "Maven $Version already exists at $toolsDir\apache-maven-$Version. Use -Force to reinstall."
        exit 0
    }

    Write-Info "Downloading $downloadUrl"
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $destZip -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-ErrorAndExit ("Failed to download Maven from {0}. Error: {1}" -f $downloadUrl, $_.Exception.Message)
    }

    Write-Info "Extracting to $toolsDir"
    Expand-Archive -Path $destZip -DestinationPath $toolsDir -Force

    $installPath = Join-Path $toolsDir "apache-maven-$Version"
    if (-not (Test-Path $installPath)){
        Write-ErrorAndExit ("Extraction failed: {0} not found" -f $installPath)
    }

    # Set user environment variable MAVEN_HOME
    Write-Info "Setting user environment variable MAVEN_HOME -> $installPath"
    setx MAVEN_HOME $installPath | Out-Null

    # Update user PATH to include %MAVEN_HOME%\bin if not present
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $mavenBinToken = '%MAVEN_HOME%\bin'
    if ($null -eq $currentPath -or $currentPath -notlike "*$mavenBinToken*"){
        $newPath = if ([string]::IsNullOrEmpty($currentPath)) { $mavenBinToken } else { "$currentPath;$mavenBinToken" }
        Write-Info "Updating user PATH to include $mavenBinToken"
        setx Path $newPath | Out-Null
    } else {
        Write-Info "User PATH already contains $mavenBinToken"
    }

    Write-Info "Cleaning up: removing $destZip"
    Remove-Item $destZip -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host ("Maven {0} installed to: {1}" -f $Version, $installPath) -ForegroundColor Green
    Write-Host "MAVEN_HOME set for current user. You must open a new PowerShell to see changes or run:`n`n  $env:Path += ';' + (Get-ChildItem Env:MAVEN_HOME).Value + '\\bin'`n
    Write-Host "Verify with: mvn -version" -ForegroundColor Green

} catch {
    Write-ErrorAndExit ("Unexpected error: {0}" -f $_.Exception.Message)
}