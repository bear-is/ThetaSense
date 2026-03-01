import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TransmissionLine {

    private int from;
    private int to;
    private int distance;
    private static final double reactivity = 0.3;//this is our impedence per kilometer metric

    private  double reactance;//this will be our impedence
    private  double capacity;

    private double flow;
    public TransmissionLine()
    {

    }

    public TransmissionLine(int from, int to, double distance, double capacity) {
        this.from = from;
        this.to = to;
        this.reactance = distance * reactivity;
        this.capacity = capacity;
    }

    public void computeFlow(PowerNode n1, PowerNode n2) {
        this.flow = (n1.getVoltageAngle() - n2.getVoltageAngle()) / reactance;//only worry about this if we are considering phase difference which for us is not currently needed
    }

    public double getUtilization() {
        return Math.abs(flow) / capacity;
    }
    public double getReactance()
    {
        return reactance;   
    }
    public void setTo(int to)
    {
        this.to = to;
    }
    public void setFrom(int from)
    {
        this.from = from;
    }
    public void setCapacity(int capacity)
    {
        this.capacity = capacity;
    }
    public void setDistance(int distance)
    {
        this.distance = distance;
        this.reactance = distance * reactivity;
    }

    // Getters
    public int getFrom() { return from; }
    public int getTo() { return to; }
    public double getFlow() { return flow; }
    public double getCapacity() {
        return capacity;
    }
    public int getDistance(){
        return distance;
    }
}