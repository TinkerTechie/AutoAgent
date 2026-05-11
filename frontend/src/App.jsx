import { useState } from 'react';
import DownloadAgent
  from './components/DownloadAgent';
import { useSSE }
  from './hooks/useSSE';

import PipelineStatus
  from './components/PipelineStatus';

import CodeViewer
  from './components/CodeViewer';

import ExecutionConsole
  from './components/ExecutionConsole';
import WorkflowGraph
  from './components/WorkflowGraph';
function App() {

  const [prompt, setPrompt] =
    useState('');

  const [url, setUrl] =
    useState('');

  const events = useSSE(url);

  function handleBuild() {

    if (!prompt) return;

    const encoded =
      encodeURIComponent(prompt);

    setUrl(
      `http://localhost:3001/api/build?prompt=${encoded}`
    );
  }

  /*
    Extract generated code
  */

  const codeEvent =
    events.find(
      e => e.type === 'code_result'
    );

  const generatedCode =
    codeEvent?.data?.preview
      ?.replace(/```python/g, '')
      ?.replace(/```/g, '')
      ?.trim();

  /*
    Extract execution output
  */

  const executionEvent =
    events.find(
      e =>
        e.type ===
        'execution_result'
    );
  const savedEvent =
    events.find(
      e => e.type === 'saved'
    );

  const savedFilename =
    savedEvent?.data?.filename;

  const executionOutput =
    executionEvent?.data?.output;

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: 'white',
        padding: '40px',
        fontFamily: 'sans-serif'
      }}
    >

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >

        <h1
          style={{
            fontSize: '42px'
          }}
        >
          AI Agent Builder
        </h1>

        <p
          style={{
            color: '#94a3b8',
            marginBottom: '30px'
          }}
        >
          Autonomous AI planning,
          code generation,
          and execution platform.
        </p>

        <textarea
          rows="5"
          placeholder="Describe your AI agent..."
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #334155',
            background: '#111827',
            color: 'white',
            fontSize: '16px',
            resize: 'none'
          }}
        />

        <button
          onClick={handleBuild}
          style={{
            marginTop: '20px',
            padding: '14px 24px',
            borderRadius: '10px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Build Agent
        </button>

        <div
          style={{
            marginTop: '40px'
          }}
        >
          <WorkflowGraph
            events={events}
          />
          <PipelineStatus
            events={events}
          />

          <CodeViewer
            code={generatedCode}
          />

          <ExecutionConsole
            output={executionOutput}
          />
          <DownloadAgent
            filename={savedFilename}
          />

        </div>

      </div>

    </div>
  );
}

export default App;