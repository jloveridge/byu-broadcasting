import { createServer } from 'http';
import { app } from './app';
import { loadData } from './restaurant';

const db = loadData( require('../data/rest_hours.json') );
const port = parseInt( process.env.PORT || '4040', 10 );

app.set( 'db', db );
app.set( 'port', port );

const server = createServer( app );

server.listen( port, () => {
    console.log(`Server is running on port: ${port}`);
});
