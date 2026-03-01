import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.*;

public class GridServer {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        ObjectMapper mapper = new ObjectMapper();
        PowerGrid grid = new PowerGrid();

        // 1. DATA ROUTE: Fetch the whole grid
        server.createContext("/api/grid", (exchange) -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            Map<String, Object> data = new HashMap<>();
            data.put("nodes", grid.getNodes());
            data.put("edges", new ArrayList<>());

            byte[] response = mapper.writeValueAsBytes(data);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
            exchange.close();
        });

        // 2. ACTION ROUTE: Add a single node
        // This handles both /api/add-node and /api/node/add logic in ONE place
        server.createContext("/api/node/add", (exchange) -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    PowerNode newNode = mapper.readValue(exchange.getRequestBody(), PowerNode.class);
                    grid.addNode(newNode);
                    System.out.println("⚡ Received Node: " + newNode.getId());

                    String response = "{\"status\":\"success\"}";
                    exchange.sendResponseHeaders(200, response.length());
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(response.getBytes());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    exchange.sendResponseHeaders(500, -1);
                }
            }
            exchange.close();
        });
        server.createContext("/api/node/update", (exchange) -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                PowerNode updatedNode = mapper.readValue(exchange.getRequestBody(), PowerNode.class);

                // Logic to find and update the node in your list
                grid.updateNode(updatedNode);

                System.out.println("🔄 Updated Node " + updatedNode.getId() + ": Gen=" + updatedNode.getGeneration());

                String response = "{\"status\":\"updated\"}";
                exchange.sendResponseHeaders(200, response.length());
                exchange.getResponseBody().write(response.getBytes());
            }
            exchange.close();
        });

        server.setExecutor(null);
        server.start();
        System.out.println("Server successfully started on port 8080");
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }
    
}