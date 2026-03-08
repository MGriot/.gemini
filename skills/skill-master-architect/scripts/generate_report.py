#!/usr/bin/env python3
"""Generate an HTML dashboard and report from run_loop.py output.

Combines high-level performance charts with detailed per-query results.
"""

import argparse
import html
import json
import sys
from pathlib import Path


def generate_html(data: dict, auto_refresh: bool = False, skill_name: str = "") -> str:
    """Generate HTML dashboard and detailed report from loop output data."""
    history = data.get("history", [])
    title_prefix = html.escape(skill_name + " \u2014 ") if skill_name else ""

    # Prepare data for Chart.js
    labels = [f"Iter {h.get('iteration', '?')}" for h in history]
    train_scores = []
    test_scores = []
    
    for h in history:
        train_passed = h.get("train_passed", h.get("passed", 0))
        train_total = h.get("train_total", h.get("total", 1))
        train_scores.append(round((train_passed / train_total) * 100, 1) if train_total > 0 else 0)
        
        if h.get("test_passed") is not None:
            test_passed = h.get("test_passed")
            test_total = h.get("test_total", 1)
            test_scores.append(round((test_passed / test_total) * 100, 1) if test_total > 0 else 0)
        else:
            test_scores.append(None)

    # Prepare breakdown data (last iteration)
    last_h = history[-1] if history else {}
    breakdown_labels = []
    breakdown_data = []
    breakdown_colors = []
    
    all_results = last_h.get("train_results", last_h.get("results", [])) + last_h.get("test_results", [])
    for r in all_results:
        breakdown_labels.append(r["query"][:30] + "...")
        rate = round((r.get("triggers", 0) / r.get("runs", 1)) * 100, 1)
        # If should_trigger is false, we want accuracy which is (1 - rate)
        if not r.get("should_trigger", True):
            effective_rate = 100 - rate
        else:
            effective_rate = rate
        breakdown_data.append(effective_rate)
        breakdown_colors.append("#788c5d" if r.get("pass") else "#c44")

    # Get all unique queries for the detailed table
    train_queries: list[dict] = []
    test_queries: list[dict] = []
    if history:
        for r in history[0].get("train_results", history[0].get("results", [])):
            train_queries.append({"query": r["query"], "should_trigger": r.get("should_trigger", True)})
        if history[0].get("test_results"):
            for r in history[0].get("test_results", []):
                test_queries.append({"query": r["query"], "should_trigger": r.get("should_trigger", True)})

    refresh_tag = '    <meta http-equiv="refresh" content="5">\n' if auto_refresh else ""

    html_start = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
{refresh_tag}    <title>{title_prefix}Optimization Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Lora:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {{
            font-family: 'Lora', Georgia, serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: #faf9f5;
            color: #141413;
        }}
        h1 {{ font-family: 'Poppins', sans-serif; color: #141413; margin-bottom: 30px; }}
        h2 {{ font-family: 'Poppins', sans-serif; font-size: 1.2rem; margin-top: 40px; color: #333; }}
        .dashboard-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }}
        .card {{
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e8e6dc;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }}
        .card h2 {{
            font-family: 'Poppins', sans-serif;
            font-size: 1.1rem;
            margin-top: 0;
            margin-bottom: 20px;
            color: #555;
        }}
        .explainer {{
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #141413;
            color: #666;
            font-size: 0.9rem;
            line-height: 1.6;
        }}
        .stats-row {{
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-box {{
            flex: 1;
            background: #141413;
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }}
        .stat-value {{
            font-family: 'Poppins', sans-serif;
            font-size: 1.8rem;
            font-weight: 600;
            display: block;
        }}
        .stat-label {{
            font-size: 0.8rem;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .summary-card {{
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e8e6dc;
            margin-bottom: 30px;
        }}
        .summary-card p {{ margin: 8px 0; font-size: 0.95rem; }}
        .best-desc {{
            font-family: monospace;
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            display: block;
            margin-top: 10px;
            border: 1px solid #eee;
            font-size: 0.85rem;
            white-space: pre-wrap;
        }}
        .table-container {{
            overflow-x: auto;
            width: 100%;
            margin-top: 20px;
        }}
        table {{
            border-collapse: collapse;
            background: white;
            border: 1px solid #e8e6dc;
            border-radius: 8px;
            font-size: 11px;
            width: 100%;
        }}
        th, td {{
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #e8e6dc;
        }}
        th {{
            font-family: 'Poppins', sans-serif;
            background: #f8f7f2;
            color: #141413;
            font-weight: 600;
        }}
        th.test-col {{ background: #f0f6fc; color: #6a9bcc; }}
        .query-col {{ min-width: 200px; }}
        .description-cell {{ font-family: monospace; font-size: 10px; color: #666; max-width: 300px; word-wrap: break-word; }}
        .result {{ text-align: center; font-size: 14px; min-width: 40px; }}
        .pass {{ color: #788c5d; font-weight: bold; }}
        .fail {{ color: #c44; font-weight: bold; }}
        .rate {{ font-size: 9px; color: #999; display: block; }}
        .score-pill {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 10px;
        }}
        .score-good {{ background: #eef2e8; color: #788c5d; }}
        .score-ok {{ background: #fef3c7; color: #d97706; }}
        .score-bad {{ background: #fceaea; color: #c44; }}
        .chart-container {{ height: 300px; position: relative; }}
        .best-row {{ background: #f5f8f2; }}
        th.positive-col {{ border-bottom: 3px solid #788c5d; }}
        th.negative-col {{ border-bottom: 3px solid #c44; }}
        .legend {{ font-family: 'Poppins', sans-serif; display: flex; gap: 20px; margin-bottom: 10px; font-size: 12px; align-items: center; }}
        .legend-item {{ display: flex; align-items: center; gap: 6px; }}
        .legend-swatch {{ width: 12px; height: 12px; border-radius: 2px; display: inline-block; }}
        .swatch-positive {{ background: #f8f7f2; border-bottom: 3px solid #788c5d; }}
        .swatch-negative {{ background: #f8f7f2; border-bottom: 3px solid #c44; }}
    </style>
</head>
<body>
    <h1>{title_prefix}Optimization Dashboard</h1>
    
    <div class="explainer">
        <strong>Master Architect Performance Report.</strong> Track the evolution of your skill's trigger description. The dashboard shows high-level progress, while the table below provides a detailed result matrix for every query across all iterations.
    </div>

    <div class="stats-row">
        <div class="stat-box">
            <span class="stat-value">{data.get('best_score', 'N/A')}</span>
            <span class="stat-label">Best Score</span>
        </div>
        <div class="stat-box">
            <span class="stat-value">{data.get('best_test_score', 'N/A')}</span>
            <span class="stat-label">Best Test Score</span>
        </div>
        <div class="stat-box">
            <span class="stat-value">{data.get('iterations_run', 0)}</span>
            <span class="stat-label">Total Iterations</span>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="card">
            <h2>Performance Progress (%)</h2>
            <div class="chart-container">
                <canvas id="progressChart"></canvas>
            </div>
        </div>
        <div class="card">
            <h2>Final Metric Breakdown (Accuracy per Query)</h2>
            <div class="chart-container">
                <canvas id="breakdownChart"></canvas>
            </div>
        </div>
    </div>

    <div class="summary-card">
        <p><strong>Original Description:</strong> <span class="description-cell">{html.escape(data.get('original_description', 'N/A'))}</span></p>
        <p><strong>Best Description:</strong> <span class="best-desc">{html.escape(data.get('best_description', 'N/A'))}</span></p>
    </div>

    <h2>Detailed Iteration Matrix</h2>
    <div class="legend">
        <span style="font-weight:600">Query headers:</span>
        <span class="legend-item"><span class="legend-swatch swatch-positive"></span> Should trigger</span>
        <span class="legend-item"><span class="legend-swatch swatch-negative"></span> Should NOT trigger</span>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Iter</th>
                    <th>Train</th>
                    <th>Test</th>
                    <th class="query-col">Description</th>
"""

    # Add query headers
    for qinfo in train_queries:
        polarity = "positive-col" if qinfo["should_trigger"] else "negative-col"
        html_start += f'                    <th class="{polarity}">{html.escape(qinfo["query"])}</th>\n'
    for qinfo in test_queries:
        polarity = "positive-col" if qinfo["should_trigger"] else "negative-col"
        html_start += f'                    <th class="test-col {polarity}">{html.escape(qinfo["query"])}</th>\n'

    html_start += """                </tr>
            </thead>
            <tbody>
"""

    # Find best iteration
    if test_queries:
        best_iter = max(history, key=lambda h: h.get("test_passed") or 0).get("iteration")
    else:
        best_iter = max(history, key=lambda h: h.get("train_passed", h.get("passed", 0))).get("iteration")

    html_rows = []
    for h in history:
        iteration = h.get("iteration", "?")
        train_passed = h.get("train_passed", h.get("passed", 0))
        train_total = h.get("train_total", h.get("total", 1))
        test_passed = h.get("test_passed")
        test_total = h.get("test_total")
        
        train_pct = round((train_passed / train_total) * 100) if train_total > 0 else 0
        train_class = "score-good" if train_pct >= 80 else "score-ok" if train_pct >= 50 else "score-bad"
        
        test_cell = "N/A"
        if test_passed is not None:
            t_total = test_total if test_total > 0 else 1
            test_pct = round((test_passed / t_total) * 100)
            test_class = "score-good" if test_pct >= 80 else "score-ok" if test_pct >= 50 else "score-bad"
            test_cell = f'<span class="score-pill {test_class}">{test_passed}/{test_total}</span>'

        row_class = "best-row" if iteration == best_iter else ""
        
        row_html = f"""
                <tr class="{row_class}">
                    <td>{iteration}</td>
                    <td><span class="score-pill {train_class}">{train_passed}/{train_total}</span></td>
                    <td>{test_cell}</td>
                    <td class="description-cell">{html.escape(h.get('description', ''))}</td>"""

        # Result cells
        train_by_query = {r["query"]: r for r in h.get("train_results", h.get("results", []))}
        test_by_query = {r["query"]: r for r in h.get("test_results", [])}

        for qinfo in train_queries:
            r = train_by_query.get(qinfo["query"], {})
            did_pass = r.get("pass", False)
            icon = "✓" if did_pass else "✗"
            css = "pass" if did_pass else "fail"
            row_html += f'<td class="result {css}">{icon}<span class="rate">{r.get("triggers", 0)}/{r.get("runs", 0)}</span></td>'

        for qinfo in test_queries:
            r = test_by_query.get(qinfo["query"], {})
            did_pass = r.get("pass", False)
            icon = "✓" if did_pass else "✗"
            css = "pass" if did_pass else "fail"
            row_html += f'<td class="result {css}">{icon}<span class="rate">{r.get("triggers", 0)}/{r.get("runs", 0)}</span></td>'

        row_html += "</tr>"
        html_rows.append(row_html)

    html_end = """
            </tbody>
        </table>
    </div>

    <script>
        // Progress Chart
        const ctxProgress = document.getElementById('progressChart').getContext('2d');
        new Chart(ctxProgress, {
            type: 'line',
            data: {
                labels: """ + json.dumps(labels) + """,
                datasets: [
                    {
                        label: 'Train Score (%)',
                        data: """ + json.dumps(train_scores) + """,
                        borderColor: '#141413',
                        backgroundColor: '#141413',
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: 'Test Score (%)',
                        data: """ + json.dumps(test_scores) + """,
                        borderColor: '#6a9bcc',
                        backgroundColor: '#6a9bcc',
                        tension: 0.3,
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { callback: v => v + '%' } }
                }
            }
        });

        // Breakdown Chart
        const ctxBreakdown = document.getElementById('breakdownChart').getContext('2d');
        new Chart(ctxBreakdown, {
            type: 'bar',
            data: {
                labels: """ + json.dumps(breakdown_labels) + """,
                datasets: [{
                    label: 'Accuracy (%)',
                    data: """ + json.dumps(breakdown_data) + """,
                    backgroundColor: """ + json.dumps(breakdown_colors) + """,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
                    y: { ticks: { font: { size: 10 } } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    </script>
</body>
</html>
"""

    return html_start + "".join(html_rows) + html_end


def main():
    parser = argparse.ArgumentParser(description="Generate HTML dashboard from run_loop output")
    parser.add_argument("input", help="Path to JSON output from run_loop.py (or - for stdin)")
    parser.add_argument("-o", "--output", default=None, help="Output HTML file (default: stdout)")
    parser.add_argument("--skill-name", default="", help="Skill name to include in the report title")
    args = parser.parse_args()

    if args.input == "-":
        data = json.load(sys.stdin)
    else:
        data = json.loads(Path(args.input).read_text())

    html_output = generate_html(data, skill_name=args.skill_name)

    if args.output:
        Path(args.output).write_text(html_output, encoding='utf-8')
        print(f"Report written to {args.output}", file=sys.stderr)
    else:
        print(html_output)


if __name__ == "__main__":
    main()
