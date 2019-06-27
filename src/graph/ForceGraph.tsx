import * as d3Force from "d3-force";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { keyBy } from "lodash";
import React, { useMemo } from "react";
import { colorForScore } from "../colorForScore";
import { GraphState } from "../state/GraphState";
import { range } from "../utils";
import "./ForceGraph.css";

type NodeDatum = SimulationNodeDatum & {
  nodeName: string;
};

type LinkDatum = SimulationLinkDatum<NodeDatum> & {
  edgeId: string;
  score: number;
};

type GraphData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
};

const buildGraphData = (
  graphState: GraphState,
  previousGraphData: GraphData | null
): GraphData => {
  const oldNodes = keyBy(
    previousGraphData ? previousGraphData.nodes : [],
    n => n.nodeName
  );

  const nodes: NodeDatum[] = graphState.vertexNames.map((name, index) => {
    const node: NodeDatum = {
      nodeName: name,
      index: index
    };
    const oldNode = oldNodes[name];
    if (oldNode) {
      node.x = oldNode.x;
      node.y = oldNode.y;
    }
    return node;
  });

  const n = graphState.nbVertex();
  const links: LinkDatum[] = [];
  for (let x of range(0, n)) {
    for (let y of range(x + 1, n)) {
      const score = graphState.score100(x, y);
      if (score !== 0) {
        links.push({
          edgeId: graphState.vertexName(x) + "-" + graphState.vertexName(y),
          source: graphState.vertexName(x),
          target: graphState.vertexName(y),
          score
        });
      }
    }
  }
  return { links, nodes };
};

const nodeRadius = 20;
export const ForceGraph = ({
  graphState,
  width = 400,
  height = 400
}: {
  graphState: GraphState;
  width?: number;
  height?: number;
}) => {
  const { simulation, forceCenter, forceLink } = useMemo(() => {
    const nodes: NodeDatum[] = [];
    const links: LinkDatum[] = [];
    const useDecayingLinkStength = false;
    const forceLink = d3Force
      .forceLink<NodeDatum, LinkDatum>()
      .id((node: NodeDatum) => node.nodeName);
    // SHould we use a decaying strength instead
    if (useDecayingLinkStength) {
      forceLink
        .distance(() => 10)
        .strength(link => (link.score * link.score) / (100 * 100));
    } else {
      forceLink.distance(link => 30 + (1 - link.score / 100) * 100);
    }
    const forceCenter = d3Force.forceCenter();
    const simulation = d3Force
      .forceSimulation<NodeDatum, LinkDatum>()
      .force("link", forceLink)
      .force("collide", d3Force.forceCollide(nodeRadius * 1.5))
      .force("charge", d3Force.forceManyBody().strength(() => 15))
      .force("center", forceCenter)
      .stop()
      .nodes(nodes);
    forceLink.links(links);
    return { simulation, forceCenter, forceLink };
  }, []);

  const { updatedNodes, updatedLinks } = useMemo(() => {
    // Update simulation
    const previousNodes: NodeDatum[] = simulation.nodes();
    const previousLinks: LinkDatum[] = forceLink.links();
    const { nodes: updatedNodes, links: updatedLinks } = buildGraphData(
      graphState,
      { nodes: previousNodes, links: previousLinks }
    );
    // Reconfigure simulation
    forceCenter.x(width / 2);
    forceCenter.y(height / 2);
    simulation.nodes(updatedNodes);
    forceLink.links(updatedLinks);

    // Run simulation
    simulation.alpha(1);
    for (var i = 0; i < 300; ++i) simulation.tick();
    console.log("nodes", updatedNodes);
    console.log("links", updatedLinks);

    return { updatedNodes, updatedLinks };
  }, [simulation, graphState, height, width, forceCenter, forceLink]);

  return (
    <svg width={width} height={height}>
      <g className="ForceGraph__Links">
        {updatedLinks.map(link => (
          <line
            key={link.edgeId}
            className="ForceGraph__Link"
            stroke={colorForScore(link.score)}
            x1={(link.source as NodeDatum).x as number}
            y1={(link.source as NodeDatum).y as number}
            x2={(link.target as NodeDatum).x as number}
            y2={(link.target as NodeDatum).y as number}
          />
        ))}
      </g>
      <g className="ForceGraph__Nodes">
        {updatedNodes.map(node => (
          <g
            key={node.nodeName}
            className="ForceGraph__NodeGroup"
            transform={`translate(${(node.x as number) -
              nodeRadius / 2},${(node.y as number) - nodeRadius / 2})`}
          >
            <circle
              className="ForceGraph__NodeCircle"
              cx={nodeRadius / 2}
              cy={nodeRadius / 2}
              r={nodeRadius}
            ></circle>
            <text
              className="ForceGraph__NodeText"
              x={nodeRadius / 2}
              y={nodeRadius / 2}
            >
              {node.nodeName}
            </text>
            <title>{node.nodeName}</title>
          </g>
        ))}
      </g>
    </svg>
  );
};

// nodes.fo;
// const svgRef = useRef<SVGSVGElement>(null);
// let [previousGraphData, setPreviousGraphData] = useState<GraphData | null>(
//   null
// );

// const graphData = useMemo(
//   () => buildGraphData(graphState, previousGraphData),
//   // previousGraphData is omitied on purpose here... This is a code smell but I can't figure it out
//   [graphState]
// );
// if (previousGraphData !== graphData) {
//   setPreviousGraphData(graphData);
// }

// const svgElement: SVGSVGElement | null = svgRef.current;
// useEffect(() => {
//   if (svgElement === null) {
//     return;
//   }

//   forceLink.links(graphData.links);
//   for (var i = 0; i < 300; ++i) simulation.tick();

//   const svgSel = d3Selection.select(svgElement);
//   const linkSel = svgSel
//     .append("g")
//     .attr("class", "ForceGraph__Links")
//     .selectAll("line")
//     .data(graphData.links)
//     .enter()
//     .append("line")
//     .attr("stroke", (d: LinkDatum) => colorForScore(d.score));
//   linkSel.append("title").text(function(d: LinkDatum) {
//     return d.edgeId + ": " + d.score;
//   });

//   const nodeGroupSel = svgSel
//     .append("g")
//     .attr("class", "ForceGraph__Nodes")
//     .selectAll("g")
//     .data(graphData.nodes)
//     .enter()
//     .append("g")
//     .attr("class", "ForceGraph__NodeGroup");

//   nodeGroupSel
//     .append("circle")
//     .attr("class", "ForceGraph__NodeCircle")
//     .attr("cx", nodeRadius / 2)
//     .attr("cy", nodeRadius / 2)
//     .attr("r", nodeRadius);

//   nodeGroupSel
//     .append("text")
//     .attr("class", "ForceGraph__NodeText")
//     .attr("x", nodeRadius / 2)
//     .attr("y", nodeRadius / 2)
//     .text(d => d.nodeName);

//   nodeGroupSel.append("title").text(d => d.nodeName);
//   //.call(createDragCall(simulation))

//   function ticked() {
//     linkSel
//       .attr("x1", function(d: LinkDatum) {
//         return (d.source as NodeDatum).x as number;
//       })
//       .attr("y1", function(d: LinkDatum) {
//         return (d.source as NodeDatum).y as number;
//       })
//       .attr("x2", function(d: LinkDatum) {
//         return (d.target as NodeDatum).x as number;
//       })
//       .attr("y2", function(d: LinkDatum) {
//         return (d.target as NodeDatum).y as number;
//       });

//     nodeGroupSel.attr("transform", function(d: NodeDatum) {
//       return `translate(${(d.x as number) -
//         nodeRadius / 2},${(d.y as number) - nodeRadius / 2})`;
//     });
//   }
//   return () => {
//     simulation.stop();
//     while (svgElement.firstChild) {
//       svgElement.removeChild(svgElement.firstChild);
//     }
//     // TODO remove previous nodes?
//   };
// }, [width, height, svgElement, graphData]);
