import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import com.google.gson.Gson;

@ServerEndpoint("/graphsocket")
public class GraphSocket {
    @OnOpen
    public void onOpen(Session session) {
        new Thread(() -> {
            try {
                while(true) {
                    GraphData data = new GraphData(); // fill with dynamic data
                    session.getBasicRemote().sendText(new Gson().toJson(data));
                    Thread.sleep(1000); // send every second
                }
            } catch(Exception e){ e.printStackTrace(); }
        }).start();
    }
}