#!/usr/bin/env pwsh
<#
Installs the workspace-recommended VS Code extensions used by Taskorator.
Run from project root in PowerShell.
#>

$extensions = @(
    'angular.ng-template',
    'ms-vscode.vscode-typescript-next',
    'esbenp.prettier-vscode',
    'dbaeumer.vscode-eslint',
    'github.copilot',
    'github.copilot-chat',
    'dracula-theme.theme-dracula',
    'christian-kohler.path-intellisense',
    'christian-kohler.npm-intellisense',
    'pkief.material-icon-theme'
)

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Error "The 'code' CLI was not found. Ensure VS Code is installed and the 'code' command is on PATH."
    exit 1
}

foreach ($ext in $extensions) {
    Write-Host "Installing $ext..."
    code --install-extension $ext --force | Out-Null
}

Write-Host "Finished installing extensions. Restart VS Code if it was open."
