public class TransmissionLine {

    private final int from;
    private final int to;

    private final double reactance;
    private final double capacity;

    private double flow;

    public TransmissionLine(int from, int to, double reactance, double capacity) {
        this.from = from;
        this.to = to;
        this.reactance = reactance;
        this.capacity = capacity;
    }

    public void computeFlow(PowerNode n1, PowerNode n2) {
        this.flow = (n1.getVoltageAngle() - n2.getVoltageAngle()) / reactance;
    }

    public double getUtilization() {
        return Math.abs(flow) / capacity;
    }
    public double getReactance()
    {
        return reactance;   
    }

    // Getters
    public int getFrom() { return from; }
    public int getTo() { return to; }
    public double getFlow() { return flow; }
}