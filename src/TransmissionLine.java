import java.util.concurrent.TransferQueue;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)

public class TransmissionLine {

    private int from;
    private int to;
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

    // Getters
    public int getFrom() { return from; }
    public int getTo() { return to; }
    public double getFlow() { return flow; }
}