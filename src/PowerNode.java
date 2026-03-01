import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PowerNode {


    private int id;

    private double demand;       // positive means load
    private double generation;   // positive means produced power
    private double netInjection; // generation - demand

    private double voltageAngle; // theta

    private boolean slack;       // reference node
    private String name;
    private static int nextId = 1;

    public PowerNode() {
        this.id = ++nextId;
    }

    public PowerNode(int id) {
        this.id = id;
    }

    public PowerNode(int id, String name) {
        this(id);
        this.name = name;
    }

    public void updateNetInjection() {
        this.netInjection = generation - demand;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public double getDemand() {
        return demand;
    }

    public void setDemand(double demand) {
        this.demand = demand;
    }

    public double getGeneration() {
        return generation;
    }

    public void setGeneration(double generation) {
        this.generation = generation;
    }

    public double getNetInjection() {
        return netInjection;
    }

    public double getVoltageAngle() {
        return voltageAngle;
    }

    public void setVoltageAngle(double voltageAngle) {
        this.voltageAngle = voltageAngle;
    }

    public boolean isSlack() {
        return slack;
    }

    public void setSlack(boolean slack) {
        this.slack = slack;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}