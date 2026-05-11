import { useState, useEffect }
  from 'react';

import { API_BASE } from './config.js';

import { useSSE }
  from './hooks/useSSE';

import PromptInput
  from './components/PromptInput';

import PipelineStatus
  from './components/PipelineStatus';

import CodeViewer
  from './components/CodeViewer';

import TestResults
  from './components/TestResults';
import AgentHistory
  from './components/AgentHistory';

const DEMO_PROMPTS = [

  'Build a Python agent that reads a CSV and returns column statistics',

  'Build a Python agent that fetches the current Bitcoin price',

  'Build a Python AI agent that summarises long text using an LLM',

  'Build a Python agent that checks if a URL is reachable'
];

export default function App() {

  const {

    events,

    isRunning,

    blueprint,

    code,

    testResults,

    isComplete,

    downloadZip,

    agentReady,

    startBuild

  } = useSSE();

  const [prompt, setPrompt] =
    useState('');
  useEffect(() => {

    if (
      isComplete &&
      blueprint
    ) {

      const history =
        JSON.parse(

          localStorage.getItem(
            'agent_history'
          ) || '[]'
        );

      history.unshift({

        name:
          blueprint.agent_name,

        description:
          blueprint.description,

        ts:
          Date.now(),

        testsPassed:
          testResults.filter(
            result =>
              result.passed
          ).length,

        testsTotal:
          testResults.length
      });

      localStorage.setItem(

        'agent_history',

        JSON.stringify(
          history.slice(0, 20)
        )
      );
    }

  }, [isComplete]);
  return (

    <div

      style={{

        minHeight: '100vh',

        background: '#0f172a',

        color: 'white',

        padding: 24,

        fontFamily:
          'Inter, system-ui'
      }}
    >

      {/* HEADER */}

      <div style={{
        textAlign: 'center',
        padding: '40px 24px 32px',
        marginBottom: 8,
        borderBottom: '1px solid #1e293b',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Ambient glow behind title */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 400,
          height: 120,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Main title */}
        <h1 style={{
          fontSize: 52,
          fontWeight: 800,
          margin: '0 0 12px',
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          AgentForge
        </h1>

        {/* Tagline */}
        <p style={{
          color: '#64748b',
          fontSize: 15,
          maxWidth: 560,
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Describe an AI agent and watch the system design,
          code, test, self-heal, and package it automatically.
        </p>
      </div>

      {/* PROMPT */}

      <PromptInput

        prompt={prompt}

        onPromptChange={
          setPrompt
        }

        onBuild={() =>
          startBuild(prompt)
        }

        isRunning={
          isRunning
        }

        demoPrompts={
          DEMO_PROMPTS
        }

        onDemoSelect={
          demoPrompt => {

            setPrompt(
              demoPrompt
            );

            startBuild(
              demoPrompt
            );
          }
        }
      />

      {/* SUCCESS BAR */}

      {
        isComplete &&
        agentReady && (

          <div

            style={{

              marginTop: 20,

              padding: 16,

              borderRadius: 12,

              background:
                '#052e16',

              border:
                '1px solid #166534'
            }}
          >

            <div
              style={{
                fontWeight: 600
              }}
            >

              ✅ Agent Ready
            </div>

            <div
              style={{
                marginTop: 8,
                color: '#bbf7d0'
              }}
            >

              {agentReady.agentName}
            </div>

            {
              downloadZip && (

                <a

                  href={
                    `${API_BASE}/api/package/${downloadZip}`
                  }

                  target="_blank"

                  rel="noreferrer"

                  style={{

                    display:
                      'inline-block',

                    marginTop: 12,

                    padding:
                      '10px 16px',

                    borderRadius: 8,

                    background:
                      '#22c55e',

                    color: 'black',

                    textDecoration:
                      'none',

                    fontWeight: 600
                  }}
                >

                  Download Agent ZIP
                </a>
              )
            }
          </div>
        )
      }

      {/* MAIN GRID */}

      <div

        style={{

          display: 'grid',

          gridTemplateColumns:
            '1.2fr 0.8fr',

          gap: 16,

          marginTop: 20
        }}
      >

        {/* LEFT PANEL */}

        <div>

          <CodeViewer

            code={code}

            agentName={
              blueprint?.agent_name
            }
          />

        </div>

        {/* RIGHT PANEL */}

        <div

          style={{

            display: 'flex',

            flexDirection: 'column',

            gap: 16
          }}
        >

          <PipelineStatus

            events={events}

            isRunning={isRunning}
          />

          <TestResults

            results={testResults}
          />

        </div>
      </div>
      <AgentHistory />
    </div>
  );
}