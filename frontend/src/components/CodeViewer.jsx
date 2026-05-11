import { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

/* ─────────────────────────────────────────────
   Strip any leftover markdown code fences that
   the LLM may have returned despite instructions
───────────────────────────────────────────────*/
function stripMarkdownFences(raw) {
    if (!raw) return raw;

    // Remove ```python or ``` at the start (with optional trailing newline)
    let clean = raw.replace(/^```[\w]*\n?/, '');

    // Remove ``` at the end (with optional leading newline)
    clean = clean.replace(/\n?```\s*$/, '');

    // Also strip any stray fence lines in the middle (belt-and-suspenders)
    clean = clean.replace(/^```[\w]*$/gm, '').replace(/^```$/gm, '');

    return clean.trim();
}

export default function CodeViewer({ code, agentName }) {
    const [highlighted, setHighlighted] = useState('');
    const [copied, setCopied] = useState(false);

    // Clean any markdown fences before rendering
    const cleanCode = stripMarkdownFences(code);

    useEffect(() => {
        if (cleanCode) {
            // Use Prism.highlight (string API) to avoid DOM conflicts with React
            const html = Prism.highlight(
                cleanCode,
                Prism.languages.python,
                'python'
            );
            setHighlighted(html);
        } else {
            setHighlighted('');
        }
    }, [cleanCode]);

    const handleCopy = () => {
        if (cleanCode) {
            navigator.clipboard.writeText(cleanCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!cleanCode) return;
        const filename = `${agentName || 'generated_agent'}.py`;
        const blob = new Blob([cleanCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── EMPTY STATE ── */
    if (!cleanCode) {
        return (
            <div style={emptyWrap}>
                <div style={gridOverlay} />
                <div style={emptyIcon}>🐍</div>
                <div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15, marginBottom: 6, textAlign: 'center' }}>
                        No code generated yet
                    </div>
                    <div style={{ color: '#334155', fontSize: 13, textAlign: 'center' }}>
                        Generated Python code will appear here
                    </div>
                </div>
            </div>
        );
    }

    const lineCount = cleanCode.split('\n').length;

    return (
        <div style={wrapStyle}>
            {/* Top glow line */}
            <div style={glowLine} />

            {/* ── HEADER ── */}
            <div style={headerStyle}>
                {/* Left: traffic lights + filename */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ ...dot, background: '#ff5f57' }} />
                        <div style={{ ...dot, background: '#febc2e' }} />
                        <div style={{ ...dot, background: '#28c840' }} />
                    </div>
                    <div style={fileTab}>
                        <span style={{ fontSize: 14 }}>🐍</span>
                        <span style={{ color: '#c4b5fd', fontWeight: 500 }}>
                            {agentName || 'generated_agent'}
                        </span>
                        <span style={{ color: '#475569' }}>.py</span>
                    </div>
                </div>

                {/* Right: line count + copy + download */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={badge}>{lineCount} lines</span>

                    <button onClick={handleCopy} style={copyBtn(copied)}>
                        {copied ? '✓ Copied' : '⎘ Copy'}
                    </button>

                    <button onClick={handleDownload} style={dlBtn}>
                        ↓ Download .py
                    </button>
                </div>
            </div>

            {/* ── CODE BODY ── */}
            <div style={{ display: 'flex', overflow: 'hidden' }}>
                {/* Line numbers */}
                <div style={lineNumCol}>
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} style={lineNumRow}>{i + 1}</div>
                    ))}
                </div>

                {/* Syntax-highlighted code */}
                <pre style={preStyle}>
                    <code
                        className="language-python"
                        dangerouslySetInnerHTML={{ __html: highlighted || '' }}
                    />
                </pre>
            </div>

            {/* ── FOOTER ── */}
            <div style={footerStyle}>
                <div style={statusDot} />
                Python 3 · UTF-8 · {lineCount} lines
            </div>
        </div>
    );
}

/* ─── Styles ─── */

const wrapStyle = {
    border: '1px solid #1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#0a0f1e',
    boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 24px 48px rgba(0,0,0,0.5)',
    position: 'relative',
};

const glowLine = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
    pointerEvents: 'none',
    zIndex: 1,
};

const emptyWrap = {
    border: '1px solid #1e293b',
    borderRadius: 16,
    minHeight: 500,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 100%)',
    gap: 16,
    position: 'relative',
    overflow: 'hidden',
};

const gridOverlay = {
    position: 'absolute',
    inset: 0,
    backgroundImage:
        'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    pointerEvents: 'none',
};

const emptyIcon = {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
};

const headerStyle = {
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
    padding: '12px 16px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
};

const dot = { width: 12, height: 12, borderRadius: '50%' };

const fileTab = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid #1e293b',
    borderRadius: 8,
    padding: '4px 10px',
    fontSize: 12,
    color: '#94a3b8',
};

const badge = {
    fontSize: 11,
    color: '#475569',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid #1e293b',
    borderRadius: 6,
    padding: '3px 8px',
};

const copyBtn = (copied) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 8,
    border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(99,102,241,0.3)',
    background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
    color: copied ? '#4ade80' : '#818cf8',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
});

const dlBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 14px',
    borderRadius: 8,
    border: '1px solid rgba(34,197,94,0.35)',
    background: 'rgba(34,197,94,0.1)',
    color: '#4ade80',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
};

const lineNumCol = {
    background: 'rgba(0,0,0,0.3)',
    borderRight: '1px solid #1e293b',
    padding: '20px 0',
    minWidth: 48,
    textAlign: 'right',
    userSelect: 'none',
    flexShrink: 0,
};

const lineNumRow = {
    paddingRight: 12,
    paddingLeft: 8,
    fontSize: 12,
    lineHeight: '1.6',
    color: '#2d3748',
    fontFamily: 'Fira Code, monospace',
    height: '1.6em',
};

const preStyle = {
    margin: 0,
    padding: '20px',
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: 640,
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: 'Fira Code, monospace',
    background: 'transparent',
    flex: 1,
    whiteSpace: 'pre',        /* preserve newlines */
    wordBreak: 'normal',
    overflowWrap: 'normal',
};

const footerStyle = {
    borderTop: '1px solid #1e293b',
    padding: '8px 16px',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#334155',
};

const statusDot = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
};