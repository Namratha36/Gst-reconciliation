import { getOrEmpty } from "@/services/http";
import type { GraphEdge, GraphNode } from "@/types/domain";

export interface GraphDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphService {
  getGraph(): Promise<GraphDataset>;
}

export const graphService: GraphService = {
  async getGraph() {
    return getOrEmpty<GraphDataset>("/graph", { nodes: [], edges: [] });
  },
};
