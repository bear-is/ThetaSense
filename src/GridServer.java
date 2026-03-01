import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class GridServer {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        ObjectMapper mapper = new ObjectMapper();
        PowerGrid grid = new PowerGrid();
        SimulationEngine engine = new SimulationEngine(grid);
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


        // Schedule a task to run every 1 second
        scheduler.scheduleAtFixedRate(() -> {
            engine.step();// update simulation
        }, 0, 2, TimeUnit.SECONDS);

        // 1. DATA ROUTE: Fetch the whole grid
        server.createContext("/api/grid", (exchange) -> {
            try {
                addCorsHeaders(exchange);
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(204, -1);
                    exchange.close();
                    return;
                }

                Map<String, Object> data = new HashMap<>();
                data.put("nodes", grid.getNodes());
                data.put("edges", grid.getEdges());

                byte[] response = mapper.writeValueAsBytes(data);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response);
                }
                exchange.close();

            } catch (Exception e) {
                e.printStackTrace();   // prints errors

                try {
                    exchange.sendResponseHeaders(500, -1);
                } catch (Exception ignored) {
                }
            } finally {
                exchange.close();
            }
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
        server.createContext("/api/line/add", (exchange) -> {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                try {
                    TransmissionLine newLine = mapper.readValue(exchange.getRequestBody(), TransmissionLine.class);
                    grid.addEdge(newLine);
                    System.out.println("⚡ Received Line: " + newLine.getFrom() + " to " + newLine.getTo());

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
        // 3. SIMULATION DATA ROUTE: Fetch real-time metrics/colors
        server.createContext("/api/simulation/results", (exchange) -> {
            try {

                addCorsHeaders(exchange);
                if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(204, -1);
                    return;
                }

                // Get the latest computed state from your engine
                Map<String, Object> updates = new HashMap<>();
                updates.put("totalGridLoad", engine.getTotalGridLoad());
                updates.put("efficiencyQuotient", engine.getEfficiency());
                updates.put("systemStability", engine.computeStabilityIndex());

                byte[] response = mapper.writeValueAsBytes(updates);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response);
                }
            } catch (Exception e) {
                e.printStackTrace();
                exchange.sendResponseHeaders(500, -1);
            } finally {
                exchange.close();
            }
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