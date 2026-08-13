<#
.SYNOPSIS
  Antigravity (agy) 스킬 설치 스크립트
.DESCRIPTION
  .agents/skills 폴더의 스킬들을 현재 워크스페이스 또는 전역(~/.gemini/config/skills)에 설치합니다.
.PARAMETER Global
  지정 시 전역(~/.gemini/config/skills)에 스킬을 설치합니다.
.PARAMETER Destination
  스킬을 설치할 대상 디렉터리를 직접 지정합니다.
#>
param (
    [switch]$Global,
    [string]$Destination = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$sourceSkillsDir = (Resolve-Path (Join-Path $projectRoot ".agents\skills")).Path

if (-not (Test-Path $sourceSkillsDir)) {
    Write-Error "스킬 소스 디렉터리를 찾을 수 없습니다: $sourceSkillsDir"
    exit 1
}

if ($Destination -ne "") {
    $targetDir = $Destination
} elseif ($Global) {
    $userProfile = [System.Environment]::GetFolderPath('UserProfile')
    $targetDir = Join-Path $userProfile ".gemini\config\skills"
} else {
    $userProfile = [System.Environment]::GetFolderPath('UserProfile')
    $targetDir = Join-Path $userProfile ".gemini\config\skills"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Antigravity (agy) 스킬 설치기" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "소스 경로: $sourceSkillsDir"
Write-Host "대상 경로: $targetDir"
Write-Host ""

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "[생성] 대상 디렉터리 생성 완료: $targetDir" -ForegroundColor Green
}

$resolvedTarget = (Resolve-Path $targetDir).Path
$skills = Get-ChildItem -Path $sourceSkillsDir -Directory

if ($resolvedTarget -eq $sourceSkillsDir) {
    Write-Host "[안내] 소스와 대상 디렉터리가 동일합니다 (.agents/skills 이미 준비됨)." -ForegroundColor Yellow
} else {
    foreach ($skill in $skills) {
        $dest = Join-Path $targetDir $skill.Name
        Copy-Item -Path $skill.FullName -Destination $dest -Recurse -Force
        Write-Host "[성공] 스킬 설치됨: $($skill.Name) -> $dest" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "모든 agy 스킬 설치가 완료되었습니다!" -ForegroundColor Cyan
Write-Host "스킬 목록:"
foreach ($skill in $skills) {
    Write-Host " - $($skill.Name)" -ForegroundColor Yellow
}
