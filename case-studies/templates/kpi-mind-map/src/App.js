import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// --- Data (can be moved to a separate file or fetched from an API) ---
const sourceData = {
    name: "Intrinsic Enterprise Value", type: "center",
    children: [
        { name: "Obj 1: Accelerate Commercialization", type: "strategicObjective", children: [
            { name: "KR 1.1: Secure Anchor Customers", type: "tacticalKeyResult", children: [
                { name: "1.1.1: Customer Acquisition Rate", type: "managerialKpi", target: "1/quarter" },
                { name: "1.1.2: Total Contract Value", type: "managerialKpi", target: "$50M/18mo" },
                { name: "1.1.3: Sales Cycle Length", type: "managerialKpi", target: "< 6 months" }
            ]},
            { name: "KR 1.2: Scalable Manufacturing", type: "tacticalKeyResult", children: [
                { name: "1.2.1: Unit Production Cost", type: "managerialKpi", target: "-30%" },
                { name: "1.2.2: Production Lead Time", type: "managerialKpi", target: "< 3 months" },
                { name: "1.2.3: First Pass Yield", type: "managerialKpi", target: "> 95%" }
            ]},
            { name: "KR 1.3: Recurring Revenue Model", type: "tacticalKeyResult", children: [
                { name: "1.3.1: Annual Recurring Revenue", type: "managerialKpi", target: "+20% YoY" },
                { name: "1.3.2: Service Attachment Rate", type: "managerialKpi", target: "> 75%" },
                { name: "1.3.3: Customer Lifetime Value", type: "managerialKpi", target: "+50%" }
            ]}
        ]},
        { name: "Obj 2: De-Risk Technology", type: "strategicObjective", children: [
            { name: "KR 2.1: High Reliability", type: "tacticalKeyResult", children: [
                { name: "2.1.1: Mean Time Between Failures", type: "managerialKpi", target: "> 100k hrs" },
                { name: "2.1.2: Fleet-Wide Uptime", type: "managerialKpi", target: "99.99%" },
                { name: "2.1.3: Field-Service Events", type: "managerialKpi", target: "Minimize" }
            ]},
            { name: "KR 2.2: Streamline Deployment", type: "tacticalKeyResult", children: [
                { name: "2.2.1: Average Deployment Time", type: "managerialKpi", target: "< 3 days" },
                { name: "2.2.2: On-Time Completion Rate", type: "managerialKpi", target: "> 95%" },
                { name: "2.2.3: Deployment CSAT Score", type: "managerialKpi", target: "4.8/5.0" }
            ]},
            { name: "KR 2.3: Industry Certifications", type: "tacticalKeyResult", children: [
                { name: "2.3.1: Certification Progress", type: "managerialKpi", target: "100%" },
                { name: "2.3.2: Time to Certification", type: "managerialKpi", target: "Track" },
                { name: "2.3.3: Markets Unlocked", type: "managerialKpi", target: "Quantify" }
            ]}
        ]},
        { name: "Obj 3: Build Competitive Moat", type: "strategicObjective", children: [
            { name: "KR 3.1: Brand Leadership", type: "tacticalKeyResult", children: [
                { name: "3.1.1: Share of Voice", type: "managerialKpi", target: "#1" },
                { name: "3.1.2: Inbound Lead Generation", type: "managerialKpi", target: "> 40%" },
                { name: "3.1.3: Analyst Rankings", type: "managerialKpi", target: "Leader" }
            ]},
            { name: "KR 3.2: IP Portfolio", type: "tacticalKeyResult", children: [
                { name: "3.2.1: New Patents Filed", type: "managerialKpi", target: "10/year" },
                { name: "3.2.2: IP Breadth Score", type: "managerialKpi", target: "+25%" },
                { name: "3.2.3: IP Encroachment Rate", type: "managerialKpi", target: "Monitor" }
            ]},
            { name: "KR 3.3: Ecosystem Integration", type: "tacticalKeyResult", children: [
                { name: "3.3.1: Integration Partners", type: "managerialKpi", target: "5+" },
                { name: "3.3.2: API Adoption Rate", type: "managerialKpi", target: "Track" },
                { name: "3.3.3: Integrated Revenue %", type: "managerialKpi", target: "Measure" }
            ]}
        ]},
        { name: "Obj 4: Optimize Capital Strategy", type: "strategicObjective", children: [
            { name: "KR 4.1: Growth Capital Structure", type: "tacticalKeyResult", children: [
                { name: "4.1.1: Capital Runway", type: "managerialKpi", target: "> 24 months" },
                { name: "4.1.2: Cost of Capital", type: "managerialKpi", target: "Competitive" },
                { name: "4.1.3: Investor Quality", type: "managerialKpi", target: "Strategic" }
            ]},
            { name: "KR 4.2: Working Capital Efficiency", type: "tacticalKeyResult", children: [
                { name: "4.2.1: Cash Conversion Cycle", type: "managerialKpi", target: "-20%" },
                { name: "4.2.2: Inventory Turns", type: "managerialKpi", target: "4x/year" },
                { name: "4.2.3: Days Sales Outstanding", type: "managerialKpi", target: "< 45 days" }
            ]},
            { name: "KR 4.3: FP&A Function", type: "tacticalKeyResult", children: [
                { name: "4.3.1: Budget Variance", type: "managerialKpi", target: "< 5%" },
                { name: "4.3.2: Forecast Accuracy", type: "managerialKpi", target: "> 90%" },
                { name: "4.3.3: Time to Close", type: "managerialKpi", target: "< 5 days" }
            ]}
        ]}
    ]
};


// --- React Component for the D3 Mind Map ---
const MindMap = ({ data, isRebalanced, onRebalanceToggle }) => {
    // useRef provides a way to access the underlying DOM element
    const svgRef = useRef();
    // useRef to store static D3 structures that don't need to re-render the component
    const d3State = useRef({});

    useEffect(() => {
        // This effect runs once on mount to set up the D3 visualization
        const containerEl = svgRef.current.parentElement;
        let width = containerEl.clientWidth;
        let height = containerEl.clientHeight;
        const transitionDuration = 750;

        // --- D3 SETUP ---
        // Select the SVG element using the ref
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

        const g = svg.append("g");
        let link = g.append("g").attr("class", "links").selectAll("path.link");
        let node = g.append("g").attr("class", "nodes").selectAll(".node");

        // --- SCALES ---
        const colorScale = d3.scaleOrdinal()
            .domain(["center", "strategicObjective", "tacticalKeyResult", "managerialKpi"])
            .range(["#34D399", "#60A5FA", "#FBBF24", "#A78BFA"]);

        // --- SIMULATION ---
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(120).strength(0.8))
            .force("charge", d3.forceManyBody().strength(-1500))
            .force("center", d3.forceCenter(0, 0))
            .force("collision", d3.forceCollide().radius(d => Math.max(d.width / 2, d.height / 2) + 15))
            .on("tick", ticked);

        // --- DATA PROCESSING & INITIAL RENDER ---
        const root = d3.hierarchy(data);
        root.descendants().forEach((d, i) => {
            d.id = i;
            d._children = d.children;
            if (d.depth > 1) d.children = null;
        });

        // Store D3 elements and functions in the ref to access them later
        d3State.current = {
            svg, g, link, node, simulation, root, colorScale,
            width, height, transitionDuration,
            update, rebalanceLayout, unfixAllNodes
        };

        update();

        // --- CORE UPDATE FUNCTION ---
        function update() {
            const nodes = root.descendants().filter(d => d.parent ? d.parent.children : true);
            const links = root.links().filter(d => d.source.children && d.target.parent.children);
            
            // Re-assign local variables from the ref for convenience
            let { link, node, simulation, transitionDuration } = d3State.current;

            link = link.data(links, d => d.target.id);
            link.exit().remove();
            link = link.enter().append("path").attr("class", "link").merge(link);

            node = node.data(nodes, d => d.id);
            node.exit().transition().duration(transitionDuration)
                .attr("transform", d => `translate(${d.parent.x},${d.parent.y})`)
                .style("opacity", 0)
                .remove();
            
            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.parent ? d.parent.x : 0},${d.parent ? d.parent.y : 0})`)
                .style("opacity", 0)
                .on("click", (event, d) => {
                    if (event.defaultPrevented) return;
                    toggleChildren(d);
                })
                .call(drag(simulation));

            nodeEnter.append("rect");
            nodeEnter.append("text")
                .attr("class", d => `node-label ${d.data.type}-label`)
                .attr("text-anchor", "middle")
                .call(wrapAndSize);
            
            nodeEnter.select("rect")
                .attr("width", d => d.width)
                .attr("height", d => d.height)
                .attr("x", d => -d.width / 2)
                .attr("y", d => -d.height / 2)
                .attr("rx", 5)
                .attr("fill", d => colorScale(d.data.type))
                .attr("stroke", d => d3.color(colorScale(d.data.type)).darker(0.6));

            node = nodeEnter.merge(node);
            
            node.transition().duration(transitionDuration).style("opacity", 1);
            
            node.select('rect')
                .transition().duration(transitionDuration)
                .attr("stroke", d => (d._children && !d.children) ? "#1f2937" : d3.color(colorScale(d.data.type)).darker(0.6))
                .attr("stroke-width", d => (d._children && !d.children) ? 4 : 2);
            
            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart();

            // Update the ref with the new selections
            d3State.current.link = link;
            d3State.current.node = node;
        }

        function ticked() {
            // Only run the tick function if not in rebalanced mode
            // isRebalanced is passed as a prop, but we access it via a closure here
            const { isRebalanced: currentRebalanceState } = d3State.current.props;
            if (!currentRebalanceState) {
                 const { node, link } = d3State.current;
                node.attr("transform", d => `translate(${d.x},${d.y})`);
                link.attr("d", d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const mx = (d.source.x + d.target.x) / 2;
                    const my = (d.source.y + d.target.y) / 2;
                    const px = -dy / length;
                    const py = dx / length;
                    const offset = 30; 
                    const cx = mx + offset * px;
                    const cy = my + offset * py;
                    return `M${d.source.x},${d.source.y} Q${cx},${cy} ${d.target.x},${d.target.y}`;
                });
            }
        }

        function toggleChildren(d) {
            if (d.children) {
                d.children = null;
            } else {
                d.children = d._children;
            }
            update();
        }

        // --- INTERACTIVITY & UTILITIES ---
        function drag(simulation) {
            function dragstarted(event, d) {
                const { isRebalanced: currentRebalanceState } = d3State.current.props;
                if (currentRebalanceState) {
                    onRebalanceToggle(); // This will trigger a re-render and switch back to physics mode
                }
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
                const { isRebalanced: currentRebalanceState } = d3State.current.props;
                if (currentRebalanceState) {
                    d.fx = event.x;
                    d.fy = event.y;
                } else {
                    d.fx = null;
                    d.fy = null;
                }
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        const zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", (event) => g.attr("transform", event.transform));
        svg.call(zoom);

        function handleResize() {
            let { width, height, svg, simulation, rebalanceLayout } = d3State.current;
            const { isRebalanced: currentRebalanceState } = d3State.current.props;

            width = containerEl.clientWidth;
            height = containerEl.clientHeight;
            svg.attr("viewBox", [-width / 2, -height / 2, width, height]);
            if (currentRebalanceState) {
                rebalanceLayout();
            } else {
                simulation.force("center", d3.forceCenter(0, 0)).restart();
            }
            d3State.current.width = width;
            d3State.current.height = height;
        }
        window.addEventListener('resize', handleResize);

        // --- TEXT WRAPPING & SIZING ---
        function wrapAndSize(selection) {
            const PADDING = 10;
            const LINE_HEIGHT = 1.2; // ems
            const MAX_WIDTH = 200;

            selection.each(function(d) {
                const textEl = d3.select(this);
                const words = d.data.name.split(/\s+/);
                
                textEl.text(null);

                let tspan = textEl.append('tspan').attr('x', 0);
                tspan.text(d.data.name);

                if (tspan.node().getComputedTextLength() > MAX_WIDTH) {
                    tspan.text('');
                    let bestSplit = findBestSplitPoint(words);
                    const line1 = words.slice(0, bestSplit).join(' ');
                    const line2 = words.slice(bestSplit).join(' ');

                    textEl.append('tspan').attr('x', 0).text(line1);
                    textEl.append('tspan').attr('x', 0).attr('dy', `${LINE_HEIGHT}em`).text(line2);
                }

                const bbox = textEl.node().getBBox();
                d.width = bbox.width + PADDING * 2;
                d.height = bbox.height + PADDING * 2;

                textEl.attr('y', -bbox.height / 2 - bbox.y);
            });
        }
        
        function findBestSplitPoint(words) {
            let bestSplit = -1;
            let minDiff = Infinity;
            for (let i = 1; i < words.length; i++) {
                const line1Length = words.slice(0, i).join(' ').length;
                const line2Length = words.slice(i).join(' ').length;
                const diff = Math.abs(line1Length - line2Length);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestSplit = i;
                }
            }
            return bestSplit;
        }

        // --- LAYOUT FUNCTIONS ---
        function unfixAllNodes() {
            const { node } = d3State.current;
            node.each(d => {
                d.fx = null;
                d.fy = null;
            });
        }

        function rebalanceLayout() {
            let { simulation, svg, root, node, link, transitionDuration } = d3State.current;

            simulation.stop(); // Stop physics temporarily
            svg.transition().duration(transitionDuration).call(zoom.transform, d3.zoomIdentity);

            const allNodes = root.descendants().filter(d => d.parent ? d.parent.children : true);
            const centerNode = allNodes.find(d => d.data.type === 'center');
            if (!centerNode) return;

            centerNode.fx = 0;
            centerNode.fy = 0;

            let hasCollisions = true;
            let iterations = 0;
            const maxIterations = 50; 
            
            let radii = {
                1: Math.max(centerNode.width, centerNode.height) / 2 + 120,
                2: Math.max(centerNode.width, centerNode.height) / 2 + 320,
                3: Math.max(centerNode.width, centerNode.height) / 2 + 520
            };

            while (hasCollisions && iterations < maxIterations) {
                iterations++;
                hasCollisions = false;

                const strategicObjectives = allNodes.filter(d => d.data.type === 'strategicObjective');
                const strategicObjectiveAngleSlice = (2 * Math.PI) / strategicObjectives.length;

                strategicObjectives.forEach((strategicObj, i) => {
                    const strategicObjAngle = i * strategicObjectiveAngleSlice;
                    strategicObj.fx = radii[1] * Math.cos(strategicObjAngle);
                    strategicObj.fy = radii[1] * Math.sin(strategicObjAngle);

                    const tacticalKeyResults = strategicObj.children ? allNodes.filter(n => n.parent === strategicObj) : [];
                    if (tacticalKeyResults.length > 0) {
                        const tacticalKeyResultAngleSlice = strategicObjectiveAngleSlice / tacticalKeyResults.length;
                        const tacticalKeyResultStartAngle = strategicObjAngle - (strategicObjectiveAngleSlice / 2);

                        tacticalKeyResults.forEach((tacticalKeyResult, j) => {
                            const tacticalKeyResultAngle = tacticalKeyResultStartAngle + (j * tacticalKeyResultAngleSlice) + (tacticalKeyResultAngleSlice / 2);
                            tacticalKeyResult.fx = radii[2] * Math.cos(tacticalKeyResultAngle);
                            tacticalKeyResult.fy = radii[2] * Math.sin(tacticalKeyResultAngle);

                            const managerialKpis = tacticalKeyResult.children ? allNodes.filter(n => n.parent === tacticalKeyResult) : [];
                            if (managerialKpis.length > 0) {
                                const managerialKpiAngleSlice = tacticalKeyResultAngleSlice / managerialKpis.length;
                                const managerialKpiStartAngle = tacticalKeyResultAngle - (tacticalKeyResultAngleSlice / 2);

                                managerialKpis.forEach((managerialKpi, k) => {
                                    const managerialKpiAngle = managerialKpiStartAngle + (k * managerialKpiAngleSlice) + (managerialKpiAngleSlice / 2);
                                    managerialKpi.fx = radii[3] * Math.cos(managerialKpiAngle);
                                    managerialKpi.fy = radii[3] * Math.sin(managerialKpiAngle);
                                });
                            }
                        });
                    }
                });

                for (let i = 0; i < allNodes.length; i++) {
                    const d = allNodes[i];
                    const r1 = { x1: d.fx - d.width/2, y1: d.fy - d.height/2, x2: d.fx + d.width/2, y2: d.fy + d.height/2 };
                    for (let j = i + 1; j < allNodes.length; j++) {
                        const q = allNodes[j];
                        const r2 = { x1: q.fx - q.width/2, y1: q.fy - q.height/2, x2: q.fx + q.width/2, y2: q.fy + q.height/2 };
                        if (r1.x1 < r2.x2 && r1.x2 > r2.x1 && r1.y1 < r2.y2 && r1.y2 > r2.y1) {
                            hasCollisions = true;
                            break; 
                        }
                    }
                    if (hasCollisions) break;
                }

                if (hasCollisions) {
                    const radiusIncrement = 10;
                    radii[1] += radiusIncrement;
                    radii[2] += radiusIncrement * 1.5;
                    radii[3] += radiusIncrement * 2.0;
                }
            }
            
            allNodes.forEach(d => {
                d.x = d.fx;
                d.y = d.fy;
            });
            simulation.nodes(allNodes);
            simulation.alpha(0.3).restart();

            node.transition().duration(transitionDuration)
                .attr("transform", d => `translate(${d.fx},${d.fy})`);
                
            const links = root.links().filter(d => d.source.children && d.target.parent.children);
            link = link.data(links, d => d.target.id);
            link.transition().duration(transitionDuration)
                .attr("d", d => {
                    const dx = d.target.fx - d.source.fx;
                    const dy = d.target.fy - d.source.fy;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const mx = (d.source.fx + d.target.fx) / 2;
                    const my = (d.source.fy + d.target.fy) / 2;
                    const px = -dy / length;
                    const py = dx / length;
                    const offset = 30; 
                    const cx = mx + offset * px;
                    const cy = my + offset * py;
                    return `M${d.source.fx},${d.source.fy} Q${cx},${cy} ${d.target.fx},${d.target.fy}`;
                });
             d3State.current.link = link;
        }

        // Cleanup function for when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            simulation.stop();
        };
    }, [data]); // The effect depends on the data prop. It will re-run if data changes.

    useEffect(() => {
        // This effect runs whenever the isRebalanced prop changes
        if (d3State.current.update) {
            // Store the prop in the ref so the D3 closures can access the latest value
            d3State.current.props = { isRebalanced };

            if (isRebalanced) {
                d3State.current.rebalanceLayout();
            } else {
                d3State.current.unfixAllNodes();
                d3State.current.update();
            }
        }
    }, [isRebalanced]);

    return <svg ref={svgRef}></svg>;
};

// --- UI Components ---

const Legend = () => (
    <div className="legend absolute bottom-5 right-5 bg-white bg-opacity-70 backdrop-blur-sm p-4 rounded-lg shadow-lg text-gray-800 pointer-events-none">
        <h4 className="font-bold text-sm mb-2">Legend</h4>
        <div className="space-y-2">
            <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3" style={{ background: '#34D399' }}></div><span className="text-xs">Intrinsic Enterprise Value</span>
            </div>
            <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3" style={{ background: '#60A5FA' }}></div><span className="text-xs">Strategic Objective</span>
            </div>
            <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3" style={{ background: '#FBBF24' }}></div><span className="text-xs">Tactical Key Result</span>
            </div>
            <div className="flex items-center">
                <div className="w-4 h-4 rounded mr-3" style={{ background: '#A78BFA' }}></div><span className="text-xs">Managerial KPI</span>
            </div>
        </div>
    </div>
);

const Controls = ({ isRebalanced, onToggle }) => (
    <button
        onClick={onToggle}
        className="absolute bottom-5 left-5 bg-gray-200 text-gray-700 hover:bg-gray-900 hover:text-gray-100 font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-300 border border-gray-700 hover:border-gray-100"
    >
        {isRebalanced ? 'Use Physics' : 'Rebalance'}
    </button>
);


// --- Main App Component ---
export default function App() {
    // State to control the layout mode of the mind map
    const [isRebalanced, setIsRebalanced] = useState(false);

    const handleToggleRebalance = () => {
        setIsRebalanced(prev => !prev);
    };

    return (
        <>
            {/* These styles are the same as the original HTML file */}
            <style>{`
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background-color: #f3f4f6;
                    overflow: hidden;
                }
                .link {
                    fill: none;
                    stroke: #9ca3af;
                    stroke-opacity: 0.6;
                    stroke-width: 1.5px;
                }
                .node {
                    cursor: pointer;
                }
                .node rect {
                    transition: filter 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease;
                    stroke-width: 2px;
                }
                .node:hover rect {
                    filter: brightness(1.1);
                }
                .node-label {
                    font-size: 12px;
                    fill: #1f2937;
                    pointer-events: none;
                    user-select: none;
                }
                .center-label { font-size: 16px; font-weight: 700; }
                .strategicObjective-label { font-size: 14px; font-weight: 600; }
                .tacticalKeyResult-label { font-size: 13px; }
                .managerialKpi-label { font-size: 12px; }
            `}</style>

            <div id="container" className="w-screen h-screen relative">
                <MindMap 
                    data={sourceData} 
                    isRebalanced={isRebalanced} 
                    onRebalanceToggle={handleToggleRebalance} 
                />
                <Legend />
                <Controls isRebalanced={isRebalanced} onToggle={handleToggleRebalance} />
            </div>
        </>
    );
}
