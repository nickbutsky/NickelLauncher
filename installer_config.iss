#define AppId "{52CE7B35-D314-43D5-99E9-9745A77976E4}"

#define AppExeName AppName + ".exe"
#define AppSourceDir "dist\" + AppName

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
AppId={{#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={localappdata}\Programs\{#AppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyMemo=yes
DisableReadyPage=yes
OutputBaseFilename={#AppName} {#AppVersion}
OutputDir=dist
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
Compression=lzma
SolidCompression=yes
WizardSizePercent=100
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#AppSourceDir}\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#AppSourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "UninsIS.dll"; Flags: dontcopy
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExeName}"

[Code]
function DLLIsISPackageInstalled(AppId: string; Is64BitInstallMode, IsAdminInstallMode: DWORD): DWORD;
  external 'IsISPackageInstalled@files:UninsIS.dll stdcall setuponly';

function DLLCompareISPackageVersion(AppId, InstallingVersion: string; Is64BitInstallMode, IsAdminInstallMode: DWORD): longint;
  external 'CompareISPackageVersion@files:UninsIS.dll stdcall setuponly';

function DLLUninstallISPackage(AppId: string; Is64BitInstallMode, IsAdminInstallMode: DWORD): DWORD;
  external 'UninstallISPackage@files:UninsIS.dll stdcall setuponly';

// Wrapper for UninsIS.dll IsISPackageInstalled() function
// Returns true if package is detected as installed, or false otherwise
function IsISPackageInstalled(): Boolean;
begin
  Result := DLLIsISPackageInstalled('{#AppId}', DWORD(Is64BitInstallMode()), DWORD(IsAdminInstallMode())) = 1;
end;

// Wrapper for UninsIS.dll CompareISPackageVersion() function
// Returns:
// < 0 if version we are installing is < installed version
// 0   if version we are installing is = installed version
// > 0 if version we are installing is > installed version
function CompareISPackageVersion(): LongInt;
begin
  Result := DLLCompareISPackageVersion('{#AppId}', '{#AppVersion}', DWORD(Is64BitInstallMode()), DWORD(IsAdminInstallMode()));                          
end;

// Wrapper for UninsIS.dll UninstallISPackage() function
// Returns 0 for success, non-zero for failure
function UninstallISPackage(): DWORD;
begin
  Result := DLLUninstallISPackage('{#AppId}', DWORD(Is64BitInstallMode()), DWORD(IsAdminInstallMode()));
end;

function InitializeSetup(): Boolean;
begin
  Result := True;

  if not IsISPackageInstalled() then exit;

  if (CompareISPackageVersion() = 0) then
  begin
    MsgBox('The application is already installed.', mbInformation, MB_OK);
    Result := False;
  end
  else if (CompareISPackageVersion() < 0) then
  begin
    MsgBox('A newer version of the application is already installed.', mbInformation, MB_OK);
    Result := False;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): string;
begin
  Result := '';
  if IsISPackageInstalled() and (CompareISPackageVersion() > 0) then
    UninstallISPackage();
end;
