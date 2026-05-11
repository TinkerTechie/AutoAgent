import { API_BASE } from '../config.js';

export default function DownloadAgent({
    filename
}) {

    if (!filename) return null;

    const url =
        `${API_BASE}/api/download/${filename}`;

    return (

        <div
            style={{
                marginTop: '20px'
            }}
        >

            <a
                href={url}
                download
                style={{
                    padding: '14px 20px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}
            >
                Download Generated Agent
            </a>

        </div>
    );
}