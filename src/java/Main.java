import java.util.concurrent.*;

public class Main {

    public static void main(String[] args) {

        PowerGrid grid = new PowerGrid();

        // Create nodes
        for (int i = 0; i < 5; i++) {
            grid.addNode(new PowerNode(i));
        }

        // Slack node
        grid.getNodes().get(0).setSlack(true);

        // Add edges
        grid.addEdge(new TransmissionLine(0,1,0.5,10));
        grid.addEdge(new TransmissionLine(1,2,0.4,10));
        grid.addEdge(new TransmissionLine(2,3,0.3,10));
        grid.addEdge(new TransmissionLine(3,4,0.6,10));
        grid.addEdge(new TransmissionLine(4,0,0.5,10));

        SimulationEngine engine = new SimulationEngine(grid);
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


            // Schedule a task to run every 1 second
            scheduler.scheduleAtFixedRate(() -> {
                engine.step();// update simulation
            }, 0, 2, TimeUnit.SECONDS);


    }
}