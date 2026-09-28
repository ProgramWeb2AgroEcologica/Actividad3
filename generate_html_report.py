import os
import markdown

md_path = "INFORME_ACTIVIDAD_03.md"
html_path = "INFORME_ACTIVIDAD_03.html"

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Convert markdown to html with extensions
html_body = markdown.markdown(text, extensions=["tables", "fenced_code", "toc"])

html_document = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INFORME ACTIVIDAD 03 - UPDS PROGRAMACIÓN WEB II</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #1e3a8a;
            --primary-dark: #0f172a;
            --secondary: #0284c7;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --bg-body: #f8fafc;
            --bg-card: #ffffff;
            --border: #e2e8f0;
            --code-bg: #0f172a;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            line-height: 1.65;
            padding: 40px 20px;
        }}

        .container {{
            max-width: 960px;
            margin: 0 auto;
            background: var(--bg-card);
            padding: 60px 80px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border-radius: 8px;
            border: 1px solid var(--border);
        }}

        h1, h2, h3, h4, h5, h6 {{
            color: var(--primary-dark);
            font-weight: 700;
            margin-top: 1.8em;
            margin-bottom: 0.6em;
            line-height: 1.3;
        }}

        h1 {{
            font-size: 2.2rem;
            border-bottom: 3px solid var(--primary);
            padding-bottom: 12px;
            text-align: center;
        }}

        h2 {{
            font-size: 1.5rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
            color: var(--primary);
        }}

        h3 {{
            font-size: 1.2rem;
            color: #334155;
        }}

        p {{
            margin-bottom: 1.1em;
            text-align: justify;
        }}

        ul, ol {{
            margin-left: 24px;
            margin-bottom: 1.2em;
        }}

        li {{
            margin-bottom: 0.4em;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            font-size: 0.92rem;
        }}

        th, td {{
            padding: 10px 14px;
            border: 1px solid var(--border);
            text-align: left;
        }}

        th {{
            background-color: #f1f5f9;
            font-weight: 600;
            color: var(--primary-dark);
        }}

        tr:nth-child(even) {{
            background-color: #f8fafc;
        }}

        code {{
            font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
            background-color: #f1f5f9;
            color: #b91c1c;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.88em;
        }}

        pre {{
            background-color: var(--code-bg);
            color: #f8fafc;
            padding: 18px 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            font-size: 0.88rem;
        }}

        pre code {{
            background-color: transparent;
            color: #e2e8f0;
            padding: 0;
            border-radius: 0;
        }}

        blockquote {{
            border-left: 4px solid var(--secondary);
            background-color: #f0f9ff;
            padding: 14px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-style: normal;
            color: #0369a1;
        }}

        hr {{
            border: none;
            height: 1px;
            background-color: var(--border);
            margin: 40px 0;
        }}

        .print-btn {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(30, 58, 138, 0.4);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
            transition: all 0.2s;
        }}

        .print-btn:hover {{
            background: #172554;
            transform: translateY(-2px);
        }}

        @media print {{
            body {{
                background-color: white;
                padding: 0;
            }}
            .container {{
                box-shadow: none;
                border: none;
                padding: 0;
                max-width: 100%;
            }}
            .print-btn {{
                display: none;
            }}
            h2 {{
                page-break-before: always;
            }}
            h2:first-of-type {{
                page-break-before: avoid;
            }}
            pre, table {{
                page-break-inside: avoid;
            }}
        }}
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Guardar como PDF / Imprimir
    </button>
    <div class="container">
        {html_body}
    </div>
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_document)

print(f"Reporte generado exitosamente en {html_path}")
