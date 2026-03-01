import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Network({ graphData, updates }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!graphData.nodes.length) return;

    const width = 800, height = 600;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll("*").remove();

    // 1. DEFINE ARROWHEADS
    svg.append('defs').append('marker')
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
      .style('stroke','none');

    // 2. SIMULATION SETUP
    const simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // 3. DRAW LINKS (Standard Lines)
    const link = svg.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", "#4b5563") // Default Slate-600
      .attr("stroke-width", 3)
      .attr("marker-end", "url(#arrowhead)");

    // 4. DRAW NODES
    const node = svg.append("g")
      .selectAll("g")
      .data(graphData.nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", 20)
      .attr("fill", "#000")
      .attr("stroke", "#3b82f6") // Blue ring
      .attr("stroke-width", 2);

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "#fff")
      .style("font-size", "10px")
      .text(d => d.id);

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
      d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }

  }, [graphData, updates]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0b1220" }}>
      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600"></svg>
    </div>
  );
}