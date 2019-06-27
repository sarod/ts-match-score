import "./ForceGraph.css";
import React, { useEffect, useRef, useMemo, useState } from "react";
import * as d3Force from "d3-force";
import { SimulationNodeDatum, SimulationLinkDatum, ForceLink } from "d3-force";
import * as d3Selection from "d3-selection";

import { GraphState } from "../state/GraphState";
import { range } from "../utils";
import { colorForScore } from "../colorForScore";
import { keyBy } from "lodash";

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
  const svgRef = useRef<SVGSVGElement>(null);
  let [previousGraphData, setPreviousGraphData] = useState<GraphData | null>(
    null
  );

  const graphData = useMemo(
    () => buildGraphData(graphState, previousGraphData),
    // previousGraphData is omitied on purpose here... This is a code smell but I can't figure it out
    [graphState]
  );
  if (previousGraphData !== graphData) {
    setPreviousGraphData(graphData);
  }

  const svgElement: SVGSVGElement | null = svgRef.current;
  useEffect(() => {
    if (svgElement === null) {
      return;
    }
    const simulation = d3Force
      .forceSimulation<NodeDatum, LinkDatum>()
      .force(
        "link",
        d3Force
          .forceLink()
          .id((node: SimulationNodeDatum) => (node as NodeDatum).nodeName)
          .distance(
            (link: any) => 30 + (1 - (link as LinkDatum).score / 100) * 100
          )
      )
      .force("collide", d3Force.forceCollide(nodeRadius * 1.5))
      .force("charge", d3Force.forceManyBody().strength(() => -10))
      .force("center", d3Force.forceCenter(width / 2, height / 2));

    const svgSel = d3Selection.select(svgElement);
    const linkSel = svgSel
      .append("g")
      .attr("class", "ForceGraph__Links")
      .selectAll("line")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("stroke", (d: LinkDatum) => colorForScore(d.score));
    linkSel.append("title").text(function(d: LinkDatum) {
      return d.edgeId + ": " + d.score;
    });

    const nodeGroupSel = svgSel
      .append("g")
      .attr("class", "ForceGraph__Nodes")
      .selectAll("g")
      .data(graphData.nodes)
      .enter()
      .append("g")
      .attr("class", "ForceGraph__NodeGroup");

    nodeGroupSel
      .append("circle")
      .attr("class", "ForceGraph__NodeCircle")
      .attr("cx", nodeRadius / 2)
      .attr("cy", nodeRadius / 2)
      .attr("r", nodeRadius);

    nodeGroupSel
      .append("text")
      .attr("class", "ForceGraph__NodeText")
      .attr("x", nodeRadius / 2)
      .attr("y", nodeRadius / 2)
      .text(d => d.nodeName);

    nodeGroupSel.append("title").text(d => d.nodeName);
    //.call(createDragCall(simulation))

    simulation.nodes(graphData.nodes).on("tick", ticked);
    const forceLink = simulation.force("link") as d3Force.ForceLink<
      NodeDatum,
      LinkDatum
    >;
    forceLink.links(graphData.links);
    function ticked() {
      linkSel
        .attr("x1", function(d: LinkDatum) {
          return (d.source as NodeDatum).x as number;
        })
        .attr("y1", function(d: LinkDatum) {
          return (d.source as NodeDatum).y as number;
        })
        .attr("x2", function(d: LinkDatum) {
          return (d.target as NodeDatum).x as number;
        })
        .attr("y2", function(d: LinkDatum) {
          return (d.target as NodeDatum).y as number;
        });

      nodeGroupSel.attr("transform", function(d: NodeDatum) {
        return `translate(${(d.x as number) -
          nodeRadius / 2},${(d.y as number) - nodeRadius / 2})`;
      });
    }
    return () => {
      simulation.stop();
      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
      }
      // TODO remove previous nodes?
    };
  }, [width, height, svgElement, graphData]);

  return <svg width={width} height={height} ref={svgRef}></svg>;
};
