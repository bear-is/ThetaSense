import java.util.Random;

public class SimulationEngine {

    private PowerGrid grid;
    private Random random = new Random();

    public SimulationEngine(PowerGrid grid) {
        this.grid = grid;
    }

    public void randomizeDemand() {
        for (PowerNode node : grid.getNodes()) {
            double demand = node.getDemand() + random.nextDouble() % 10;
            node.setDemand(demand);
            node.updateNetInjection();
        }
    }

    public void step() {
        randomizeDemand();
        grid.solveDCFlow();
        double efficiency = grid.computeCongestionEfficiency();
        System.out.println("Efficiency: " + efficiency);
    }
}
