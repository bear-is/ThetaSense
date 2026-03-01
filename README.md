ThetaSense is a new web app that allows for construction of power networks
The backend is written in Java and pipes the network information to the front end using webhooks and post requests in GridServer.java.  
The front end is a web app built in Node.js and react.  We used D3 to represent the network and allow you to connect nodes together to simulate power demands
We set a random tick updater to simulate changes in power demand, as well as using a matrix to solve for a network efficiency quotient.  
The main idea is to be able to create a power distribution network and see how efficiency changes with new node positioning as well as new transmission lines.
The data is stored in a directed graph where nodes represent power generators as well as power demands, and the edges are the transmission lines.  
The transmission lines have a certain amount of impedance (we just used 0.3 ohm/km as a sample but this would be different in practice) which in turn helps to determine network efficiency.  



To run:
install npm: npmjs.com
install VITE npm create vite@latest my-project idk just figure it out i guess
run the node from the source folder using  npm run dev
build and run the backend server PowerGrid.java
open the locally hosted website (http://localhost:5173/)
