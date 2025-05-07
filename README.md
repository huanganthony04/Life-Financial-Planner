# Life Financial Planner
## Team Big Dawgs

To set up this project:

This project requires the following installed and running on the system:
- RabbitMQ, running on port 5672
- MongoDB, running on port 27017
- Node.js and npm

Installation and Deployment:
1. Download and unzip the code.
2. Navigate to the server directory and make a copy of the '.env.template' file, renaming it to .env.
3. Add any alphanumeric value to the SESSION_SECRET environment variable inside the .env file.
4. In the server directory, run 'npm i' in the terminal to download dependencies.
5. Run 'npm i -g nodemon' to install the nodemon tool. Alternatively, edit package.json "scripts"."start" from "nodemon server.js" to "node server.js".
6. Still in the server directory, start the server by running 'npm start', and create a new terminal for the next steps.
8. Navigate to the client directory and make a copy of the '.env.template' file, renaming it to .env.
9. In the client directory, run 'npm i' in the terminal to download dependencies.
10. Still in the client directory, run 'npm run dev' in the terminal to start the frontend.
11. Access localhost:5173 in the browser. The application is now available.

   
