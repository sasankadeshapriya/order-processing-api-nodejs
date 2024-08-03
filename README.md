# Order Processing API NodeJS

A RESTful API providing endpoints for CRUD operations and user authentication, supporting the integration between the web and mobile applications.

## How to Setup on local

01. Clone the Repository
	```bash
	git clone https://github.com/sasankadeshapriya/order-processing-api-nodejs.git
	cd order-processing-api-nodejs
	

02. Create `nodemon.json` File<br>
In the root directory of the project, create a file called nodemon.json and add the following content. Replace the placeholder values with your actual values:
	```json
	{
    	"env": {
        	"JWT_KEY": "I$^%6szhGUMLNv",
        	"EMAIL_USER": "verification@test.com",
        	"EMAIL_PASS": "ss@~*9eR;",
        	"PORT": 4000,
        	"EMAIL_HOST": "mail.test.com",
        	"EMAIL_PORT": 465,
        	"DB_USERNAME": "root",
        	"DB_PASSWORD": null,
        	"DB_DATABASE": "order_processing_system",
        	"DB_HOST": "127.0.0.1",
        	"DB_DIALECT": "mysql"
    		}
	}

03. Install Dependencies
	```bash
	npm install

03. Start the Server
	```bash
	npm start

04. Verify the Setup<br>
Open your browser and navigate to `http://localhost:4000`. You should see a message indicating that the server is working!
