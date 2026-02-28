import java.util.*;

public class PowerGrid {

    private List<PowerNode> nodes = new ArrayList<>();
    private List<TransmissionLine> edges = new ArrayList<>();

    public void addNode(PowerNode node) {
        nodes.add(node);
    }
    public List<PowerNode> getNodes()
    {
        return nodes;
    }

    public void addEdge(TransmissionLine edge) {
        edges.add(edge);
    }

    public void solveDCFlow() {

        int n = nodes.size();

        double[][] L = buildLaplacian();

        double[] P = new double[n];
        for (int i = 0; i < n; i++) {
            P[i] = nodes.get(i).getNetInjection();
        }

        // Slack node = 0 (remove first row/column)
        double[][] Lr = new double[n - 1][n - 1];
        double[] Pr = new double[n - 1];

        for (int i = 1; i < n; i++) {
            Pr[i - 1] = P[i];
            for (int j = 1; j < n; j++) {
                Lr[i - 1][j - 1] = L[i][j];
            }
        }

        double[] theta = solveLinearSystem(Lr, Pr);

        nodes.get(0).setVoltageAngle(0.0);
        for (int i = 1; i < n; i++) {
            nodes.get(i).setVoltageAngle(theta[i - 1]);
        }

        computeEdgeFlows();
    }

    private double[][] buildLaplacian() {

        int n = nodes.size();
        double[][] L = new double[n][n];

        for (TransmissionLine e : edges) {
            int i = e.getFrom();
            int j = e.getTo();

            double b = 1.0 / e.getReactance();

            L[i][i] += b;
            L[j][j] += b;
            L[i][j] -= b;
            L[j][i] -= b;
        }

        return L;
    }

    private void computeEdgeFlows() {
        for (TransmissionLine e : edges) {
            PowerNode n1 = nodes.get(e.getFrom());
            PowerNode n2 = nodes.get(e.getTo());
            e.computeFlow(n1, n2);
        }
    }

    public double computeCongestionEfficiency() {
        double total = 0;
        for (TransmissionLine e : edges) {
            total += e.getUtilization();
        }
        double avg = total / edges.size();
        return 1.0 - avg;
    }

    // Simple Gaussian elimination
    private double[] solveLinearSystem(double[][] A, double[] b) {
        int n = b.length;

        for (int p = 0; p < n; p++) {
            for (int i = p + 1; i < n; i++) {
                double alpha = A[i][p] / A[p][p];
                b[i] -= alpha * b[p];
                for (int j = p; j < n; j++) {
                    A[i][j] -= alpha * A[p][j];
                }
            }
        }

        double[] x = new double[n];
        for (int i = n - 1; i >= 0; i--) {
            double sum = 0.0;
            for (int j = i + 1; j < n; j++) {
                sum += A[i][j] * x[j];
            }
            x[i] = (b[i] - sum) / A[i][i];
        }

        return x;
    }
}