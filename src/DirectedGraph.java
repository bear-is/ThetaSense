import java.util.*;

/**
 * A directed graph that uses generics to store any data type.
 * @param <T> The type of data stored in the vertices.
 */
public class DirectedGraph<T> {

    // Map to store the adjacency list: Vertex -> List of Neighbors
    private final Map<T, List<T>> adjacencyMap;

    public DirectedGraph() {
        this.adjacencyMap = new HashMap<>();
    }

    /**
     * Adds a new vertex to the graph if it doesn't already exist.
     */
    public void addVertex(T vertex) {
        adjacencyMap.putIfAbsent(vertex, new ArrayList<>());
    }

    /**
     * Adds a directed edge from source to destination.
     * Automatically adds vertices if they don't exist.
     */
    public void addEdge(T source, T destination) {
        addVertex(source);
        addVertex(destination);
        adjacencyMap.get(source).add(destination);
    }

    /**
     * Returns a list of vertices that the given vertex points to.
     */
    public List<T> getNeighbors(T vertex) {
        return adjacencyMap.getOrDefault(vertex, Collections.emptyList());
    }

    /**
     * Returns all vertices in the graph.
     */
    public Set<T> getAllVertices() {
        return adjacencyMap.keySet();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (T v : adjacencyMap.keySet()) {
            sb.append(v).append(" -> ").append(adjacencyMap.get(v)).append("\n");
        }
        return sb.toString();
    }
}