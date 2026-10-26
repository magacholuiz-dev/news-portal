# Vídeo de fundo da abertura

Envie em **Admin → Configurações → Vídeo de fundo da abertura**.

Requisitos: 10 a 20 segundos, sem áudio, em loop, MP4 e WebM (não use link do YouTube).

| Versão  | Resolução | Peso alvo | Campos                    |
|---------|-----------|-----------|---------------------------|
| Desktop | 1920×1080 | até ~8 MB | Desktop — MP4 e WebM      |
| Celular | 1280×720  | até ~3 MB | Celular — MP4 e WebM      |

Compressão com [ffmpeg](https://ffmpeg.org/) (troque `entrada.mov` pelo arquivo original):

```bash
# Desktop MP4 (H.264)
ffmpeg -i entrada.mov -t 15 -an -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 29 -preset slow -movflags +faststart desktop.mp4
# Desktop WebM (VP9)
ffmpeg -i entrada.mov -t 15 -an -vf "scale=1920:-2,fps=24" -c:v libvpx-vp9 -crf 38 -b:v 0 desktop.webm
# Celular MP4
ffmpeg -i entrada.mov -t 15 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 31 -preset slow -movflags +faststart celular.mp4
# Celular WebM
ffmpeg -i entrada.mov -t 15 -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -crf 40 -b:v 0 celular.webm
```

Se passar do peso, aumente o número do `-crf` (ex.: 29 → 32). O limite de envio no admin é 16 MB por arquivo.

**Imagem de capa:** um quadro do vídeo salvo em JPG/WebP com até ~200 KB. Ela aparece enquanto o vídeo carrega
(meta: menos de 2 s em 4G), em conexão lenta, com "economizar dados" e para quem prefere menos movimento.
Para extrair um quadro: `ffmpeg -i desktop.mp4 -ss 2 -frames:v 1 -vf scale=1600:-2 -q:v 4 capa.jpg`
