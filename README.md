# Elif - Simple ExtJS Chess Elo tracking App 
This is simple Chess Elo tracking app written in ExtJS 6.5 Modern using Sencha Architect
and has backend written in NodeJS

## Run the project:

**Front-end**
You can download build front-end from https://github.com/petrvecera/ChessEloApp/releases as App.zip  
This can be deployed on the webserver. There is url for the backend `http://chess.pagep.net:8181` you can change this url in the source to the url you will need.

**Backend**
Just run in the backend folder:  
`npm install`  
`npm start`   

## Dev:
- The front end is written in ExtJS 6.5 Modern using Sencha Architect 4.2  
Thus you will need SA if you want to commit any changes. Or just pick up the app and continue
the independent ExtJS dev without SA.
- The back end is written in NodeJS
   - We are not using any DB, just simple .json 

#### Gettings started:
Frontend:
- Copy the ext 6.5.2 framework into App/ext/
- Copy the premium addons (pivot grid, D3 HeatMap)
- Open the .xds project file in SA

Backend:
- Just open `main.js` in any editor you like

#### Build and install:
- Edit the url to the service backend in the stores in the app
- Bulding the `sencha app build production` in the app folder or use SA
- Copy the `App/build/production` folder to the web server
- Install NodeJS for the backend, copy the backend folder to the server
- Edit the player.json if needed
- Run `npm install`
- Run using `node main.js`


### Disclaimer:
**This is quickly written app. We don't think the approach to many used solution in the frontend / backend / API structure is the best one. 
We wanted to play chess not to create an app.**
 
#### Authors:
- Petr Vecera - Main ExtJS front-end in SA
- Pavel Zaruba -  Backend in the NodeJS
- Anyone else improving the app using additional commits 


### Examples:

![Example main app page](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/main.png)
![Elo chart example](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/elo_chart.png)
![Add new match example](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/addNewMatch.png)
![Heat map example](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/heatMap.png)
![Score system page](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/scoreSystem.png)
![Example dev env in SA](https://raw.githubusercontent.com/petrvecera/ChessEloApp/master/examples/SAExample.png)
