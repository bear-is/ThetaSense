import './App.css';
import Network from "./Network";
import {useState, useEffect} from "react";

export default function App() {
    const [graphData, setGraphData] = useState({nodes: [], links: []});
    const [updates, setUpdates] = useState(null);
    const [nodeForm, setNodeForm] = useState({
        name: "",
        demand: "",
        generation: "",
        netInjection: "",
        slack: false
    });

    const handleNodeChange = (e) => {
        const {name, value, type, checked} = e.target;

        setNodeForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // 1. INITIAL FETCH: Load the grid from Java on startup
    useEffect(() => {
        fetch("http://localhost:8080/api/grid")
            .then(res => res.json())
            .then(data => {
                // Ensure data format matches D3 expectations
                setGraphData({
                    nodes: data.nodes || [],
                    links: data.links || data.edges || [] // Handles 'links' or 'edges' naming
                });
            })
            .catch(err => console.error("❌ Backend Offline:", err));
    }, []);

    // 2. DYNAMIC UPDATES: Simulated real-time sensor data
    useEffect(() => {
        const timer = setTimeout(() => {
            setUpdates({
                nodes: {"N1": "#f59e0b", "N2": "#10b981"}, // Orange and Green status
                links: {"N1-N2": "#ef4444"} // Red for high-load line
            });
        }, 3000);
        return () => clearTimeout(timer);
    }, [graphData]);

    // 3. ADD NODE & SYNC: Save to Java and Update UI
    const handleAddNode = async (e) => {
        e.preventDefault();

        const payload = {
            name: nodeForm.name,
            demand: Number(nodeForm.demand),
            generation: Number(nodeForm.generation),
            netInjection: Number(nodeForm.netInjection),
            slack: nodeForm.slack
        };

        try {
            // POST new node
            const res = await fetch("http://localhost:8080/api/node/add", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Add failed");

            // Re-fetch graph
            await fetchGraphData();

            // Reset form
            setNodeForm({
                name: "",
                demand: "",
                generation: "",
                netInjection: "",
                slack: false
            });

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={{margin: 0, fontSize: '1.2rem'}}>⚡ SmartGrid Optimization Engine</h1>
                <div style={{fontSize: '12px', color: '#10b981'}}>● SYSTEM ONLINE</div>
            </header>
            <form onSubmit={handleAddNode} className="node-form">

                <input
                    name="name"
                    placeholder="Name"
                    value={nodeForm.name}
                    onChange={handleNodeChange}
                    required
                />

                <input
                    name="demand"
                    type="number"
                    placeholder="Demand"
                    value={nodeForm.demand}
                    onChange={handleNodeChange}
                />

                <input
                    name="generation"
                    type="number"
                    placeholder="Generation"
                    value={nodeForm.generation}
                    onChange={handleNodeChange}
                />

                <input
                    name="netInjection"
                    type="number"
                    placeholder="Net Injection"
                    value={nodeForm.netInjection}
                    onChange={handleNodeChange}
                />

                <label>
                    Slack
                    <input
                        name="slack"
                        type="checkbox"
                        checked={nodeForm.slack}
                        onChange={handleNodeChange}
                    />
                </label>

                <button type="submit">Add</button>

            </form>

            <main style={{display: "flex", flex: 1, overflow: "hidden"}}>
                <div style={{flex: 1, padding: "20px", position: "relative"}}>
                    <div style={toolbarStyle}>
                        {/*need to add fields for data for the new node*/}

                        <button onClick={handleAddNode} style={btnStyle}>+ Add Node</button>
                    </div>
                    {/* THE HOOK: Passing data and updates into D3 Network */}
                    <Network graphData={graphData} updates={updates}/>
                </div>

                <div style={sidebarStyle}>
                    <h3 style={{marginTop: 0, color: '#3b82f6'}}>System Metrics</h3>
                    <Metric label="Active Nodes" value={graphData.nodes.length}/>
                    <Metric label="Total Grid Load" value={`${graphData.nodes.length * 12} MW`}/>
                    <Metric label="Stability Index" value="0.98 pu"/>

                    <div style={statusCardStyle}>
                        <strong>Controller Status</strong>
                        <p style={{fontSize: '11px', color: '#9ca3af'}}>
                            Connected to Java HttpServer on :8080. Awaiting power flow solve...
                        </p>
                    </div>
                </div>
            </main>

            <footer style={footerStyle}>
                Node Count: {graphData.nodes.length} | Edge Count: {graphData.links.length} | Java Sync Active
            </footer>
        </div>
    );
}

// --- STYLES ---
const containerStyle = {
    display: "flex",
    flexDirection: "column",
    background: "#0b1220",
    height: "100vh",
    color: "#e5e7eb",
    fontFamily: 'sans-serif'
};
const headerStyle = {
    padding: '15px 20px',
    borderBottom: '1px solid #1f2937',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0f172a'
};
const toolbarStyle = {position: 'absolute', top: 30, left: 30, zIndex: 10};
const btnStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};
const sidebarStyle = {width: "280px", padding: "20px", background: "#0f172a", borderLeft: '1px solid #1f2937'};
const footerStyle = {
    padding: '8px 20px',
    fontSize: '11px',
    color: '#64748b',
    background: '#020617',
    borderTop: '1px solid #1f2937'
};
const statusCardStyle = {
    marginTop: '20px',
    padding: '15px',
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155'
};

function Metric({label, value}) {
    return (
        <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#020617',
            borderRadius: '8px',
            border: '1px solid #1e293b'
        }}>
            <div style={{fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase'}}>{label}</div>
            <div style={{fontWeight: 'bold', fontSize: '20px', marginTop: '4px', color: '#fff'}}>{value}</div>
        </div>
    );
}