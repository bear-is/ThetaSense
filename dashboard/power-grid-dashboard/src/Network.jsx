import {useEffect, useRef} from "react";
import * as d3 from "d3";

export default function Network({graphData, updates}) {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        if (!graphData.nodes.length) return;
        const links = graphData.links.map(l => ({
            ...l,
            source: graphData.nodes.find(n => n.id === l.from),
            target: graphData.nodes.find(n => n.id === l.to)
        }));

        const container = svgRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);

        svg.attr("width", width).attr("height", height);
        svg.selectAll("*").remove();
        const zoom = d3.zoom()
            .scaleExtent([0.005, 300]) // min/max zoom
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        // Group everything for zoom/pan
        const g = svg.append("g");

        svg.call(zoom);
        // 1. DEFINE ARROWHEADS
        g.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 23) // Moves arrow to edge of node circle
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

        // 2. SIMULATION SETUP
        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink(links)
                .id(d => d.id).distance(500))
            .force("charge", d3.forceManyBody().strength(-20))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked);
        // 3. DRAW LINKS (Standard Lines)
        const link = g.append("g")
            .selectAll("line")
            .data(links)  // <-- use mapped links
            .enter()
            .append("line")
            .attr("stroke", "#4b5563")
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead)");
        // 4. DRAW NODES
        const node = g.append("g")
            .selectAll("g")
            .data(graphData.nodes)
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", d => {
                const maxVal = Math.max(Math.abs(d.demand || 0), Math.abs(d.generation || 0));
                const minRadius = 40; // minimum radius for visibility
                const scaleFactor = 2; // adjust for your visual scaling
                return minRadius + maxVal * scaleFactor;
            })
            .attr("fill", "#000")
            .attr("stroke", "#3b82f6") // Blue ring
            .attr("stroke-width", 2);

        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", 5)
            .attr("fill", "#fff")
            .style("font-size", d => {
                const maxVal = Math.max(Math.abs(d.demand || 0), Math.abs(d.generation || 0));
                const scaleFactor = 2;
                return `${d.radius * 0.25}px`;  // font is ~half the radius
            })
            .text(d => truncateText(d.name, 40)); // 40 is node radi        // --- TOOLTIP EVENTS ---
        node.on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`
            <strong>${d.name || d.id}</strong><br/>
            Demand: ${d.demand || 0} MW<br/>
            Generation: ${d.generation || 0} MW<br/>
            Slack: ${d.slack ? "Yes" : "No"}
        `);
        })
            .on("mousemove", (event) => {
                const rect = svgRef.current.getBoundingClientRect();
                tooltip.style("left", (event.clientX - rect.left + 10) + "px")
                    .style("top", (event.clientY - rect.top + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });

        function truncateText(text, radius) {
            if (!text) return "";
            const tempText = svg.append("text").attr("visibility", "hidden").text(text);
            let str = text;
            while (tempText.node().getComputedTextLength() > radius * 2 && str.length > 0) {
                str = str.slice(0, -1);
                tempText.text(str + "…");
            }
            tempText.remove();
            return str.length < text.length ? str + "…" : str;
        }

        // 5. THE TICK FUNCTION (Physics Update)
        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }

        // 6. THE CONTROLLER HOOK (Apply external updates)
        if (updates) {
            // Update Node Colors (e.g., Orange for warning)
            node.select("circle")
                .transition().duration(500)
                .attr("fill", d => updates.nodes?.[d.id] || "#000")
                .attr("stroke", d => updates.nodes?.[d.id] ? "#fff" : "#3b82f6");

            // Update Link Colors (e.g., Red for high load)
            link.transition().duration(500)
                .attr("stroke", d => {
                    const key = `${d.source.id}-${d.target.id}`;
                    return updates.links?.[key] || "#4b5563";
                });
        }

        // Drag handlers
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    }, [graphData, updates]);

    return (
        <div style={{width: "100%", height: "100%", background: "#0b1220"}}>
            <div ref={tooltipRef} style={{
                position: "absolute",
                pointerEvents: "none",
                background: "#1e293b",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                border: "1px solid #334155",
                display: "none",   // hidden by default
                zIndex: 1000
            }}>
            </div>
            <div style={{flex: 1, position: "relative"}}>
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600"></svg>
            </div>


        </div>
    );
}