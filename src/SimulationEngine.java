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
    public double computeStabilityIndex() {

        double maxLoading = 0.0;

        for (TransmissionLine e : grid.getEdges()) {

            double loading = Math.abs(e.getFlow()) / e.getCapacity();

            if (loading > maxLoading) {
                maxLoading = loading;
            }
        }

        return 1.0 - maxLoading;
    }
    public double getTotalGridLoad() {
        double totalLoad = 0.0;

        // Summing up demand from all nodes in the current grid
        for (PowerNode node : grid.getNodes()) {
            totalLoad += node.getDemand();
        }

        return totalLoad;
    }
    public double getEfficiency()
    {
        grid.solveDCFlow();
        return grid.computeCongestionEfficiency();
    }

    public void step() {
        randomizeDemand();
        grid.solveDCFlow();
    }
}
