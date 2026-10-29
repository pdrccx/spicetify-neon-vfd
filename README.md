# NEON//VFD

Tema para [Spicetify](https://spicetify.app) que convierte la barra de
reproducción de Spotify en el **display de un autoestéreo de los 2000**: letras
cian de 16 segmentos que avanzan como en el estéreo del carro, indicadores que
se encienden, un medidor de ritmo y los controles integrados en el mismo panel.
Y lleva ese estilo a todo Spotify: negro carbón con neón que se enciende solo en
lo que está activo, como un tablero de noche.

![Vista previa](preview.png)

*English version at the end.*

## ¿Qué es un VFD?

Los **VFD** (*vacuum fluorescent display*) son esas pantallas de brillo cian que
traían los estéreos Pioneer, Kenwood y Sony, las videocaseteras y los equipos de
sonido de los 90 y 2000. Las letras se forman encendiendo segmentos dentro de un
tubo de vidrio, y los segmentos apagados se alcanzan a ver tenues detrás. Este
tema imita eso: no es una fuente de "estilo digital", es un display dibujado
segmento por segmento.

## Lo que trae

### El display

- **Artista y título en 16 segmentos**, con los segmentos apagados visibles como
  "fantasma", igual que en un VFD real.
- **Marquesina:** el texto avanza de carácter en carácter, con una pausa al
  inicio de cada vuelta, como en el estéreo del carro.
- **Se ajusta al ancho de la ventana:** si haces Spotify más grande, caben más
  letras.
- **Indicadores** que se encienden: PLAY, PAUSE, RDM (aleatorio), RPT (repetir
  lista), RPT 1 (repetir canción) y MUTE.
- **Tiempo** transcurrido o restante: dale clic al reloj para cambiar.
- **Medidor de 12 barras** con la punta en ámbar (ver
  [abajo](#el-medidor-se-ve-apagado) cuándo funciona).
- **Parpadeo de encendido** al cambiar de canción.

### Escrituras de todo el mundo

- **Español y otros idiomas con acentos y ñ:** en 16 segmentos (la Ñ tiene su
  propio diseño).
- **Cirílico** (ruso, ucraniano…): también en 16 segmentos, con letras propias
  como Ж, Ф, Я o Щ, igual que en los tubos VFD soviéticos de 16 segmentos.
- **Japonés, coreano y chino:** el display cambia solo a **matriz de puntos**,
  como los estéreos japoneses de gama alta. Ahí se ven kanji, hiragana, katakana
  y hangul.

### Toda la barra es el panel

- La barra de abajo completa se vuelve un solo panel negro con scanlines, como
  el cristal de un estéreo.
- **Aleatorio, anterior, play/pausa, siguiente y repetir** viven dentro del
  display, como íconos cian que brillan. Aleatorio y repetir se encienden en
  ámbar con un LED cuando están activos.
- Los botones de la derecha (letra, cola, dispositivo, volumen, mini
  reproductor, pantalla completa) toman el mismo estilo.

### El resto de Spotify

La regla es **oscuro por defecto; el neón solo se enciende en lo activo, lo
seleccionado o al pasar el mouse**. Así destaca lo importante en vez de que todo
brille al mismo tiempo.

- Paneles negro carbón con borde tenue y sombra interior.
- Títulos en **Orbitron**; tiempos y etiquetas en **JetBrains Mono**.
- Chips (Todo, Música, Podcasts…) como botones de equipo: el elegido, encendido
  en cian.
- Cards, portadas y accesos rápidos que se encienden al pasar el mouse.
- Buscador que se ilumina al escribir.
- Barras de desplazamiento finas en cian.

### Con Spicy Lyrics

Si usas la extensión **Spicy Lyrics**, el tema oscurece su fondo de colores (para
que se vea como un resplandor y no como una pared de color) y hace que **la
línea que se está cantando brille en cian**.

## Instalación

### Opción 1: desde el Marketplace (recomendada)

1. Instala Spicetify y su Marketplace siguiendo la
   [guía oficial](https://spicetify.app/docs/getting-started).
2. Abre Spotify, entra al **Marketplace** (en la barra de arriba) y ve a la
   pestaña **Themes**.
3. Busca **NEON//VFD** e instálalo.

### Opción 2: a mano (Windows)

Necesitas Spicetify, [Git](https://git-scm.com) y [Node.js](https://nodejs.org).
En PowerShell:

```powershell
git clone https://github.com/pdrccx/spicetify-neon-vfd
cd spicetify-neon-vfd
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

El script arma el tema, guarda tu tema actual, lo instala y corre
`spicetify apply` (**Spotify se reinicia**). Para quitarlo y regresar al tema que
tenías:

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

> Usa **solo una** de las dos opciones. Si lo instalas a mano y además desde el
> Marketplace, se carga dos veces.

## Personalizar

- **Animaciones:** abre el menú de tu perfil (tu foto, arriba a la derecha) →
  **"NEON//VFD · Animaciones"**. Cada clic cambia entre *Siempre* (la opción por
  defecto), *Seguir a Windows* y *Nunca*. Con *Seguir a Windows*, si tienes
  apagados los efectos de animación de Windows, el texto y el medidor se quedan
  quietos.
- **Colores** (instalación a mano): edita `src/color.ini` y vuelve a correr
  `install.ps1`.

## Problemas comunes

### El display no aparece

Casi siempre es porque **Spotify se actualizó** y Spicetify perdió sus cambios.
Corre:

```powershell
spicetify backup apply
```

Si sigue sin aparecer, abre un [issue](https://github.com/pdrccx/spicetify-neon-vfd/issues)
con tu versión de Spotify y de Spicetify: Spotify cambia sus nombres internos con
cada versión y a veces hay que ajustar el tema.

### El texto o el medidor no se mueven

Revisa el menú de tu perfil → **"NEON//VFD · Animaciones"** y elige *Siempre*.

### El medidor se ve apagado

Spotify no deja leer el audio (viene cifrado), así que el medidor usa el
**análisis que Spotify hace de cada canción**. En algunas versiones de Spotify
ese análisis no responde, y entonces el medidor se queda atenuado a propósito en
vez de moverse sin sentido.

### Los títulos en japonés o coreano se ven "de puntos"

Es a propósito: un display de 16 segmentos no puede dibujar kanji ni hangul, así
que cambia a matriz de puntos, como hacían los estéreos japoneses.

### PowerShell no deja correr el script

Usa el comando tal cual viene arriba, con `-ExecutionPolicy Bypass`. Esa opción
solo aplica a esa ejecución y no cambia tu configuración de seguridad.

## Compatibilidad

Probado en **Spotify 1.3.3** (Windows) con **Spicetify 2.45**. En esa versión
casi todo el API del reproductor de Spicetify falla; el tema lo detecta y lee el
estado directamente de Spotify, así que funciona igual.

## Desarrollo

| Archivo | Qué es |
|---|---|
| `src/color.ini` | Paleta (se copia tal cual) |
| `src/user.css` | Estilos; `build.mjs` le incrusta las fuentes |
| `src/theme.js` | Display, controles, indicadores y medidor |
| `src/segment16.js` | Motor de 16 segmentos (latín, cirílico, signos) |
| `src/dotmatrix.js` | Matriz de puntos para japonés, coreano, chino y otras escrituras |
| `fonts/` | Orbitron, Inter y JetBrains Mono (subconjunto latino) y sus licencias |
| `build.mjs` | Arma `NeonVFD/` |
| `test/check.mjs` | Prueba el tema en una página que imita a Spotify (necesita Electron) |

```powershell
node build.mjs
$env:ELECTRON = "ruta\a\electron.exe"; node test/check.mjs
```

## Créditos y licencias

- Código bajo licencia [MIT](LICENSE). Las fuentes de `fonts/` no están bajo MIT
  sino bajo su propia licencia (abajo).
- Diseño: estilo NEON//VFD del Cordero Design System, de Pedro.
- Fuentes bajo la [SIL Open Font License 1.1](fonts/LICENSE-Orbitron.txt):
  [Orbitron](https://github.com/theleagueof/orbitron),
  [Inter](https://github.com/rsms/inter) y
  [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono).
- Modificar el cliente de Spotify técnicamente va contra sus términos de uso.

---

## English

**NEON//VFD** turns Spotify's playback bar into a **2000s car stereo VFD
display** and brings that look to the whole app.

- **16-segment display** for artist and title, with visible "ghost" segments, a
  character-by-character marquee, and auto-fit to the window width.
- **Indicators** (PLAY, PAUSE, RDM, RPT, RPT 1, MUTE), elapsed/remaining time
  (click to toggle), and a 12-bar level meter.
- **Built-in controls:** shuffle, previous, play/pause, next and repeat live
  inside the display; the whole bottom bar becomes one VFD panel.
- **Any script:** Latin (with accents) and **Cyrillic** in 16 segments;
  **Japanese, Korean and Chinese** switch to a **dot-matrix** display.
- **Whole-app styling:** dark charcoal panels; cyan neon lights up only on what's
  active, selected or hovered. Works nicely with **Spicy Lyrics**.

**Install:** Spicetify Marketplace → Themes → search **NEON//VFD**. Or clone
this repo and run `install.ps1` (Windows).

**Animations:** profile menu → "NEON//VFD · Animaciones" (Always / Follow
Windows / Never). **Display missing after a Spotify update?** Run
`spicetify backup apply`.

Tested on Spotify 1.3.3 (Windows) with Spicetify 2.45. MIT license; fonts under
the SIL Open Font License 1.1.
