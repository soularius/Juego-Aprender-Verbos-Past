"""
Genera scaffold_es con la respuesta correcta rellenada y traduccion real al espanol
via Google Translate (endpoint publico, sin API key).
Ejecutar: python scripts/add-translations.py
"""
import json, re, time, sys
import urllib.request, urllib.parse

def translate_google(text: str) -> str:
    """Traduce texto de ingles a espanol usando el endpoint publico de Google."""
    url = "https://translate.googleapis.com/translate_a/single"
    params = urllib.parse.urlencode({
        "client": "gtx",
        "sl": "en",
        "tl": "es",
        "dt": "t",
        "q": text
    })
    full_url = url + "?" + params
    req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read().decode("utf-8")
            # Parsear la respuesta JSON manualmente (evita dependencia de json en algunos casos)
            data = json.loads(raw)
            segments = data[0]
            return "".join(seg[0] for seg in segments if seg[0])
    except Exception as e:
        return ""   # Si falla, devuelve vacio; se reintentara


def fill_answers(scaffold: str, correct_answer: str) -> str:
    """Rellena los placeholders con la respuesta correcta."""
    parts = [p.strip() for p in correct_answer.split(" / ")]
    text = scaffold
    # Reemplazar {{ans_N}}
    for i, part in enumerate(parts):
        text = text.replace(f"{{{{ans_{i+1}}}}}", part)
    text = re.sub(r"\{\{ans_\d+\}\}", "?", text)
    # Reemplazar ___ literales (usados en some_any, uncertainty, food)
    for part in parts:
        text = text.replace("___", part, 1)
    return text


def main():
    path = "data/questions.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Recoger todas las preguntas que necesitan traduccion
    all_qs = [(g_idx, q_idx, q)
              for g_idx, group in enumerate(data)
              for q_idx, q in enumerate(group["questions"])]

    total   = len(all_qs)
    done    = 0
    errors  = 0

    for g_idx, q_idx, q in all_qs:
        filled = fill_answers(q["scaffold"], q["correct_answer"])

        # Intentar hasta 3 veces
        translated = ""
        for attempt in range(3):
            translated = translate_google(filled)
            if translated:
                break
            time.sleep(0.5)

        data[g_idx]["questions"][q_idx]["scaffold_es"] = translated if translated else filled
        done += 1

        if not translated:
            errors += 1

        # Progreso cada 50
        if done % 50 == 0:
            pct = done / total * 100
            sys.stderr.write(f"\r  {done}/{total} ({pct:.0f}%)  errores:{errors}   ")
            sys.stderr.flush()

        # Pausa minima para no sobrecargar el endpoint
        time.sleep(0.06)

    sys.stderr.write(f"\r  {done}/{total} - Listo. Errores: {errors}\n")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"OK: scaffold_es generado para {done} preguntas ({errors} sin traducir).")


if __name__ == "__main__":
    main()
