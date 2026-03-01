public class TransmissionLine {

    private int from;
    private int to;
    private static final double reactivity = 0.3;//this is our impedence per kilometer metric

    private  double reactance;//this will be our impedence
    private  double capacity;

    private double flow;

    public TransmissionLine(int from, int to, double distance, double capacity) {
        this.from = from;
        this.to = to;
        this.reactance = distance * reactivity;
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