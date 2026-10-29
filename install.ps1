# Instala el tema NEON//VFD en Spicetify y lo aplica.
# Guarda el tema que tenías en .previous-theme para que uninstall.ps1 lo regrese.
# Ojo: "spicetify apply" reinicia Spotify.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$config = Join-Path $env:APPDATA 'spicetify\config-xpui.ini'
if (-not (Test-Path $config)) { throw "No encontré la configuración de Spicetify en $config" }

# 1. Armar el tema
node build.mjs
if ($LASTEXITCODE -ne 0) { throw 'Falló build.mjs' }

# 2. Recordar el tema actual (solo la primera vez, para no pisarlo con NeonVFD)
$ini = Get-Content $config
$prevTheme = (($ini | Select-String '^current_theme\s*=\s*(.*)$').Matches.Groups[1].Value).Trim()
$prevScheme = (($ini | Select-String '^color_scheme\s*=\s*(.*)$').Matches.Groups[1].Value).Trim()
if ($prevTheme -ne 'NeonVFD') {
  @{ theme = $prevTheme; scheme = $prevScheme } | ConvertTo-Json | Set-Content '.previous-theme' -Encoding utf8
  Write-Host "Tema anterior guardado: '$prevTheme' (esquema '$prevScheme')"
}

# 3. Copiar a la carpeta de temas de Spicetify
$dest = Join-Path $env:APPDATA 'spicetify\Themes\NeonVFD'
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item 'NeonVFD\*' $dest -Force

# 4. Activar y aplicar (pares clave valor: tema y esquema de color)
spicetify config current_theme NeonVFD color_scheme Neon inject_css 1 replace_colors 1 inject_theme_js 1
spicetify apply
