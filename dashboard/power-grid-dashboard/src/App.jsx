import './App.css';
import Network from "./Network";
import {useState, useEffect} from "react";

export default function App() {
    // --- Graph structure from server (nodes & links) ---
    const [graphData, setGraphData] = useState({nodes: [], links: []});

    // --- Real-time updates: node/link colors, status, etc ---
    const [updates, setUpdates] = useState(null);

    // --- Form state for adding new nodes ---
    const [nodeForm, setNodeForm] = useState({
        name: "",
        demand: "",
        generation: "",
        slack: false
    });

    // --- Form state ---
    const [lineForm, setLineForm] = useState({
        from: "",
        to: "",
        weight: ""
    });

    // --- Input handler ---
    const handleLineChange = (e) => {
        const {name, value} = e.target;
        setLineForm(prev => ({...prev, [name]: value}));
    };

// --- Submit handler ---
    const handleAddLine = async (e) => {
        e.preventDefault();
        if (!lineForm.from || !lineForm.to || !lineForm.weight) return;

        const payload = {
            from: lineForm.from,
            to: lineForm.to,
            weight: Number(lineForm.weight)
        };

        try {
            const res = await fetch("http://localhost:8080/api/line/add", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Add line failed");

            fetchGraphData(); // refresh graph
            setLineForm({from: "", to: "", weight: ""});
        } catch (err) {
            console.error(err);
        }
    };

    // --- FETCH GRAPH: full graph from server (nodes + links) ---
    const fetchGraphData = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/grid");
            if (!res.ok) throw new Error("Fetch failed");

            const data = await res.json();

            // Only set graph structure once (nodes + links)
            setGraphData({
                nodes: data.nodes || [],
                links: data.links || data.edges || []
            });
        } catch (err) {
            console.error("❌ Failed to load grid:", err);
        }
    };

    // --- DEBUG: log form changes ---
    useEffect(() => {
        console.log("NodeForm updated:", nodeForm);
    }, [nodeForm]);

    // --- Handle form input changes ---
    const handleNodeChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNodeForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // --- INITIAL GRAPH LOAD ---
    useEffect(() => {
        fetchGraphData(); // fetch graph structure only once
    }, []);

    // After graphData is fetched or updated, compute node colors once
    useEffect(() => {
        if (!graphData.nodes.length) return; // skip if no nodes

        const nodeColors = {};
        graphData.nodes.forEach(node => {
            nodeColors[node.id || node.name] = (node.netInjection > 0) ? "#b68900" : "#000000";
        });

        setUpdates({
            nodes: nodeColors,
            links: {} // no link coloring
        });
    }, [graphData]); // runs only when graphData changes (initial load or refresh)

    // --- ADD NODE (POST request) ---
    // NOTE: nodes are not added incrementally in state; server will handle them
    const handleAddNode = async (e) => {
        e.preventDefault();

        // Currently, name doesn't actually do anything because it doesn't get pushed to the server or read from it.
        const payload = {
            name: nodeForm.name,
            demand: Number(nodeForm.demand),
            generation: Number(nodeForm.generation),
            netInjection: Number(nodeForm.generation - nodeForm.demand),
            slack: nodeForm.slack
        };

        try {
            const res = await fetch("http://localhost:8080/api/node/add", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Add failed");

            // Optionally refetch graph after adding node
            fetchGraphData(); // comment this out if we don't want to redraw the graph after adding a node.

            setNodeForm({
                name: "",
                demand: "",
                generation: "",
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
            <main style={{display: "flex", flex: 1, overflow: "hidden"}}>
                <div style={{flex: 1, position: "relative"}}>
                    {/* Pass static graph + real-time status updates */}
                    <Network graphData={graphData} updates={updates}/>
                </div>
                <div style={formTopbarStyle}>
                    {/* Node form */}
                    <form onSubmit={handleAddNode} style={formStyle}>
                        <input name="demand" type="number" placeholder="Demand" value={nodeForm.demand} onChange={handleNodeChange}/>
                        <input name="generation" type="number" placeholder="Generation" value={nodeForm.generation} onChange={handleNodeChange}/>
                        <label>
                            Slack
                            <input name="slack" type="checkbox" checked={nodeForm.slack} onChange={handleNodeChange}/>
                        </label>
                        <button type="submit">Add Node</button>
                    </form>

                    {/* Line form */}
                    <form onSubmit={handleAddLine} style={formStyle}>
                        <select name="from" value={lineForm.from} onChange={handleLineChange} required>
                            <option value="">From Node</option>
                            {graphData.nodes.map(n => (
                                <option key={n.id || n.name} value={n.id || n.name}>{n.id || n.name}</option>
                            ))}
                        </select>

                        <select name="to" value={lineForm.to} onChange={handleLineChange} required>
                            <option value="">To Node</option>
                            {graphData.nodes.map(n => (
                                <option key={n.id || n.name} value={n.id || n.name}>{n.id || n.name}</option>
                            ))}
                        </select>

                        <input name="weight" type="number" placeholder="Weight" value={lineForm.weight} onChange={handleLineChange} required/>
                        <button type="submit">Add Line</button>
                    </form>
                </div>
                <div style={sidebarStyle}>

                    <h3 style={{marginTop: 0, color: '#3b82f6'}}>System Metrics</h3>
                    <Metric label="Active Nodes" value={graphData.nodes.length}/>
                    <Metric label="Total Grid Load" value={`${graphData.nodes.length * 12} MW`}/>
                    <Metric label="Stability Index" value="0.98 pu"/>
                    <Metric label="Efficiency Quotient" value={`${graphData.nodes.length}%`}/>
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
const formTopbarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "80px",            // adjust as needed
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "10px 20px",
    gap: "20px",
    borderBottom: "1px solid #1f2937",
    zIndex: 1000,
};
const formStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
};
const sidebarStyle = {
    width: "280px",
    padding: "20px",
    background: "#0f172a",
    borderLeft: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,        // <-- prevent shrinking
    height: "100%",       // <-- fill parent's height
    overflowY: "auto",    // <-- allow scrolling if needed
    gap: "15px"           // <-- spacing between forms/metrics
};const footerStyle = {
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